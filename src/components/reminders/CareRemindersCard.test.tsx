// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Doc } from 'convex/_generated/dataModel'
import { CareRemindersCard } from './CareRemindersCard'
import { HorseCareRemindersView } from './HorseCareRemindersCard'

const reminder = {
  _id: 'reminder-1',
  _creationTime: 1,
  stableId: 'stable-1',
  title: 'Farrier',
  category: 'farrier',
  status: 'pending',
  dueDate: '2026-10-01',
  priority: 'medium',
  createdBy: 'owner-1',
  createdAt: 1,
  updatedAt: 1,
} as Doc<'careReminders'>
const callbacks = () => ({
  onAdd: vi.fn(),
  onComplete: vi.fn(),
  onDismiss: vi.fn(),
  onRemove: vi.fn(),
  onEdit: vi.fn(),
  onReopen: vi.fn(),
})
afterEach(cleanup)

describe('reminder actions', () => {
  it('preserves an edit dialog draft after a rejected save and closes after retry', async () => {
    const actions = callbacks()
    actions.onEdit
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce(undefined)
    render(
      <CareRemindersCard
        reminders={[{ reminder, canManage: true }]}
        canAddReminder={false}
        emptyMessage="Empty"
        {...actions}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Actions for Farrier' }))
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'Edit reminder' }),
    )
    const due = await screen.findByLabelText<HTMLInputElement>('Due date')
    fireEvent.change(due, { target: { value: '2026-10-08' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText(
      'Could not save this reminder. Your entries are still here; please try again.',
    )
    expect(due.value).toBe('2026-10-08')
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(actions.onEdit).toHaveBeenLastCalledWith(
      reminder,
      expect.objectContaining({ dueDate: '2026-10-08' }),
    )
  })

  it('shows completion attribution and reopening to an assigned member without exposing editing', async () => {
    const actions = callbacks()
    actions.onReopen.mockResolvedValue(undefined)
    const done = {
      ...reminder,
      status: 'completed' as const,
      completedAt: Date.UTC(2026, 9, 1, 12),
    }
    render(
      <CareRemindersCard
        reminders={[
          {
            reminder: done,
            canManage: false,
            canComplete: true,
            canReopen: true,
            assigneeName: 'Alex',
            completedByName: 'Alex',
          },
        ]}
        canAddReminder={false}
        emptyMessage="Empty"
        {...actions}
      />,
    )
    expect(
      screen.getByText('Responsible person').closest('div')?.querySelector('dd')
        ?.textContent,
    ).toBe('Alex')
    expect(screen.getByText(/Completed by Alex/)).toBeTruthy()
    expect(
      screen.queryByRole('button', { name: 'Actions for Farrier' }),
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Reopen' }))
    await waitFor(() => expect(actions.onReopen).toHaveBeenCalledWith(done))
  })

  it('starts horse care with outstanding work and makes completed history accessible', async () => {
    const actions = callbacks()
    const horse = {
      _id: 'horse-1',
      stableId: 'stable-1',
      name: 'Milo',
      ownerId: 'owner-1',
      age: 8,
    } as Doc<'horses'>
    render(
      <HorseCareRemindersView
        horse={horse}
        records={[
          reminder,
          {
            ...reminder,
            _id: 'reminder-2' as Doc<'careReminders'>['_id'],
            title: 'Completed check',
            status: 'completed',
          },
        ]}
        canManage={true}
        {...actions}
      />,
    )
    expect(screen.getByText('Farrier', { selector: 'h3' })).toBeTruthy()
    expect(screen.queryByText('Completed check')).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: 'Toggle filters, 1 active' }),
    )
    const state = await screen.findByRole('combobox', { name: 'State' })
    fireEvent.change(state, { target: { value: 'completed' } })
    await screen.findByText('Completed check')
    expect(screen.queryByText('Farrier', { selector: 'h3' })).toBeNull()
  })

  it('groups reminder facts and urgency while omitting the redundant horse name in a horse view', () => {
    render(
      <CareRemindersCard
        reminders={[
          {
            reminder: { ...reminder, priority: 'high' },
            horseName: 'Milo',
            canManage: true,
            assigneeName: 'Alex',
          },
        ]}
        fixedHorseId="horse-1"
        canAddReminder={false}
        emptyMessage="Empty"
        {...callbacks()}
      />,
    )
    const row = screen
      .getByRole('heading', { name: 'Farrier' })
      .closest('[data-slot="dashboard-item-card"]')!
    expect(within(row.querySelector('header')!).getByText('High')).toBeTruthy()
    expect(within(row as HTMLElement).queryByText('Milo')).toBeNull()
    for (const [label, value] of [
      ['Category', 'Farrier'],
      ['Responsible person', 'Alex'],
    ]) {
      expect(
        within(row as HTMLElement)
          .getByText(label)
          .closest('div')
          ?.querySelector('dd')?.textContent,
      ).toBe(value)
    }
    expect(row.querySelector('time')?.getAttribute('datetime')).toBe(
      reminder.dueDate,
    )
    expect(
      within(row as HTMLElement).getByRole('button', {
        name: 'Complete Farrier',
      }),
    ).toBeTruthy()
  })

  it('keeps horse identity on a shared list and has no empty action area for read-only records', () => {
    render(
      <CareRemindersCard
        reminders={[{ reminder, horseName: 'Milo', canManage: false }]}
        canAddReminder={false}
        emptyMessage="Empty"
        {...callbacks()}
      />,
    )
    const row = screen
      .getByRole('heading', { name: 'Farrier' })
      .closest('[data-slot="dashboard-item-card"]')!
    expect(
      within(row as HTMLElement)
        .getByText('Horse')
        .closest('div')
        ?.querySelector('dd')?.textContent,
    ).toBe('Milo')
    expect(within(row as HTMLElement).getByText('Unassigned')).toBeTruthy()
    expect(within(row as HTMLElement).queryByRole('button')).toBeNull()
    expect(row.querySelector('[data-slot="action-group"]')).toBeNull()
  })
})
