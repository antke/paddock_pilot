// @vitest-environment jsdom
import { LocaleProvider } from '#/i18n/LocaleProvider'
import { LanguageSelector } from '#/i18n/LanguageSelector'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
  act,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
  useLocation,
  useRouter,
} from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import {
  createAnalysisAuditSample,
  createDashboardAuditSample,
} from '#/components/page-lab/prototypes/dashboardAnalysisFixtures'
import { getTodayDateKey } from '#/lib/dateDisplay'
import { StableAnalysisPageView } from './StableAnalysisPage'
import { AnalysisScopeSelector } from './AnalysisScopeSelector'
import { StableActivityTimelineChart } from './StableActivityTimelineChart'
import { createAnalysisCentreData } from './analysisCentreData'
import { getTimelinePeriods } from './stableActivityTimelineScale'
import { eventTypes } from 'shared/events/eventSchema'

const today = getTodayDateKey()
const data = createDashboardAuditSample(
  createDashboardLabFixtureData(),
  'crowded',
  today,
)
const analysis = createAnalysisAuditSample(data, today)
afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
  vi.restoreAllMocks()
})
async function show(
  locked = false,
  empty = false,
  localized = false,
  persistenceKey?: string,
) {
  const sampleData = empty
    ? createDashboardAuditSample(data, 'empty', today)
    : data
  const sampleAnalysis = empty
    ? createAnalysisAuditSample(sampleData, today, true)
    : analysis
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const root = createRootRoute({
    component: () => (
      <StableAnalysisPageView
        data={sampleData}
        persistenceKey={persistenceKey}
        analysis={
          locked
            ? {
                hasAccess: false,
                requiredPlan: 'personal_pro',
                stable: analysis.stable,
              }
            : sampleAnalysis
        }
      />
    ),
  })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  return render(
    localized ? (
      <LocaleProvider>
        <LanguageSelector />
        <RouterProvider router={router} />
      </LocaleProvider>
    ) : (
      <RouterProvider router={router} />
    ),
  )
}

