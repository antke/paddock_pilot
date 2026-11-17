// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, expect, it, vi } from 'vitest'
import type { Doc } from 'convex/_generated/dataModel'
import { getTodayDateKey } from '#/lib/dateDisplay'
import { EventDetail } from './EventDetail'
import { WorkspaceContext } from '#/components/layout/WorkspaceContext'

vi.mock('convex/react', () => ({
  useQuery: () => [],
  useMutation: () => vi.fn(),
}))
vi.mock('#/lib/useSmallScreen', () => ({ useSmallScreen: () => false }))
afterEach(cleanup)

async function mount(event: Partial<Doc<'events'>>, canManageEvent = false) {
  const root = createRootRoute()
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <EventDetail
        event={
          {
            _id: 'session',
            title: 'Schooling',
            date: '2026-10-09',
            time: '10:00',
            location: 'Indoor arena',
            description: 'Work on rhythm.',
            ...event,
          } as Doc<'events'>
        }
        horses={[]}
        canManageEvent={canManageEvent}
        showHorses={false}
        showServiceDetails={false}
      />
    ),
  })
  const router = createRouter({
    routeTree: root.addChildren([index]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByText('Indoor arena')
}

/** Each label must appear after the one before it. */
function expectInOrder(labels: string[]) {
  const nodes = labels.map((label) => screen.getByText(label, { exact: true }))
  nodes.slice(1).forEach((node, index) => {
    expect(
      nodes[index].compareDocumentPosition(node) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      `${labels[index]} should come before ${labels[index + 1]}`,
    ).toBeTruthy()
  })
}

it('shows who leads a training session, right after when it happens', async () => {
  await mount({
    type: 'training',
    training: { activities: ['flatwork'], format: 'lesson', rider: 'Anna' },
  })
  expect(screen.getByText('Anna')).toBeTruthy()
  // Bookkeeping follows the facts people look for first.
  expectInOrder(['Led by', 'Location', 'Type', 'Status'])
})

it('shows an ordinary event’s status in the header, not as an Overview fact', async () => {
  await mount({ type: 'hoof_trimming', status: 'planned' })
  expect(screen.queryByText('Led by')).toBeNull()
  expect(screen.queryByText('Status', { exact: true })).toBeNull()
  expect(screen.getByText('Planned')).toBeTruthy()
  expectInOrder(['Location', 'Type'])
})

it('leaves a single day and time to the hero date block', async () => {
  await mount({ type: 'hoof_trimming', date: getTodayDateKey() })
  expect(screen.queryByText('Date', { exact: true })).toBeNull()
  expect(screen.queryByText('Time', { exact: true })).toBeNull()
})

it('keeps the date field for multi-day events', async () => {
  await mount({
    type: 'hoof_trimming',
    date: getTodayDateKey(),
    endDate: '2099-01-02',
  })
  expect(screen.getByText('Date', { exact: true })).toBeTruthy()
})

it('lets a manager tick off a started single event from the header', async () => {
  await mount({ type: 'hoof_trimming', status: 'planned', horseIds: [] }, true)
  expect(
    screen.getByRole('button', { name: 'Mark complete: Schooling' }),
  ).toBeTruthy()
  expect(screen.queryByRole('link', { name: 'Change status' })).toBeNull()
})

it('keeps Change status for series, future and cancelled events', async () => {
  for (const event of [
    { recurrence: { frequency: 'weekly', interval: 1 } },
    { date: '2099-01-01' },
    { status: 'cancelled' },
  ] as Array<Partial<Doc<'events'>>>) {
    await mount({ type: 'hoof_trimming', horseIds: [], ...event }, true)
    expect(screen.queryByRole('button', { name: /Mark complete/ })).toBeNull()
    expect(screen.getByRole('link', { name: 'Change status' })).toBeTruthy()
    cleanup()
  }
})

it('keeps the title on its own and names Personal in the meta line', async () => {
  const root = createRootRoute()
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <WorkspaceContext.Provider value={{ label: 'Personal' }}>
        <EventDetail
          event={
            {
              _id: 'session',
              title: 'Flatwork',
              date: '2026-10-09',
              time: '10:00',
              type: 'hoof_trimming',
              horseIds: [],
            } as unknown as Doc<'events'>
          }
          horses={[]}
          canManageEvent={false}
          showHorses={false}
          showServiceDetails={false}
          createdByName="Antek"
        />
      </WorkspaceContext.Provider>
    ),
  })
  const router = createRouter({
    routeTree: root.addChildren([index]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  expect(await screen.findByRole('heading', { name: 'Flatwork' })).toBeTruthy()
  expect(screen.getByText('Personal')).toBeTruthy()
})
