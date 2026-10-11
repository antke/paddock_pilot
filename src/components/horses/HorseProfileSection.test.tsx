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
import { afterEach, expect, it, vi } from 'vitest'
import type { Id } from 'convex/_generated/dataModel'
import { GUEST_LOCALE_KEY, LocaleProvider } from '#/i18n/LocaleProvider'
import { copyTextToClipboard } from '#/lib/clipboard'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import type { HorseDetailHorse } from './HorseDetail'
import { HorseProfileSection } from './HorseProfileSection'

vi.mock('#/lib/clipboard', () => ({ copyTextToClipboard: vi.fn() }))
vi.mock('#/components/ui/sonner', () => ({
  showAppErrorToast: vi.fn(),
  showAppSuccessToast: vi.fn(),
}))

const baseHorse: HorseDetailHorse = {
  _id: 'sample-horse' as Id<'horses'>,
  _creationTime: 0,
  name: 'Juniper',
  age: 15,
}
const completeHorse: HorseDetailHorse = {
  ...baseHorse,
  breed: 'Custom breed',
  sex: 'mare',
  color: 'Grey',
  height: '15',
  dateOfBirth: '2011',
  passportNumber: 'PASSPORT-123',
  microchipNumber: 'CHIP-456',
  insuranceProvider: 'Example insurer',
  insurancePolicyNumber: 'POLICY-789',
  shoeingStatus: 'full_set',
  allergies: ['Recorded allergy'],
  dewormingNotes: 'First line.\nSecond line.',
}

function open(horse = completeHorse) {
  return render(<HorseProfileSection horse={horse} events={[]} />)
}
function definition(label: string, scope = document.body) {
  const term = within(scope).getByText(label, { selector: 'dt' })
  const value = term.nextElementSibling!
  expect(value.tagName).toBe('DD')
  expect(term.closest('dl')).toBeTruthy()
  return value
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

it('groups standing care before administrative facts with semantic label/value pairs', () => {
  open()
  expect(
    screen.getAllByRole('heading', { level: 2 }).map((el) => el.textContent),
  ).toEqual([
    'Horse details',
    'Care information',
    'Identification and insurance',
  ])
  const care = screen.getByRole('region', { name: 'Care information' })
  expect(definition('Allergies', care).textContent).toBe('Recorded allergy')
  expect(definition('Shoeing status', care).textContent).toBe('Full set')
  expect(definition('Deworming notes', care).textContent).toBe(
    completeHorse.dewormingNotes,
  )
  const registration = screen.getByRole('region', {
    name: 'Identification and insurance',
  })
  expect(definition('Insurer', registration).textContent).toBe(
    'Example insurer',
  )
  expect(definition('Insurance policy', registration).textContent).toBe(
    'POLICY-789',
  )
  expect(screen.queryByRole('heading', { name: 'Parentage' })).toBeNull()
  expect(definition('Height').textContent).toBe('15')
})

it('keeps derived age beside the recorded partial birth date', () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 9))
  open({ ...completeHorse, age: 99 })
  const terms = within(
    screen.getByRole('region', { name: 'Horse details' }),
  ).getAllByRole('term')
  expect(terms.slice(0, 2).map((term) => term.textContent)).toEqual([
    'Age',
    'Date of birth',
  ])
  expect(definition('Age').textContent).toBe('15')
  expect(definition('Date of birth').textContent).toBe('2011')
})

it('keeps zero age and makes unknown allergies explicit without empty optional groups', () => {
  open({ ...baseHorse, age: 0 })
  expect(definition('Age').textContent).toBe('0')
  expect(definition('Date of birth').textContent).toBe('Not recorded')
  expect(definition('Allergies').textContent).toBe('Not recorded')
  expect(
    screen.queryByRole('region', { name: 'Identification and insurance' }),
  ).toBeNull()
  expect(screen.queryByRole('heading', { name: 'Parentage' })).toBeNull()
  expect(screen.queryByText('Deworming notes')).toBeNull()
})

