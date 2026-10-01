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
import { useState } from 'react'
import { LocaleProvider } from './LocaleProvider'
import { LanguageSelector } from './LanguageSelector'
import { HorseBreedAutocomplete } from '#/components/forms/horse/HorseBreedAutocomplete'
import {
  getHorseBreedLabel,
  matchesBreedSearch,
} from 'shared/i18n/horseBreedLabels'
import { matchHorseBreed } from '#/components/forms/horse/horseBreedSelection'

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
function Harness() {
  const [value, setValue] = useState('')
  const [breeds, setBreeds] = useState<string[]>([])
  return (
    <>
      <LanguageSelector />
      <label htmlFor="breed">Breed field</label>
      <HorseBreedAutocomplete
        id="breed"
        name="breed"
        value={value}
        additionalBreeds={breeds}
        onValueChange={setValue}
        onAddBreed={(breed) => setBreeds((current) => [...current, breed])}
        onBlur={() => {}}
      />
      <output data-testid="stored-breed">{value}</output>
    </>
  )
}

it('searches Polish labels, commits the existing canonical value, and switches its presentation without writing a new value', async () => {
  render(
    <LocaleProvider>
      <Harness />
    </LocaleProvider>,
  )
  fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
    target: { value: 'pl' },
  })
  const input = screen.getByLabelText<HTMLInputElement>('Breed field')
  act(() => input.focus())
  fireEvent.change(input, { target: { value: 'czysta' } })
  fireEvent.keyDown(input, { key: 'ArrowDown' })
  await screen.findByRole('option', { name: 'Czysta krew arabska' })
  fireEvent.keyDown(input, { key: 'Enter' })
  await waitFor(() => expect(input.value).toBe('Czysta krew arabska'))
  fireEvent.blur(input)
  expect(screen.getByTestId('stored-breed').textContent).toBe('Arabian')
  fireEvent.change(screen.getByRole('combobox', { name: 'Język' }), {
    target: { value: 'en' },
  })
  expect(input.value).toBe('Arabian')
  expect(screen.getByTestId('stored-breed').textContent).toBe('Arabian')
})

it('keeps a custom breed draft and translates visible validation without losing focus', async () => {
  render(
    <LocaleProvider>
      <Harness />
    </LocaleProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Add breed' }))
  fireEvent.click(screen.getByRole('button', { name: 'Use breed' }))
  expect(screen.getByText('Enter a breed name.')).toBeTruthy()
  const selector = screen.getByRole('combobox', { name: 'Language' })
  selector.focus()
  fireEvent.change(selector, { target: { value: 'pl' } })
  expect(screen.getByText('Podaj nazwę rasy.')).toBeTruthy()
  expect(document.activeElement).toBe(selector)
  const draft = screen.getByLabelText<HTMLInputElement>('Nazwa nowej rasy')
  fireEvent.change(draft, { target: { value: 'Łąkowy koń lokalny' } })
  fireEvent.change(screen.getByRole('combobox', { name: 'Język' }), {
    target: { value: 'en' },
  })
  expect(screen.getByLabelText<HTMLInputElement>('New breed name').value).toBe(
    'Łąkowy koń lokalny',
  )
  fireEvent.click(screen.getByRole('button', { name: 'Use breed' }))
  expect(screen.getByTestId('stored-breed').textContent).toBe(
    'Łąkowy koń lokalny',
  )
})

it('retains custom names and keeps distinct legacy breed values distinct', () => {
  expect(getHorseBreedLabel('Łąkowy koń lokalny', 'pl')).toBe(
    'Łąkowy koń lokalny',
  )
  expect(matchesBreedSearch('Silesian Horse', 'slaski')).toBe(true)
  expect(matchesBreedSearch('Thoroughbred', 'pełna krew')).toBe(true)
  expect(matchHorseBreed('Polski koń sportowy', undefined, [], 'pl')).toBe(
    'Polish Sport Horse',
  )
  expect(matchHorseBreed('Polski koń półkrwi', undefined, [], 'pl')).toBe(
    'Polish Warmblood',
  )
  expect(
    matchHorseBreed('Czysta krew arabska', 'Czysta krew arabska', [], 'pl'),
  ).toBe('Czysta krew arabska')
})
