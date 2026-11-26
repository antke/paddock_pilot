// @vitest-environment jsdom
import {
  act,
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
      await screen.findByRole('menuitem', { name: 'Edit Farrier' }),
    )
    const due = await screen.findByLabelText<HTMLInputElement>('Due date')
    fireEvent.change(due, { target: { value: '2026-10-08' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText(
      /^Couldn’t save the reminder\. Your entries are still here\. /,
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
    // Responsibility and attribution sit behind the title.
    fireEvent.click(screen.getByRole('button', { name: 'Farrier' }))
    expect(screen.getByText('Assigned to: Alex')).toBeTruthy()
    expect(screen.getByText(/Completed by Alex/)).toBeTruthy()
    // An assignee who cannot manage gets a menu with Reopen only.
    fireEvent.click(screen.getByRole('button', { name: 'Actions for Farrier' }))
    const menu = await screen.findByRole('menu')
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual(['Reopen'])
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Reopen' }))
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
    // Status is a quiet toggle, not an active filter.
    expect(screen.getByRole('button', { name: 'Toggle filters' })).toBeTruthy()
    const done = screen.getByRole('button', { name: 'Done' })
    fireEvent.click(done)
    expect(done.getAttribute('aria-pressed')).toBe('true')
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
    // The tile carries urgency; screen readers hear it beside the title.
    expect(within(row as HTMLElement).getByText('Priority: High')).toBeTruthy()
    expect(within(row as HTMLElement).queryByText('Milo')).toBeNull()
    expect(
      within(row as HTMLElement).getByText('Category:').parentElement
        ?.textContent,
    ).toBe('Category: Farrier')
    const details = within(row as HTMLElement).getByRole('button', {
      name: 'Farrier',
    })
    expect(details.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(details)
    expect(
      within(row as HTMLElement).getByText('Assigned to: Alex'),
    ).toBeTruthy()
    expect(row.querySelector('time')?.getAttribute('datetime')).toBe(
      reminder.dueDate,
    )
    expect(
      within(row as HTMLElement).getByRole('button', {
        name: 'Actions for Farrier',
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
      within(row as HTMLElement).getByText('Horse:').parentElement?.textContent,
    ).toBe('Horse: Milo')
    expect(
      within(row as HTMLElement).getByText('Assigned to: Unassigned'),
    ).toBeTruthy()
    // Only the title, which opens the details: no check and no menu.
    expect(
      within(row as HTMLElement)
        .getAllByRole('button')
        .map((button) => button.getAttribute('aria-label')),
    ).toEqual(['Farrier'])
    expect(row.querySelector('[data-slot="action-group"]')).toBeNull()
  })
})

it('shows the local care receipt only after acknowledgement, retains retry after failure, and ignores background completion', async () => {
  const actions = callbacks()
  let resolve!: () => void
  let reject!: (error: Error) => void
  actions.onComplete.mockImplementation(
    () =>
      new Promise<void>((ok, fail) => {
        resolve = ok
        reject = fail
      }),
  )
  const view = (
    items: Array<{ reminder: Doc<'careReminders'>; canManage: boolean }>,
    outstandingCount: number,
  ) => (
    <CareRemindersCard
      reminders={items}
      outstandingCount={outstandingCount}
      canAddReminder={false}
      emptyMessage="All recorded"
      {...actions}
    />
  )
  const { rerender, container } = render(
    view([{ reminder, canManage: true }], 1),
  )
  const trigger = screen.getByRole<HTMLButtonElement>('button', {
    name: 'Actions for Farrier',
  })
  const complete = async () => {
    fireEvent.click(trigger)
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Complete' }))
  }
  await complete()
  // The menu stays locked while the completion is saving.
  expect(trigger.disabled).toBe(true)
  expect(actions.onComplete).toHaveBeenCalledTimes(1)
  expect(container.querySelector('[data-slot="care-confirmation"]')).toBeNull()
  await act(async () => reject(new Error('Offline')))
  expect(screen.getByRole('alert')).toBeTruthy()
  expect(container.querySelector('[data-slot="care-confirmation"]')).toBeNull()
  await complete()
  await act(async () => resolve())
  expect(
    container.querySelector('[data-slot="care-confirmation"]')?.textContent,
  ).toContain('Farrier')
  rerender(view([], 0))
  expect(container.querySelector('[data-final="true"]')).toBeTruthy()
  cleanup()
  render(
    view(
      [{ reminder: { ...reminder, status: 'completed' }, canManage: true }],
      0,
    ),
  )
  expect(document.querySelector('[data-slot="care-confirmation"]')).toBeNull()
})

describe('complete and schedule next', () => {
  it('lists the next-date editor first in the row menu without completing anything', async () => {
    const actions = callbacks()
    render(
      <CareRemindersCard
        reminders={[{ reminder, canManage: true }]}
        canAddReminder={false}
        emptyMessage="Empty"
        {...actions}
      />,
    )
    // The row shows only "…": Complete leads the menu, then scheduling the next
    // date and Edit, and Remove is last.
    expect(screen.queryByRole('button', { name: 'Edit Farrier' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Remove Farrier' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: /and schedule next/ }),
    ).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Actions for Farrier' }))
    const menu = await screen.findByRole('menu')
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual(['Complete', 'Complete & repeat', 'Edit', 'Dismiss', 'Remove'])
    expect(
      within(menu).getByRole('menuitem', { name: 'Remove Farrier' }),
    ).toBeTruthy()
    fireEvent.click(
      within(menu).getByRole('menuitem', {
        name: 'Complete & repeat',
      }),
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Complete & repeat',
    })
    expect(within(dialog).getByLabelText('Next due date')).toBeTruthy()
    expect(
      within(dialog).getByText(
        'It’s only completed once you save the next due date.',
      ),
    ).toBeTruthy()
    expect(actions.onComplete).not.toHaveBeenCalled()
    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(actions.onComplete).not.toHaveBeenCalled()
  })

  it('removes from the row menu through the shared confirmation and returns focus to the menu button', async () => {
    const actions = callbacks()
    render(
      <CareRemindersCard
        reminders={[{ reminder, canManage: true }]}
        canAddReminder={false}
        emptyMessage="Empty"
        {...actions}
      />,
    )
    const trigger = screen.getByRole('button', { name: 'Actions for Farrier' })
    fireEvent.click(trigger)
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'Remove Farrier' }),
    )
    let dialog = await screen.findByRole('alertdialog', {
      name: 'Remove “Farrier”?',
    })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Keep record' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(trigger))
    expect(actions.onRemove).not.toHaveBeenCalled()

    fireEvent.click(trigger)
    fireEvent.click(
      await screen.findByRole('menuitem', { name: 'Remove Farrier' }),
    )
    dialog = await screen.findByRole('alertdialog')
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Remove reminder' }),
    )
    await waitFor(() => expect(actions.onRemove).toHaveBeenCalledOnce())
  })

  it('reopens a closed reminder from its menu and keeps Remove last', async () => {
    render(
      <CareRemindersCard
        reminders={[
          { reminder: { ...reminder, status: 'completed' }, canManage: true },
        ]}
        canAddReminder={false}
        emptyMessage="Empty"
        {...callbacks()}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Actions for Farrier' }))
    const menu = await screen.findByRole('menu')
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => item.textContent),
    ).toEqual(['Reopen', 'Edit', 'Remove'])
  })

  it.each([
    {
      name: 'an existing follow-up',
      item: {
        reminder: {
          ...reminder,
          followUpReminderId: 'reminder-2' as Doc<'careReminders'>['_id'],
        },
        canManage: true,
      },
    },
    {
      name: 'a completion-only assignee',
      item: { reminder, canManage: false, canComplete: true },
    },
    {
      name: 'a completed reminder',
      item: {
        reminder: { ...reminder, status: 'completed' as const },
        canManage: true,
      },
    },
  ])('is not offered for $name', async ({ item }) => {
    render(
      <CareRemindersCard
        reminders={[item]}
        canAddReminder={false}
        emptyMessage="Empty"
        {...callbacks()}
      />,
    )
    const trigger = screen.queryByRole('button', {
      name: 'Actions for Farrier',
    })
    if (trigger) {
      fireEvent.click(trigger)
      const menu = await screen.findByRole('menu')
      expect(
        within(menu).queryByRole('menuitem', {
          name: 'Complete & repeat',
        }),
      ).toBeNull()
    }
  })
})
