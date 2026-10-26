// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { Route as CreateHorseRoute } from '#/routes/stables/_layout/$stableId/horses/create'

const suggestions = vi.hoisted(() =>
  vi.fn(() => ({
    people: [
      { name: 'Alex Rider', isCurrentUser: true },
      { name: 'Owner preferred name', isCurrentUser: false },
      { name: 'Stable nickname', isCurrentUser: false },
    ],
  })),
)
vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
  useConvex: () => ({}),
  useConvexAuth: () => ({ isAuthenticated: true }),
  useQueries: suggestions,
}))
vi.mock('#/lib/devAuthBypass', () => ({ useDevAuthBypassEnabled: () => false }))
afterEach(cleanup)

it('uses the shared people picker scoped to the current stable with the signed-in user first', async () => {
  const stableId = 'current-yard' as Id<'stables'>
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
  })
  client.setQueryData(
    convexQuery(api.stableProviders.listForStable, { stableId }).queryKey,
    { providers: [] },
  )
  client.setQueryData(convexQuery(api.horses.list, { stableId }).queryKey, [])
  const root = createRootRoute()
  const stables = createRoute({ getParentRoute: () => root, path: 'stables' })
  const layout = createRoute({ getParentRoute: () => stables, id: '_layout' })
  const stable = createRoute({
    getParentRoute: () => layout,
    path: '$stableId',
  })
  const create = createRoute({
    getParentRoute: () => stable,
    path: 'horses/create',
    component: CreateHorseRoute.options.component,
  })
  const router = createRouter({
    routeTree: root.addChildren([
      stables.addChildren([layout.addChildren([stable.addChildren([create])])]),
    ]),
    history: createMemoryHistory({
      initialEntries: [`/stables/${stableId}/horses/create`],
    }),
  })
  await router.load()
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  fireEvent.click(await screen.findByRole('button', { name: 'Optional horse details' }))
  fireEvent.click(
    await screen.findByRole('button', { name: 'Show owner name suggestions' }),
  )
  await screen.findByRole('option', { name: 'Stable nickname' })
  expect(
    screen.getAllByRole('option').map((option) => option.textContent),
  ).toEqual(['Alex Rider (me)', 'Owner preferred name', 'Stable nickname'])
  expect(suggestions).toHaveBeenLastCalledWith({
    people: {
      query: api.people.suggestNames,
      args: { stableId, horseIds: [] },
    },
  })
  fireEvent.click(screen.getByRole('option', { name: 'Stable nickname' }))
  expect(screen.getByLabelText<HTMLInputElement>('Owner name').value).toBe(
    'Stable nickname',
  )
})
