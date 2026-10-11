// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from '@tanstack/react-router'
import { shiftDate } from 'shared/analysis/horseComparison'
import type { ComparisonRange } from 'shared/analysis/horseComparison'
import {
  cleanup,
  fireEvent,
  render as renderComponent,
  screen,
  within,
  waitFor,
} from '@testing-library/react'
import { LocaleProvider } from '#/i18n/LocaleProvider'
import {
  ComparisonResults,
  HorseComparisonExplorer,
} from './HorseComparisonExplorer'
import { horseComparisonPresets } from './horseComparisonData'
import { analysisSessionKey } from './analysisSessionState'
import { createHorseComparisonSample } from '#/components/page-lab/prototypes/horseComparisonFixtures'

function RouterHarness({ children }: { children: ReactNode }) {
  const [router] = useState(() =>
    createRouter({
      routeTree: createRootRoute(),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    }),
  )
  return (
    <RouterContextProvider router={router}>{children}</RouterContextProvider>
  )
}
function render(node: ReactElement) {
  return renderComponent(node, { wrapper: RouterHarness })
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})
const today = '2026-09-29'
function show(
  records = createHorseComparisonSample(today),
  persistenceKey?: string,
) {
  return render(
    <LocaleProvider initialLocale="en">
      <HorseComparisonExplorer
        horseId="sample"
        stableId="sample"
        sampleRecords={records}
        today={today}
        persistenceKey={persistenceKey}
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
  expect(screen.getByLabelText<HTMLSelectElement>('Period').value).toBe(
    'custom',
  )
  expect(screen.getByLabelText<HTMLInputElement>('From').value).toBe(
    '2026-06-23',
  )
  expect(screen.getByLabelText<HTMLInputElement>('To').value).toBe('2026-08-18')
  fireEvent.click(
    screen.getByRole('button', { name: 'Return to previous range' }),
  )
  expect(screen.getByLabelText<HTMLSelectElement>('Period').value).toBe('90')
  expect(screen.queryByLabelText('From')).toBeNull()
})
it('starts with sessions and health, removes the summary block, and handles invalid and empty periods', () => {
  show()
  expect(
    screen.getByRole('heading', {
      name: 'Training around health and medication',
    }),
  ).toBeTruthy()
  expect(
    screen.queryByText(/Minutes recorded for|shown records|measurements ·/),
  ).toBeNull()
  fireEvent.change(screen.getByLabelText('Period'), {
    target: { value: 'custom' },
  })
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
  expect(screen.queryByRole('group', { name: 'Compare over time' })).toBeNull()
  expect(
    screen
      .getByRole('link', { name: 'Open source records' })
      .getAttribute('href'),
  ).toBe('/horses/sample')
})
it('renders isolated points without fabricating a trend or a condition score', () => {
  show([{ id: 'one', date: '2026-09-01', kind: 'weight', value: 500 }])
  fireEvent.click(screen.getByRole('button', { name: 'Body condition' }))
  const chart = screen.getByRole('group', { name: 'Compare over time' })
  expect(within(chart).getByRole('button', { name: /500 kg/ })).toBeTruthy()
  expect(within(chart).getByText('No records in this period.')).toBeTruthy()
  expect(chart.querySelector('path')).toBeNull()
})

