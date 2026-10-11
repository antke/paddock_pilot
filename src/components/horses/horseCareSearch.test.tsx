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
  it('keeps callable care contacts and emergency notes ahead of both care views', () => {
    const horse = {
      ...createDashboardLabFixtureData().horses[0],
      vetName: 'Dr Morgan',
      vetPhone: '+48 123 456 789',
      farrierName: undefined,
      farrierPhone: '987654321',
      emergencyNotes: 'Call the vet before administering medication.',
    }
    render(<HorseCareSection horse={horse} events={[]} />)
    const contacts = screen.getByRole('region', { name: 'Care contacts' })
    const notes = screen.getByRole('region', { name: 'Emergency notes' })
    const tabs = screen.getByRole('tablist')
    expect(
      contacts.compareDocumentPosition(notes) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      notes.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      screen
        .getByRole('link', { name: 'Vet: +48 123 456 789' })
        .getAttribute('href'),
    ).toBe('tel:+48123456789')
    expect(
      screen
        .getByRole('link', { name: 'Farrier: 987654321' })
        .getAttribute('href'),
    ).toBe('tel:987654321')
    fireEvent.click(screen.getByRole('tab', { name: 'Health issues' }))
    expect(screen.getByText('Sample health records')).toBeTruthy()
    expect(screen.getByRole('region', { name: 'Care contacts' })).toBe(contacts)
    expect(screen.getByRole('region', { name: 'Emergency notes' })).toBe(notes)
  })

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
      path: '/horses/$horseId/care',
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
        initialEntries: [`/horses/${horse._id}/care?careView=health`],
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
