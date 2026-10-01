// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { LocaleProvider } from './LocaleProvider'
import { LanguageSelector } from './LanguageSelector'
import { CareReminderForm } from '#/components/reminders/CareReminderForm'

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
it('preserves horse selection, typed notes and a failed save through language changes', async () => {
  const save = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(undefined)
  render(
    <LocaleProvider>
      <LanguageSelector />
      <CareReminderForm
        horseOptions={[
          { id: 'h1', name: 'Łąka' },
          { id: 'h2', name: 'Atlas' },
        ]}
        onSubmit={save}
      />
    </LocaleProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Specific horses' }))
  const title = screen.getByLabelText<HTMLInputElement>('Title')
  fireEvent.submit(title.closest('form')!)
  await screen.findByText('Select at least one horse.')
  fireEvent.click(screen.getByRole('button', { name: 'Select all' }))
  const notes = screen.getByLabelText<HTMLTextAreaElement>('Notes (optional)')
  fireEvent.change(notes, { target: { value: 'Sprawdzić kopyta po spacerze' } })
  const selector = screen.getByRole('combobox', { name: 'Language' })
  act(() => selector.focus())
  fireEvent.change(selector, { target: { value: 'pl' } })
  await screen.findByText('Wpisz tytuł przypomnienia.')
  expect(document.activeElement).toBe(selector)
  expect(screen.getByText('Wybrano: 2')).toBeTruthy()
  expect(notes.value).toBe('Sprawdzić kopyta po spacerze')
  fireEvent.change(title, { target: { value: 'Kontrola kopyt' } })
  fireEvent.submit(title.closest('form')!)
  await screen.findByText(
    'Nie udało się dodać przypomnienia. Wprowadzone dane zostały zachowane. Spróbuj ponownie.',
  )
  fireEvent.change(screen.getByRole('combobox', { name: 'Język' }), {
    target: { value: 'en' },
  })
  expect(
    screen.getByText(
      'Could not add this reminder. Your entries are still here; please try again.',
    ),
  ).toBeTruthy()
  expect(save).toHaveBeenCalledTimes(1)
  expect(screen.getByText('2 selected')).toBeTruthy()
  fireEvent.submit(title.closest('form')!)
  await waitFor(() => expect(save).toHaveBeenCalledTimes(2))
  expect(save).toHaveBeenLastCalledWith(
    expect.objectContaining({
      targetType: 'horses',
      horseIds: ['h1', 'h2'],
      title: 'Kontrola kopyt',
      description: 'Sprawdzić kopyta po spacerze',
      category: 'other',
      priority: 'medium',
    }),
  )
})
