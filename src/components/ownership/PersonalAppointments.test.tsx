// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Doc, Id } from 'convex/_generated/dataModel'
import {
  PersonalAppointmentsView,
  UpcomingAppointments,
} from './PersonalAppointments'

vi.mock('#/lib/useLocalDateContext', () => ({
  useLocalDateContext: () => ({ today: '2026-10-07' }),
}))

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

const events: Array<Doc<'events'>> = Array.from({ length: 15 }, (_, index) => ({
  _id: `visit-${index}` as Id<'events'>,
  _creationTime: index,
  createdBy: 'owner' as Id<'users'>,
  horseIds: [],
  title: `Appointment ${index + 1}`,
  date: `2026-10-${String(7 + index).padStart(2, '0')}`,
  time: '10:00',
  type: index === 14 ? 'dentist' : 'vet',
}))
const history: Doc<'events'> = {
  ...events[0],
  _id: 'historic' as Id<'events'>,
  title: 'Earlier dental visit',
  date: '2026-09-01',
  type: 'dentist',
  status: 'completed',
}

async function open(component: () => React.ReactNode) {
  const root = createRootRoute({ component })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

it('keeps appointments beyond the preview limit and past visits searchable in the full list', async () => {
  await open(() => (
    <PersonalAppointmentsView
      events={[history, ...events]}
      onViewChange={() => {}}
    />
  ))
  await screen.findByRole('tab', { name: 'All events' })
  expect(screen.getAllByRole('listitem')).toHaveLength(16)
  expect(screen.getByText('Earlier dental visit')).toBeTruthy()
  expect(screen.getByText('Appointment 15')).toBeTruthy()
  expect(
    screen.getByRole('link', { name: 'Add event' }).getAttribute('href'),
  ).toBe('/events/create')

  fireEvent.change(screen.getByRole('searchbox'), {
    target: { value: 'Appointment 15' },
  })
  expect(screen.queryByText('Appointment 1')).toBeNull()
  expect(screen.getByText('Appointment 15')).toBeTruthy()
  fireEvent.change(screen.getByRole('searchbox'), {
    target: { value: 'Earlier dental' },
  })
  expect(screen.getByText('Earlier dental visit')).toBeTruthy()
  expect(screen.queryByText('Appointment 15')).toBeNull()
})

it('offers the complete list from a limited occurrence preview', async () => {
  await open(() => <UpcomingAppointments events={events} />)
  await screen.findByText('Upcoming appointments')
  expect(screen.getByText('Appointment 12')).toBeTruthy()
  expect(screen.queryByText('Appointment 13')).toBeNull()
  expect(
    screen
      .getByRole('link', { name: 'View all appointments' })
      .getAttribute('href'),
  ).toBe('/events')
})
