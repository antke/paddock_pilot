// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CareReminderForm } from './CareReminderForm'

afterEach(cleanup)

describe('care reminder form recovery', () => {
  it('links validation errors to fields and preserves entries after a rejected save', async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce(undefined)
    render(<CareReminderForm onSubmit={save} presentation="plain" />)
    const title = screen.getByLabelText<HTMLInputElement>('Title')
    fireEvent.submit(title.closest('form')!)
    await waitFor(() => expect(title.getAttribute('aria-invalid')).toBe('true'))
    expect(
      document.getElementById(title.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toBeTruthy()
    expect(save).not.toHaveBeenCalled()
    fireEvent.change(title, { target: { value: 'Book farrier visit' } })
    fireEvent.submit(title.closest('form')!)
    await screen.findByText(
      'Could not add this reminder. Your entries are still here; please try again.',
    )
    expect(title.value).toBe('Book farrier visit')
    fireEvent.submit(title.closest('form')!)
    await waitFor(() => expect(title.value).toBe(''))
    expect(save).toHaveBeenCalledTimes(2)
    expect(save.mock.calls[1][0]).toMatchObject({
      title: 'Book farrier visit',
      targetType: 'stable',
    })
  })
  it('edits the existing due date and responsibility, preserving changes on a failed save', async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error('Offline'))
      .mockResolvedValueOnce(undefined)
    render(
      <CareReminderForm
        onSubmit={save}
        presentation="plain"
        fixedHorseId="horse-1"
        assigneeOptions={[
          { id: 'member-1', name: 'Alex' },
          { id: 'member-2', name: 'Sam' },
        ]}
        initialValues={{
          title: 'Farrier',
          description: 'Front shoes',
          category: 'farrier',
          dueDate: '2026-10-01',
          priority: 'medium',
          assignedTo: 'member-1',
        }}
      />,
    )
    const title = screen.getByLabelText<HTMLInputElement>('Title')
    const due = screen.getByLabelText<HTMLInputElement>('Due date')
    const responsible =
      screen.getByLabelText<HTMLSelectElement>('Responsible person')
    expect(due.value).toBe('2026-10-01')
    expect(responsible.value).toBe('member-1')
    fireEvent.change(due, { target: { value: '2026-10-07' } })
    fireEvent.change(responsible, { target: { value: 'member-2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await screen.findByText(
      'Could not save this reminder. Your entries are still here; please try again.',
    )
    expect(due.value).toBe('2026-10-07')
    expect(responsible.value).toBe('member-2')
    fireEvent.submit(title.closest('form')!)
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2))
    expect(save).toHaveBeenLastCalledWith(
      expect.objectContaining({
        targetType: 'horse',
        horseId: 'horse-1',
        dueDate: '2026-10-07',
        assignedTo: 'member-2',
      }),
    )
    expect(title.value).toBe('Farrier')
  })
})
