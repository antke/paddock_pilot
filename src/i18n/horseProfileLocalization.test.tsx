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
import type { Id } from 'convex/_generated/dataModel'
import { LocaleProvider } from './LocaleProvider'
import { LanguageSelector } from './LanguageSelector'
import { HorseProfileForm } from '#/components/horses/HorseProfileForm'

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('translates dirty horse validation and acknowledged-save errors without resetting data or repeating writes', async () => {
  const horseId = 'sample-horse' as Id<'horses'>
  const save = vi.fn().mockResolvedValue(horseId)
  const open = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue(undefined)
  render(
    <LocaleProvider>
      <LanguageSelector />
      <HorseProfileForm
        mode="create"
        save={save}
        onSaved={open}
        uploadImage={vi.fn()}
      />
    </LocaleProvider>,
  )
  fireEvent.change(screen.getByLabelText('Owner name'), {
    target: { value: 'Żaneta Łącka' },
  })
  fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2018' } })
  fireEvent.click(screen.getByRole('button', { name: 'Mare' }))
  fireEvent.click(screen.getByRole('button', { name: 'Add horse' }))
  await screen.findByText('Name must have minimum 1 character.')
  // Allow the normal submit-time focus recovery to finish before testing language focus.
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByLabelText('Horse name')),
  )
  // RHF schedules a second submit-focus pass; settle it before the next interaction.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
  const selector = screen.getByRole('combobox', { name: 'Language' })
  selector.focus()
  fireEvent.change(selector, { target: { value: 'pl' } })
  await screen.findByText('Podaj imię konia.')
  expect(document.activeElement).toBe(selector)
  expect(
    screen.getByLabelText<HTMLInputElement>('Imię i nazwisko właściciela')
      .value,
  ).toBe('Żaneta Łącka')
  expect(screen.getByLabelText<HTMLInputElement>('Rok').value).toBe('2018')
  expect(
    screen.getByRole('button', { name: 'Klacz' }).getAttribute('aria-pressed'),
  ).toBe('true')
  fireEvent.change(screen.getByLabelText('Imię konia'), {
    target: { value: 'Źrebak' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Dodaj konia' }))
  await screen.findByText(
    /Koń został zapisany, ale nie udało się otworzyć profilu/,
  )
  expect(save).toHaveBeenCalledTimes(1)
  expect(save.mock.calls[0][0]).toMatchObject({
    name: 'Źrebak',
    ownerName: 'Żaneta Łącka',
    dateOfBirth: '2018',
    sex: 'mare',
  })
  fireEvent.change(screen.getByRole('combobox', { name: 'Język' }), {
    target: { value: 'en' },
  })
  expect(
    screen.getByText(/Your horse was saved, but the profile could not open/),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Open horse profile' }))
  await waitFor(() => expect(open).toHaveBeenCalledTimes(2))
  expect(save).toHaveBeenCalledTimes(1)
})
