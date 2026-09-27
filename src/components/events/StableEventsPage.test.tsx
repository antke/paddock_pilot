// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { StableEventsPage, parseEventsSearch } from './StableEventsPage'

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

async function setup(initial = '/stables/sample-stable/events') {
  const root = createRootRoute()
  const route = createRoute({
    getParentRoute: () => root,
    path: '/stables/$stableId/events/',
    validateSearch: parseEventsSearch,
    component: () => {
      const { view } = route.useSearch()
      const navigate = route.useNavigate()
      return (
        <StableEventsPage
          stableId="sample-stable"
          events={[]}
          view={view}
          onViewChange={(next) =>
            void navigate({
              search: () => (next === 'log' ? { view: 'log' as const } : {}),
              resetScroll: false,
            })
          }
        />
      )
    },
  })
  const router = createRouter({
    routeTree: root.addChildren([route]),
    history: createMemoryHistory({ initialEntries: [initial] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByRole('tab', { name: 'Calendar' })
  return router
}

it('defaults to calendar, switches to the event log and restores calendar with Back', async () => {
  const router = await setup()
  expect(
    screen.getByRole('tab', { name: 'Calendar' }).getAttribute('aria-selected'),
  ).toBe('true')
  expect(screen.getByRole('tabpanel', { name: 'Calendar' })).toBeTruthy()
  expect(
    screen.getByRole('link', { name: 'Add event' }).getAttribute('href'),
  ).toBe('/stables/sample-stable/events/create')
  fireEvent.click(screen.getByRole('tab', { name: 'Event log' }))
  expect(
    await screen.findByRole('tabpanel', { name: 'Event log' }),
  ).toBeTruthy()
  expect(router.state.location.search).toEqual({ view: 'log' })
  expect(screen.getByText('No events added yet.')).toBeTruthy()
  await act(async () => router.history.back())
  await waitFor(() =>
    expect(
      screen
        .getByRole('tab', { name: 'Calendar' })
        .getAttribute('aria-selected'),
    ).toBe('true'),
  )
})

it('opens a bookmarked event log and supports keyboard switching', async () => {
  await setup('/stables/sample-stable/events?view=log')
  const log = screen.getByRole('tab', { name: 'Event log' })
  expect(log.getAttribute('aria-selected')).toBe('true')
  act(() => log.focus())
  fireEvent.keyDown(log, { key: 'ArrowLeft' })
  await waitFor(() =>
    expect(
      screen
        .getByRole('tab', { name: 'Calendar' })
        .getAttribute('aria-selected'),
    ).toBe('true'),
  )
})

it('falls back to the calendar for unsupported view parameters', () => {
  for (const view of [undefined, 'calendar', 'invalid', ['log']])
    expect(parseEventsSearch({ view })).toEqual({})
})
