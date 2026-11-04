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
import { EventDetail } from './EventDetail'

vi.mock('convex/react', () => ({ useQuery: () => [] }))
vi.mock('#/lib/useSmallScreen', () => ({ useSmallScreen: () => false }))
afterEach(cleanup)

async function mount(event: Partial<Doc<'events'>>) {
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
        canManageEvent={false}
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
  expectInOrder(['Date', 'Time', 'Led by', 'Location', 'Type', 'Status'])
})

it('puts the status of an ordinary event before its place and type', async () => {
  await mount({ type: 'hoof_trimming', status: 'planned' })
  expect(screen.queryByText('Led by')).toBeNull()
  expectInOrder(['Date', 'Time', 'Status', 'Location', 'Type'])
})
