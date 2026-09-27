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
})