it('preserves an explicitly entered none separately from an empty allergy list', () => {
  const view = open({ ...baseHorse, allergies: ['none'] })
  expect(definition('Allergies').textContent).toBe('none')
  expect(
    definition('Allergies').querySelector('[data-slot="badge"]'),
  ).toBeNull()
  view.rerender(
    <HorseProfileSection horse={{ ...baseHorse, allergies: [] }} events={[]} />,
  )
  expect(definition('Allergies').textContent).toBe('Not recorded')
})

it('shows recorded parentage under horse details independently of shoeing', () => {
  open({ ...baseHorse, sire: 'Recorded sire', dam: 'Recorded dam' })
  const facts = screen.getByRole('region', { name: 'Horse details' })
  expect(
    within(facts).getByRole('heading', { level: 3, name: 'Parentage' }),
  ).toBeTruthy()
  expect(definition('Sire', facts).textContent).toBe('Recorded sire')
  expect(definition('Dam', facts).textContent).toBe('Recorded dam')
})

it('keeps maximum-length care content fully available as a list and multiline prose', () => {
  const allergies = Array.from({ length: 30 }, (_, i) =>
    `${i}`.padEnd(100, 'a'),
  )
  const notes = `${'n'.repeat(495)}\n${'m'.repeat(504)}`
  open({ ...baseHorse, allergies, dewormingNotes: notes })
  expect(
    within(definition('Allergies') as HTMLElement).getAllByRole('listitem'),
  ).toHaveLength(30)
  expect(definition('Deworming notes').textContent).toBe(notes)
  expect(screen.queryByText('Read more')).toBeNull()
})

it('retains accessible copy pending feedback, success and manual-copy recovery', async () => {
  let resolveCopy!: () => void
  vi.mocked(copyTextToClipboard).mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        resolveCopy = resolve
      }),
  )
  open()
  const copy = screen.getByRole<HTMLButtonElement>('button', {
    name: 'Copy passport number',
  })
  copy.focus()
  fireEvent.click(copy)
  expect(copyTextToClipboard).toHaveBeenCalledExactlyOnceWith('PASSPORT-123')
  expect(copy.disabled).toBe(true)
  expect(copy.getAttribute('aria-busy')).toBe('true')
  await act(async () => resolveCopy())
  expect(copy.disabled).toBe(false)
  expect(copy.getAttribute('data-confirmed')).toBe('true')
  expect(document.activeElement).toBe(copy)
  expect(showAppSuccessToast).toHaveBeenCalledWith({
    title: 'Passport number copied',
  })
  vi.mocked(copyTextToClipboard).mockRejectedValueOnce(new Error('Unavailable'))
  fireEvent.click(screen.getByRole('button', { name: 'Copy microchip number' }))
  await waitFor(() => expect(showAppErrorToast).toHaveBeenCalledOnce())
  expect(vi.mocked(showAppErrorToast).mock.calls[0][0]).toMatchObject({
    title: 'Could not copy microchip number',
  })
  expect(definition('Microchip').textContent).toBe('CHIP-456')
  expect(
    screen
      .getByRole('button', { name: 'Copy microchip number' })
      .getAttribute('data-confirmed'),
  ).toBeNull()
  const description = vi.mocked(showAppErrorToast).mock.calls[0][0]?.description
  render(<>{description}</>)
  expect(
    screen.getByText('Select the number and copy it manually.'),
  ).toBeTruthy()
})

it('localises the new grouping and missing values in Polish while preserving recorded text', () => {
  localStorage.setItem(GUEST_LOCALE_KEY, 'pl')
  render(
    <LocaleProvider initialLocale="pl">
      <HorseProfileSection
        horse={{ ...completeHorse, allergies: [] }}
        events={[]}
      />
    </LocaleProvider>,
  )
  expect(
    screen.getAllByRole('heading', { level: 2 }).map((el) => el.textContent),
  ).toEqual([
    'Dane konia',
    'Informacje o opiece',
    'Identyfikacja i ubezpieczenie',
  ])
  expect(definition('Alergie').textContent).toBe('Brak danych')
  expect(definition('Ubezpieczyciel').textContent).toBe('Example insurer')
  expect(definition('Notatki o odrobaczaniu').textContent).toBe(
    completeHorse.dewormingNotes,
  )
})
