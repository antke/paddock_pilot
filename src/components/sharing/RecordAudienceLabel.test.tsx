// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { useQuery } from 'convex/react'
import type { Id } from 'convex/_generated/dataModel'
import { RecordAudienceLabel } from './RecordAudienceLabel'

vi.mock('convex/react', () => ({ useQuery: vi.fn() }))
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

async function renderAudience(audience: object) {
  vi.mocked(useQuery).mockReturnValue(audience)
  const root = createRootRoute({
    component: () => (
      <RecordAudienceLabel horseId={'h1' as Id<'horses'>} recordId="r1" />
    ),
  })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

it('states a private record as a plain line, with the rules behind help and no disclosure', async () => {
  await renderAudience({ shared: false, canManage: false })
  expect(await screen.findByText('Private · owner and carers')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Who can see this' })).toBeTruthy()
  expect(document.querySelector('details')).toBeNull()
  expect(screen.queryByRole('link', { name: 'Manage sharing' })).toBeNull()
})

it('names every calendar a shared record reaches, once, and links managers to sharing', async () => {
  const stable = { _id: 's1', name: 'Test stable' }
  await renderAudience({
    shared: true,
    stable,
    activityCalendars: [stable, { _id: 's2', name: 'Cedar Yard' }],
    canManage: true,
  })
  expect(await screen.findByText('Shared · Test stable, Cedar Yard')).toBeTruthy()
  expect(
    screen.getByRole('link', { name: 'Manage sharing' }).getAttribute('href'),
  ).toBe('/horses/h1/manage')
})