it('inspects every contributing source in an annual training total', () => {
  show([
    {
      id: 'a',
      kind: 'training',
      date: '2026-09-02',
      status: 'completed',
      durationMinutes: 25,
      title: 'First session',
    },
    {
      id: 'b',
      kind: 'training',
      date: '2026-09-10',
      status: 'completed',
      durationMinutes: 35,
      title: 'Second session',
    },
  ])
  expect(screen.queryByLabelText('From')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Training & care' }))
  fireEvent.change(screen.getByLabelText('Period'), {
    target: { value: '365' },
  })
  const chart = screen.getByRole('group', { name: 'Compare over time' })
  expect(
    within(chart).getByText('Recorded training minutes · Monthly totals (min)'),
  ).toBeTruthy()
  fireEvent.click(
    within(chart).getByRole('button', { name: /60 min.*2 records/ }),
  )
  expect(screen.getAllByText(/First session.*25 min/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/Second session.*35 min/).length).toBeGreaterThan(
    0,
  )
})

it('keeps duration unknown when no completed session has recorded minutes', () => {
  show([{ id: 'a', kind: 'training', date: '2026-09-02', status: 'completed' }])
  const chart = screen.getByRole('group', { name: 'Compare over time' })
  expect(
    within(chart).getByText('Completed sessions · Weekly totals (sessions)'),
  ).toBeTruthy()
  fireEvent.click(within(chart).getByRole('button', { name: /1 sessions/ }))
  expect(screen.getAllByText(/Duration not recorded/).length).toBeGreaterThan(0)
  expect(screen.queryByText(/0 recorded minutes/)).toBeNull()
})

it('groups nearby annual weight observations into nonoverlapping touch areas without moving observations', () => {
  show(
    Array.from({ length: 10 }, (_, index) => ({
      id: `weight-${index}`,
      kind: 'weight' as const,
      date: `2026-09-${String(index + 1).padStart(2, '0')}`,
      value: 490 + index,
    })),
  )
  fireEvent.change(screen.getByLabelText('Period'), {
    target: { value: '365' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Weight & training' }))
  const chart = screen.getByRole('group', { name: 'Compare over time' })
  expect(chart.querySelectorAll('circle')).toHaveLength(10)
  const targets = within(chart).getAllByRole('button')
  const bounds = targets
    .map((button) => ({
      left:
        Number.parseFloat(button.style.left) -
        Number.parseFloat(button.style.width) / 2,
      right:
        Number.parseFloat(button.style.left) +
        Number.parseFloat(button.style.width) / 2,
      width: Number.parseFloat(button.style.width),
    }))
    .sort((a, b) => a.left - b.left)
  expect(bounds.every((bound) => bound.width >= 44)).toBe(true)
  expect(
    bounds.every(
      (bound, index) => index === 0 || bound.left >= bounds[index - 1].right,
    ),
  ).toBe(true)
  fireEvent.click(targets[0])
  expect(screen.getAllByText(/490 kg/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/499 kg/).length).toBeGreaterThan(0)
})

it('recognizes inherited recent ranges and updates the preset after external range navigation', () => {
  const draw = (range: ComparisonRange) => (
    <LocaleProvider initialLocale="en">
      <HorseComparisonExplorer
        horseId="sample"
        stableId="sample"
        today={today}
        sampleRecords={[]}
        range={range}
      />
    </LocaleProvider>
  )
  const view = render(draw({ start: shiftDate(today, -89), end: today }))
  expect(screen.getByLabelText<HTMLSelectElement>('Period').value).toBe('90')
  expect(screen.queryByLabelText('From')).toBeNull()
  view.rerender(draw({ start: shiftDate(today, -364), end: today }))
  expect(screen.getByLabelText<HTMLSelectElement>('Period').value).toBe('365')
  expect(screen.queryByLabelText('From')).toBeNull()
  view.rerender(draw({ start: '2025-10-01', end: '2026-09-30' }))
  expect(screen.getByLabelText<HTMLSelectElement>('Period').value).toBe(
    'custom',
  )
  expect(screen.getByLabelText<HTMLInputElement>('From').value).toBe(
    '2025-10-01',
  )
})

it('propagates native date changes through the controlled parent into chart scope and records', () => {
  const changed = vi.fn()
  function Controlled() {
    const [range, setRange] = useState({
      start: shiftDate(today, -89),
      end: today,
    })
    return (
      <LocaleProvider initialLocale="en">
        <HorseComparisonExplorer
          horseId="sample"
          stableId="sample"
          today={today}
          sampleRecords={[
            { id: 'earlier', kind: 'weight', date: '2026-08-15', value: 495 },
            { id: 'later', kind: 'weight', date: '2026-09-10', value: 500 },
          ]}
          range={range}
          onRangeChange={(next) => {
            changed(next)
            setRange(next)
          }}
        />
      </LocaleProvider>
    )
  }
  render(<Controlled />)
  fireEvent.click(screen.getByRole('button', { name: 'Weight & training' }))
  fireEvent.change(screen.getByLabelText('Period'), {
    target: { value: 'custom' },
  })
  fireEvent.change(screen.getByLabelText('From'), {
    target: { value: '2026-09-01' },
  })
  fireEvent.change(screen.getByLabelText('To'), {
    target: { value: '2026-09-20' },
  })
  expect(changed).toHaveBeenLastCalledWith({
    start: '2026-09-01',
    end: '2026-09-20',
  })
  expect(screen.getByText(/History: 1 Sept 2026 – 20 Sept 2026/)).toBeTruthy()
  const chart = screen.getByRole('group', { name: 'Compare over time' })
  expect(within(chart).queryByRole('button', { name: /495 kg/ })).toBeNull()
  expect(within(chart).getByRole('button', { name: /500 kg/ })).toBeTruthy()
})

it('restores horse exploration and inspected source after a source-page roundtrip', async () => {
  const key = analysisSessionKey('yard', 'horse')
  const records = [
    { id: 'weight', kind: 'weight' as const, date: '2026-09-01', value: 500 },
    {
      id: 'feed',
      kind: 'nutrition' as const,
      date: '2026-09-01',
      title: 'Forage changed',
      notes: 'Private nutrition note',
    },
  ]
  const first = show(records, key)
  fireEvent.change(screen.getByLabelText('Period'), {
    target: { value: '365' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Feeding changes' }))
  const customization = screen
    .getByText('Customize comparison')
    .closest('details')!
  fireEvent.click(screen.getByText('Customize comparison'))
  await waitFor(() => expect(customization.open).toBe(true))
  fireEvent.click(
    screen.getByRole('checkbox', {
      name: 'Show planned, cancelled, skipped and unconfirmed training',
    }),
  )
  fireEvent.click(
    within(screen.getByRole('group', { name: 'Compare over time' })).getByRole(
      'button',
      { name: /Forage changed/ },
    ),
  )
  fireEvent.click(
    screen.getByRole('button', { name: 'Show 4 weeks before and after' }),
  )
  first.unmount()
  show(records, key)
  expect(
    screen.getByRole('heading', { name: 'Weight around feeding changes' }),
  ).toBeTruthy()
  expect(
    screen.getByText('Customize comparison').closest('details')!.open,
  ).toBe(true)
  expect(
    screen
      .getByRole('checkbox', {
        name: 'Show planned, cancelled, skipped and unconfirmed training',
      })
      .getAttribute('aria-checked'),
  ).toBe('true')
  expect(screen.getByText('Private nutrition note')).toBeTruthy()
  expect(screen.getByLabelText<HTMLInputElement>('From').value).toBe(
    '2026-08-04',
  )
  fireEvent.click(
    screen.getByRole('button', { name: 'Return to previous range' }),
  )
  expect(screen.getByLabelText<HTMLSelectElement>('Period').value).toBe('365')
  const stored = Object.values(sessionStorage).join(' ')
  expect(stored).not.toContain('Private nutrition note')
  expect(stored).not.toContain('Forage changed')
})

it('opens the selected training occurrence date', () => {
  const records = [
    {
      id: 'training',
      kind: 'training' as const,
      date: '2026-09-10',
      status: 'completed',
      durationMinutes: 30,
      eventId: 'recurring-event',
    },
  ]
  render(
    <LocaleProvider initialLocale="en">
      <ComparisonResults
        records={records}
        selection={horseComparisonPresets.weightTraining}
        range={{ start: '2026-09-01', end: '2026-09-30' }}
        showOthers={false}
        onAround={() => {}}
        stableId="sample"
        horseId="sample"
      />
    </LocaleProvider>,
  )
  fireEvent.click(
    within(screen.getByRole('group', { name: 'Compare over time' })).getByRole(
      'button',
      { name: /30 min/ },
    ),
  )
  expect(
    screen
      .getByRole('link', { name: 'Open source records' })
      .getAttribute('href'),
  ).toBe('/events/recurring-event?date=2026-09-10&horseId=sample')
})

it.each([
  {
    kind: 'weight' as const,
    title: 'Weight record',
    value: 500,
    selection: horseComparisonPresets.weightTraining,
    query: 'weight',
    label: /500 kg/,
  },
  {
    kind: 'medication' as const,
    title: 'Medication record',
    value: undefined,
    selection: horseComparisonPresets.trainingCare,
    query: 'medication',
    label: /Medication record/,
  },
])(
  'opens $kind evidence in its matching horse record tab',
  ({ kind, title, value, selection, query, label }) => {
    render(
      <LocaleProvider initialLocale="en">
        <ComparisonResults
          records={[{ id: 'record', kind, title, value, date: '2026-09-10' }]}
          selection={selection}
          range={{ start: '2026-09-01', end: '2026-09-30' }}
          showOthers={false}
          onAround={() => {}}
          stableId="sample"
          horseId="sample"
        />
      </LocaleProvider>,
    )
    fireEvent.click(
      within(
        screen.getByRole('group', { name: 'Compare over time' }),
      ).getByRole('button', { name: label }),
    )
    expect(
      screen
        .getByRole('link', { name: 'Open source records' })
        .getAttribute('href'),
    ).toBe(`/horses/sample/nutrition?nutritionView=${query}`)
  },
)
