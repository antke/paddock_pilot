// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
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
  vi.restoreAllMocks()
})
async function show(locked = false, empty = false) {
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
  render(<RouterProvider router={router} />)
}

describe('actual analysis view', () => {
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

  it('names scale controls, keeps full period scope explicit, and exposes all care records', async () => {
    await show()
    const scale = await screen.findByRole('group', { name: 'Calendar scale' })
    expect(
      within(scale)
        .getByRole('button', { name: 'Day' })
        .getAttribute('aria-pressed'),
    ).toBe('true')
    const region = screen.getByRole('region', {
      name: 'Care records in selected period',
    })
    expect(region.tabIndex).toBe(0)
    expect(within(region).getByText('Sample reminder record 10')).toBeTruthy()
    expect(
      screen.getByText(/Display filters affect event blocks only/),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Vet' }))
    expect(within(region).getByText('Sample reminder record 10')).toBeTruthy()
    for (const name of ['Training', 'Dentist', 'Hoof trimming', 'Massage'])
      fireEvent.click(screen.getByRole('checkbox', { name }))
    expect(
      screen.getByText('No event blocks match the selected timeline filters.'),
    ).toBeTruthy()
    expect(
      screen.getByRole('region', { name: 'All events in selected period' })
        .textContent,
    ).toContain('Sample completed visit')
    expect(
      screen.getByText(/Select an event block to open its event page/),
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
      await screen.findByText('No events scheduled in this timeline yet.'),
    ).toBeTruthy()
    expect(
      screen.queryByText(
        'No event blocks match the selected timeline filters.',
      ),
    ).toBeNull()
    expect(screen.getByText('1 period')).toBeTruthy()
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
