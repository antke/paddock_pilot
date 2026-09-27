// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useMutation } from 'convex/react'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import {
  HorseActivityPageLab,
  createHorseActivitySampleEvents,
} from '#/components/page-lab/prototypes/HorseActivityPageLab'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { groupHorseActivityEvents } from './horseActivityEvents'

vi.mock('convex/react', () => ({
  useMutation: vi.fn(() => {
    throw new Error('Activity samples cannot mount live mutations')
  }),
}))

beforeEach(() => {
  window.history.replaceState({}, '', '/page-lab/horse-activity')
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

async function openSample() {
  const root = createRootRoute({
    component: () => (
      <HorseActivityPageLab data={createDashboardLabFixtureData()} />
    ),
  })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByLabelText('Sample activity')
}

const today = '2026-09-18'
describe('horse activity status/date contract', () => {
  it('partitions every event exactly once, normalizes legacy planned status and leaves inputs intact', () => {
    const events = createHorseActivitySampleEvents(
      createDashboardLabFixtureData(),
      today,
      'mixed',
    )
    const original = JSON.stringify(events)
    const result = groupHorseActivityEvents(events, today)
    expect(result.upcoming.map((event) => event.title)).toEqual([
      'Sample planned schooling today',
      'Sample legacy event without status',
    ])
    expect(result.upcoming[1].status).toBe('planned')
    expect(result.history.map((event) => event.title)).toEqual([
      'Sample cancelled future lesson',
      'Sample completed visit today',
      'Sample earlier appointment',
    ])
    expect(
      new Set([...result.upcoming, ...result.history].map((event) => event._id))
        .size,
    ).toBe(events.length)
    expect(JSON.stringify(events)).toBe(original)
  })

  it('moves yesterday’s planned event into history through the real local-midnight hook', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 18, 23, 59, 59))
    const events = createHorseActivitySampleEvents(
      createDashboardLabFixtureData(),
      today,
      'mixed',
    )
    const { result } = renderHook(() => {
      const { today: currentDate } = useLocalDateContext()
      return groupHorseActivityEvents(events, currentDate)
    })
    expect(result.current.upcoming.map((event) => event.title)).toContain(
      'Sample planned schooling today',
    )
    act(() => {
      vi.advanceTimersByTime(2100)
    })
    expect(result.current.upcoming.map((event) => event.title)).not.toContain(
      'Sample planned schooling today',
    )
    expect(result.current.history.map((event) => event.title)).toContain(
      'Sample planned schooling today',
    )
  })
})

describe('actual horse activity sample', () => {
  it('shows completed/cancelled events in truthful history and retains actual route links', async () => {
    await openSample()
    expect(screen.queryByText('Sample completed visit today')).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Add event' }).getAttribute('href'),
    ).toContain('/events/create')
    const history = screen.getByRole('button', { name: 'History' })
    history.focus()
    fireEvent.click(history)
    expect(history.getAttribute('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(history)
    expect(
      screen.getByRole('heading', { level: 2, name: 'Activity history' }),
    ).toBeTruthy()
    expect(screen.getByText('Sample completed visit today')).toBeTruthy()
    expect(screen.getByText('Sample cancelled future lesson')).toBeTruthy()
    expect(screen.getByText('Sample earlier appointment')).toBeTruthy()
    expect(screen.queryByText('Sample planned schooling today')).toBeNull()
    expect(
      screen
        .getByRole('link', { name: /Sample cancelled future lesson/ })
        .getAttribute('href'),
    ).toContain('/events/sample-horse-activity-2')
    expect(useMutation).not.toHaveBeenCalled()
  })

  it('filters legacy planned events consistently and restores no-result searches', async () => {
    await openSample()
    fireEvent.click(screen.getByRole('button', { name: 'Toggle filters' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), {
      target: { value: 'planned' },
    })
    expect(screen.getByText('Sample legacy event without status')).toBeTruthy()
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Search activity' }),
      { target: { value: 'impossible-match-zq' } },
    )
    expect(
      screen.getByText('No upcoming activity matches these filters.'),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    expect(screen.getByText('Sample planned schooling today')).toBeTruthy()
  })

  it('provides named keyboard-scroll regions without hiding long history, and distinguishes empty from missing', async () => {
    await openSample()
    const scenario = screen.getByLabelText('Sample activity')
    fireEvent.change(scenario, { target: { value: 'long' } })
    expect(
      screen
        .getByRole('region', { name: 'Juniper — upcoming activity' })
        .getAttribute('tabindex'),
    ).toBe('0')
    fireEvent.click(screen.getByRole('button', { name: 'History' }))
    const history = screen.getByRole('region', {
      name: 'Juniper — activity history',
    })
    expect(history.querySelectorAll('a').length).toBe(20)
    history.focus()
    expect(document.activeElement).toBe(history)
    fireEvent.click(screen.getByRole('button', { name: 'Expand list' }))
    expect(history.querySelectorAll('a').length).toBe(20)
    expect(screen.getByRole('button', { name: 'Compact list' })).toBeTruthy()
    fireEvent.change(scenario, { target: { value: 'empty' } })
    expect(
      screen.getByText('No upcoming activity for this horse.'),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'History' }))
    expect(screen.getByText('No activity history yet.')).toBeTruthy()
    fireEvent.change(scenario, { target: { value: 'missing' } })
    expect(screen.getByRole('alert').textContent).toContain(
      'This sample horse is not available',
    )
    expect(screen.queryByRole('link', { name: 'Add event' })).toBeNull()
  })
})
