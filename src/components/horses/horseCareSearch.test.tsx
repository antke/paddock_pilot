// @vitest-environment jsdom
import {
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { HorseDetail } from './HorseDetail'
import { HorseCareSection } from './HorseCareSection'
import { parseHorseCareSearch } from './horseCareSearch'

vi.mock('./HorseHealthIssuesCard', () => ({
  HorseHealthIssuesCard: () => <p>Sample health records</p>,
}))
vi.mock('../reminders/HorseCareRemindersCard', () => ({
  HorseCareRemindersCard: () => <p>Sample reminders</p>,
}))
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('horse care deep-link selection', () => {
  it('accepts only the supported optional health view', () => {
    expect(parseHorseCareSearch({ careView: 'health' })).toEqual({
      careView: 'health',
    })
    for (const careView of ['reminders', 'invalid', ['health'], undefined])
      expect(parseHorseCareSearch({ careView })).toEqual({})
  })

  it('opens real care composition on health and keeps URL selection in sync when switching', async () => {
    const data = createDashboardLabFixtureData()
    const horse = data.horses[0]
    const root = createRootRoute()
    const care = createRoute({
      getParentRoute: () => root,
      path: '/stables/$stableId/horses/$horseId/care',
      validateSearch: parseHorseCareSearch,
      component: () => (
        <HorseDetail
          stableId={data.stable._id}
          horse={horse}
          events={[]}
          canManageHorse={false}
        />
      ),
    })
    const router = createRouter({
      routeTree: root.addChildren([care]),
      history: createMemoryHistory({
        initialEntries: [
          `/stables/${data.stable._id}/horses/${horse._id}/care?careView=health`,
        ],
      }),
    })
    await router.load()
    render(<RouterProvider router={router} />)
    expect(await screen.findByText('Sample health records')).toBeTruthy()
    expect(screen.queryByText('Sample reminders')).toBeNull()
    fireEvent.click(screen.getByRole('tab', { name: 'Care reminders' }))
    expect(await screen.findByText('Sample reminders')).toBeTruthy()
    await waitFor(() => expect(router.state.location.search).toEqual({}))
    fireEvent.click(screen.getByRole('tab', { name: 'Health issues' }))
    expect(await screen.findByText('Sample health records')).toBeTruthy()
    expect(router.state.location.search).toEqual({ careView: 'health' })
  })

  it('keeps the standalone sample locally selectable with no route search dependency', async () => {
    const data = createDashboardLabFixtureData()
    const root = createRootRoute({
      component: () => (
        <HorseCareSection
          stableId={data.stable._id}
          horse={data.horses[0]}
          events={[]}
        />
      ),
    })
    const router = createRouter({
      routeTree: root,
      history: createMemoryHistory({ initialEntries: ['/'] }),
    })
    await router.load()
    render(<RouterProvider router={router} />)
    expect(await screen.findByText('Sample reminders')).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: 'Health issues' }))
    expect(screen.getByText('Sample health records')).toBeTruthy()
  })
})
