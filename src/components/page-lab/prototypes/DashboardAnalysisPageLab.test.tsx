// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { useMutation } from 'convex/react'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { AnalysisPageLab } from './AnalysisPageLab'
import { StableDashboardPageLab } from './StableDashboardPageLab'
import {
  createAnalysisAuditSample,
  createDashboardAuditSample,
} from './dashboardAnalysisFixtures'

vi.mock('#/lib/devAuthBypass', () => ({ useDevAuthBypassEnabled: () => true }))
vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => {
    throw new Error('Audit samples must not mount live mutations')
  }),
}))
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

async function openSample(component: () => React.ReactNode) {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
  const root = createRootRoute({ component })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

it('uses production occurrence calculations in the dashboard specimen without rewriting source event dates', () => {
  const data = createDashboardAuditSample(
    createDashboardLabFixtureData(),
    'schedule',
    '2026-09-19',
  )
  expect(data.todayEvents.map((event) => event.title)).toContain(
    'Sample weekly schooling',
  )
  expect(data.todayEvents.map((event) => event.title)).toContain(
    'Sample clinic spanning today',
  )
  expect(
    data.events.find((event) => event.title === 'Sample weekly schooling')
      ?.date,
  ).toBe('2026-09-12')
  expect(data.weekDays[0].eventCount).toBe(data.todayEvents.length)
})

it('can expose urgent horses outside the preview and all five kinds of analysis signal', () => {
  const base = createDashboardLabFixtureData()
  const attention = createDashboardAuditSample(base, 'attention', '2026-09-19')
  expect(attention.dueReminders).toHaveLength(0)
  expect(attention.attentionHorses.map((horse) => horse.horseId)).toContain(
    attention.horses[5]._id,
  )
  const crowded = createDashboardAuditSample(base, 'crowded', '2026-09-19')
  expect(crowded.horses).toHaveLength(50)
  const analysis = createAnalysisAuditSample(crowded, '2026-09-19')
  expect(
    new Set(analysis.timelineSignals.map((signal) => signal.kind)).size,
  ).toBe(5)
  expect(
    analysis.timelineSignals.filter((signal) => signal.date === '2026-09-19')
      .length,
  ).toBeGreaterThan(4)
})

it('switches the actual analysis view to locked and empty states without live mutation hooks', async () => {
  await openSample(() => (
    <AnalysisPageLab data={createDashboardLabFixtureData()} />
  ))
  const scenario = await screen.findByLabelText('Sample analysis')
  fireEvent.change(scenario, { target: { value: 'locked' } })
  expect(
    await screen.findByText('Analysis Centre is a Premium feature'),
  ).toBeTruthy()
  expect(screen.queryByRole('group', { name: 'Calendar scale' })).toBeNull()
  fireEvent.change(scenario, { target: { value: 'empty' } })
  await waitFor(() =>
    expect(
      screen.queryByText('Analysis Centre is a Premium feature'),
    ).toBeNull(),
  )
  expect(
    await screen.findByRole('group', { name: 'Calendar scale' }),
  ).toBeTruthy()
  expect(useMutation).not.toHaveBeenCalled()
})

it('offers true empty command-center state through the shared dashboard composition', async () => {
  await openSample(() => (
    <StableDashboardPageLab data={createDashboardLabFixtureData()} />
  ))
  const training = await screen.findByRole('region', {
    name: 'Today’s training',
  })
  expect(within(training).getAllByRole('heading', { level: 3 })).toHaveLength(2)
  expect(within(training).queryByText('Meadow')).toBeNull()
  expect(
    within(training)
      .getByRole('link', { name: /Morning flatwork/ })
      .getAttribute('href'),
  ).toContain('/training/sample-dashboard-training-0?date=')
  expect(within(training).getByText('09:00–09:45')).toBeTruthy()
  expect(within(training).getByText('Completed')).toBeTruthy()
  expect(within(training).getByText('Scheduled')).toBeTruthy()
  fireEvent.change(await screen.findByLabelText('Sample dashboard'), {
    target: { value: 'empty' },
  })
  expect(
    await screen.findByText('No scheduled or completed training today.'),
  ).toBeTruthy()
  expect(await screen.findByText('A quieter day at the stable')).toBeTruthy()
  expect(screen.queryByText('Juniper')).toBeNull()
  expect(useMutation).not.toHaveBeenCalled()
})
