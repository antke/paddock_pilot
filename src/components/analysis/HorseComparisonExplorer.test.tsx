// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import { LocaleProvider } from '#/i18n/LocaleProvider'
import { HorseComparisonExplorer } from './HorseComparisonExplorer'
import { createHorseComparisonSample } from '#/components/page-lab/prototypes/horseComparisonFixtures'

afterEach(() => {
  cleanup()
  localStorage.clear()
})
const today = '2026-09-29'
function show(records = createHorseComparisonSample(today)) {
  render(
    <LocaleProvider initialLocale="en">
      <HorseComparisonExplorer
        horseId="sample"
        stableId="sample"
        sampleRecords={records}
        today={today}
      />
    </LocaleProvider>,
  )
}
it('switches comparisons, opens a real record and focuses the period around it', () => {
  show()
  fireEvent.click(screen.getByRole('button', { name: 'Feeding changes' }))
  const chart = screen.getByRole('group', { name: 'Compare over time' })
  expect(within(chart).getByText('Nutrition changes')).toBeTruthy()
  fireEvent.click(
    within(chart).getByRole('button', { name: /Forage routine updated/ }),
  )
  expect(screen.getByText('Sample revised forage routine')).toBeTruthy()
  fireEvent.click(
    screen.getByRole('button', { name: 'Show 4 weeks before and after' }),
  )
  expect(screen.getByLabelText<HTMLSelectElement>('Period').value).toBe('custom')
  expect(screen.getByLabelText<HTMLInputElement>('From').value).toBe('2026-06-23')
  expect(screen.getByLabelText<HTMLInputElement>('To').value).toBe('2026-08-18')
})
it('preserves missing duration coverage and handles invalid and empty periods', () => {
  show()
  expect(
    screen.getByText('Minutes recorded for 11 of 12 completed sessions.'),
  ).toBeTruthy()
  fireEvent.change(screen.getByLabelText('From'), {
    target: { value: '2027-01-01' },
  })
  expect(screen.getByRole('alert')).toBeTruthy()
  expect(screen.queryByRole('group', { name: 'Compare over time' })).toBeNull()
  fireEvent.change(screen.getByLabelText('To'), {
    target: { value: '2027-02-01' },
  })
  expect(
    screen.getAllByText('No records in this period.').length,
  ).toBeGreaterThan(0)
})
it('renders isolated points without fabricating a trend or a condition score', () => {
  show([{ id: 'one', date: '2026-09-01', kind: 'weight', value: 500 }])
  fireEvent.click(screen.getByRole('button', { name: 'Body condition' }))
  const chart = screen.getByRole('group', { name: 'Compare over time' })
  expect(within(chart).getByRole('button', { name: /500 kg/ })).toBeTruthy()
  expect(within(chart).getByText('No records in this period.')).toBeTruthy()
  expect(chart.querySelector('path')).toBeNull()
})