describe('actual analysis view', () => {
  it('opens the linked horse instead of the remembered subject and follows browser history', async () => {
    const horse = data.horses[0]
    const key = 'analysis-linked-horse'
    sessionStorage.setItem(`${key}:subject`, JSON.stringify('stable'))
    function LinkedAnalysis() {
      const location = useLocation()
      const router = useRouter()
      const horseId =
        new URLSearchParams(location.searchStr).get('horseId') ?? undefined
      return (
        <StableAnalysisPageView
          data={data}
          analysis={analysis}
          persistenceKey={key}
          selectedHorseId={horseId}
          onHorseChange={(next) =>
            router.history.push(next ? `/?horseId=${next}` : '/')
          }
        />
      )
    }
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const router = createRouter({
      routeTree: createRootRoute({ component: LinkedAnalysis }),
      history: createMemoryHistory({
        initialEntries: [`/?horseId=${horse._id}`],
      }),
    })
    await router.load()
    render(<RouterProvider router={router} />)
    await screen.findByRole('heading', { name: horse.name })
    expect(
      screen.getByRole<HTMLInputElement>('combobox', {
        name: 'Analyse stable or horse',
      }).value,
    ).toBe(horse.name)
    fireEvent.click(screen.getByRole('button', { name: 'Stable overview' }))
    await screen.findByRole('heading', {
      name: 'What changed across the yard?',
    })
    expect(router.state.location.searchStr).toBe('')
    act(() => router.history.back())
    await waitFor(() =>
      expect(
        screen.getByRole<HTMLInputElement>('combobox', {
          name: 'Analyse stable or horse',
        }).value,
      ).toBe(horse.name),
    )
  })

  it('renders the real access prompt instead of an empty premium chart when locked', async () => {
    await show(true)
    expect(
      await screen.findByText('Analysis Centre is a Premium feature'),
    ).toBeTruthy()
    expect(
      screen.queryByRole('region', { name: 'Stable activity calendar' }),
    ).toBeNull()
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('keeps appointment filters consistent with counts and details while naming unfiltered care records', async () => {
    await show()
    const scale = await screen.findByRole('group', { name: 'Calendar scale' })
    expect(
      within(scale)
        .getByRole('button', { name: 'Month' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    const region = screen.getByRole('region', {
      name: 'Care records in selected period',
    })
    expect(region.tabIndex).toBe(0)
    expect(within(region).getByText('Sample reminder record 10')).toBeTruthy()
    expect(
      screen.getByText(
        /Event filters apply to the chart, counts and appointment list/,
      ),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Vet' }))
    expect(within(region).getByText('Sample reminder record 10')).toBeTruthy()
    for (const name of ['Training', 'Dentist', 'Hoof trimming', 'Massage'])
      fireEvent.click(screen.getByRole('checkbox', { name }))
    expect(
      screen.getByText('No appointments match these filters.'),
    ).toBeTruthy()
    expect(
      screen.queryByRole('region', {
        name: 'Filtered appointments in selected period',
      }),
    ).toBeNull()
    expect(
      screen.getByText(/Select an appointment to open its event page/),
    ).toBeTruthy()
    fireEvent.click(within(scale).getByRole('button', { name: 'Week' }))
    expect(
      within(scale)
        .getByRole('button', { name: 'Week' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    expect(
      screen.getByRole('region', { name: 'Stable activity calendar' }).tabIndex,
    ).toBe(0)
  })

  it('puts the overview before activity and keeps the selected dates when opening a horse', async () => {
    await show()
    const overview = screen.getByRole('heading', {
      name: 'What changed across the yard?',
    })
    const activity = screen.getByRole('heading', {
      name: 'Activity through the period',
    })
    expect(
      overview.compareDocumentPosition(activity) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    fireEvent.change(screen.getByRole('combobox', { name: 'History period' }), {
      target: { value: 'custom' },
    })
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2025-10-01' },
    })
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: '2026-09-30' },
    })
    fireEvent.click(screen.getByRole('button', { name: data.horses[49].name }))
    expect(
      screen.getByRole('heading', { name: data.horses[49].name }),
    ).toBeTruthy()
    const subject = screen.getByRole('combobox', {
      name: 'Analyse stable or horse',
    })
    fireEvent.focus(subject)
    fireEvent.click(
      screen.getByRole('button', { name: 'Show analysis subjects' }),
    )
    fireEvent.change(subject, { target: { value: data.stable.name } })
    fireEvent.keyDown(subject, { key: 'ArrowDown' })
    fireEvent.keyDown(subject, { key: 'Enter' })
    expect(screen.getByLabelText<HTMLInputElement>('From').value).toBe(
      '2025-10-01',
    )
    expect(screen.getByLabelText<HTMLInputElement>('To').value).toBe(
      '2026-09-30',
    )
  })

  it('routes urgent health to health and cadence to reminders', async () => {
    await show()
    const attention = await screen.findByRole('region', {
      name: 'Stable needs attention',
    })
    const links = within(attention).getAllByRole('link')
    expect(
      links
        .find((link) => link.textContent?.includes('Sample health record 1'))
        ?.getAttribute('href'),
    ).toContain('careView=health')
    expect(
      links
        .find((link) =>
          link.textContent?.includes('Hoof trimming care is overdue'),
        )
        ?.getAttribute('href'),
    ).not.toContain('careView=health')
  })

  it('uses one period tab stop with bounded arrow/Home/End selection and skips redundant overview bars', async () => {
    await show()
    const group = await screen.findByRole('group', {
      name: 'Timeline periods — use arrow keys to select',
    })
    const buttons = within(group).getAllByRole('button')
    expect(buttons.filter((button) => button.tabIndex === 0)).toHaveLength(1)
    expect(
      [
        ...document.querySelectorAll<HTMLButtonElement>(
          '[data-slot="activity-timeline-overview-period-button"], [data-slot="activity-timeline-grid-period-button"]',
        ),
      ].every((button) => button.tabIndex === -1),
    ).toBe(true)
    const selected = buttons.find((button) => button.tabIndex === 0)!
    fireEvent.keyDown(selected, { key: 'Home' })
    expect(document.activeElement).toBe(buttons[0])
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true')
    fireEvent.keyDown(buttons[0], { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(buttons[0])
    fireEvent.keyDown(buttons[0], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[1])
    fireEvent.keyDown(buttons[1], { key: 'End' })
    expect(document.activeElement).toBe(buttons.at(-1))
    expect(buttons.filter((button) => button.tabIndex === 0)).toHaveLength(1)
    expect(buttons.at(-1)?.getAttribute('aria-pressed')).toBe('true')
  })

  it('distinguishes a genuinely empty timeline and uses singular period copy', async () => {
    await show(false, true)
    expect(
      await screen.findByText(/No appointments or care records in this period/),
    ).toBeTruthy()
    expect(
      screen.queryByText('No appointments match these filters.'),
    ).toBeNull()
    expect(
      screen.getByText(/No appointments or care records in this period/),
    ).toBeTruthy()
  })

  it('opens an event independently of period selection and retains pointer overview jumps', () => {
    const timeline = createAnalysisCentreData(
      data,
      analysis.timelineSignals,
    ).timeline
    const periods = getTimelinePeriods(timeline.buckets, 'day')
    const open = vi.fn()
    const select = vi.fn()
    const { container } = render(
      <StableActivityTimelineChart
        periods={periods}
        occurrences={timeline.occurrences}
        scale="day"
        visibleSeries={['all']}
        visibleEventTypes={[...eventTypes]}
        selectedPeriodKey={null}
        onPeriodSelect={select}
        onEventOpen={open}
      />,
    )
    const block = container.querySelector<HTMLButtonElement>(
      '[data-slot="activity-timeline-event-block"]',
    )!
    fireEvent.click(block)
    expect(open).toHaveBeenCalledTimes(1)
    expect(select).not.toHaveBeenCalled()
    expect(
      block.querySelector('[data-slot="activity-timeline-event-content"]'),
    ).toBeTruthy()
    const viewport = screen.getByRole('region', {
      name: 'Stable activity calendar',
    })
    Object.defineProperties(viewport, {
      clientWidth: { value: 300 },
      scrollWidth: { value: 2000 },
    })
    viewport.scrollLeft = 1000
    fireEvent.click(
      container.querySelector(
        '[data-slot="activity-timeline-overview-period-button"]',
      )!,
    )
    expect(viewport.scrollLeft).toBeGreaterThanOrEqual(0)
    expect(viewport.scrollLeft).toBeLessThan(1000)
  })

  it('cleans drag listeners on pointer cancellation and unmount', async () => {
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    await show()
    const drag = await screen.findByRole('button', {
      name: 'Move visible timeline window',
    })
    fireEvent.pointerDown(drag, { clientX: 10, pointerId: 1 })
    const firstMove = add.mock.calls
      .filter(([name]) => name === 'pointermove')
      .at(-1)![1]
    fireEvent.pointerCancel(window)
    expect(remove).toHaveBeenCalledWith('pointermove', firstMove)
    fireEvent.pointerDown(drag, { clientX: 20, pointerId: 1 })
    const nextMove = add.mock.calls
      .filter(([name]) => name === 'pointermove')
      .at(-1)![1]
    cleanup()
    expect(remove).toHaveBeenCalledWith('pointermove', nextMove)
  })

  it('searches a 50-horse selector and commits a keyboard option without navigating on typing', async () => {
    const onSelect = vi.fn()
    render(
      <AnalysisScopeSelector
        activeId="stable"
        items={[
          { id: 'stable', label: 'Stable overview' },
          ...data.horses.map((horse) => ({ id: horse._id, label: horse.name })),
        ]}
        onSelect={onSelect}
      />,
    )
    const input = screen.getByRole('combobox', {
      name: 'Analyse stable or horse',
    })
    fireEvent.focus(input)
    fireEvent.click(
      screen.getByRole('button', { name: 'Show analysis subjects' }),
    )
    fireEvent.change(input, { target: { value: 'Sample horse 50' } })
    expect(onSelect).not.toHaveBeenCalled()
    const option = await screen.findByRole('option', {
      name: /Sample horse 50/,
    })
    expect(screen.getAllByRole('option')).toHaveLength(1)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(data.horses[49]._id)
    expect(option.textContent).toContain('Sample horse 50')
  })
})

it('preserves timeline period, event filters and zoom when changing language', async () => {
  localStorage.clear()
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
  await show(false, false, true)
  const scale = await screen.findByRole('group', { name: 'Calendar scale' })
  fireEvent.click(within(scale).getByRole('button', { name: 'Week' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Vet' }))
  fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
  const periods = screen.getByRole('group', {
    name: 'Timeline periods — use arrow keys to select',
  })
  const period = within(periods).getAllByRole('button').at(-1)!
  fireEvent.click(period)
  const before = screen.getByRole('status').textContent
  const zoom = before.match(/Column zoom (\d+)%/)![1]
  fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
    target: { value: 'pl' },
  })
  expect(screen.getByRole('heading', { name: 'Centrum analiz' })).toBeTruthy()
  expect(
    screen
      .getByRole('checkbox', { name: 'Weterynarz' })
      .getAttribute('aria-checked'),
  ).toBe('false')
  expect(period.isConnected).toBe(true)
  expect(period.getAttribute('aria-pressed')).toBe('true')
  expect(
    within(screen.getByRole('group', { name: 'Skala kalendarza' }))
      .getByRole('button', { name: 'Tydzień' })
      .getAttribute('aria-pressed'),
  ).toBe('true')
  expect(screen.getByRole('status').textContent).toContain(
    `Powiększenie kolumn: ${zoom}%`,
  )
  expect(
    screen.getByRole('region', { name: 'Kalendarz aktywności stajni' }),
  ).toBeTruthy()
})

it('counts each recurring occurrence once in monthly totals and detail records, while keeping empty calendar days', () => {
  const recurring = {
    ...data.events[0],
    date: '2026-09-01',
    endDate: undefined,
    recurrence: { frequency: 'daily' as const, interval: 1 },
    status: 'planned' as const,
  }
  const timeline = createAnalysisCentreData(
    { ...data, events: [recurring] },
    [],
    'en',
    { start: '2026-09-01', end: '2026-09-30' },
  ).timeline
  const periods = getTimelinePeriods(timeline.buckets, 'month')
  expect(timeline.buckets).toHaveLength(30)
  expect(periods).toHaveLength(1)
  expect(periods[0].allEventCount).toBe(30)
  expect(periods[0].occurrences).toHaveLength(30)
  expect(
    new Set(periods[0].occurrences.map((record) => record.occurrenceKey)).size,
  ).toBe(30)
})

it('restores subject and historical dates after leaving analysis and returns focus when changing scope', async () => {
  const first = await show(false, false, false, 'test-stable-exploration')
  fireEvent.change(screen.getByLabelText('History period'), {
    target: { value: 'custom' },
  })
  fireEvent.change(screen.getByLabelText('From'), {
    target: { value: '2025-10-01' },
  })
  fireEvent.change(screen.getByLabelText('To'), {
    target: { value: '2026-09-30' },
  })
  const horse = screen.getByRole('button', {
    name: data.horses[0].name,
  })
  horse.focus()
  fireEvent.click(horse)
  expect(document.activeElement).toBe(
    screen.getByRole('combobox', { name: 'Analyse stable or horse' }),
  )
  first.unmount()
  await show(false, false, false, 'test-stable-exploration')
  expect(
    screen.getByRole('heading', { name: data.horses[0].name }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Stable overview' }))
  expect(document.activeElement).toBe(
    screen.getByRole('combobox', { name: 'Analyse stable or horse' }),
  )
  expect(screen.getByLabelText<HTMLInputElement>('From').value).toBe(
    '2025-10-01',
  )
  expect(screen.getByLabelText<HTMLInputElement>('To').value).toBe('2026-09-30')
})
