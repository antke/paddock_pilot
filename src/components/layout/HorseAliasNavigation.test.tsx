// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Route as HorseIndexRoute } from '#/routes/stables/_layout/$stableId/horses/$horseId/index'
import { Route as HorseHealthRoute } from '#/routes/stables/_layout/$stableId/horses/$horseId/health'

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it.each([
  { alias: HorseIndexRoute, suffix: '/', destination: 'profile' },
  { alias: HorseHealthRoute, suffix: '/health', destination: 'care' },
])(
  'replaces the $suffix horse alias so Back escapes and Forward returns to $destination',
  async ({ alias, suffix, destination }) => {
    // The exported redirect runs in beforeLoad, so the alias never renders and
    // cannot fire mid-navigation from inside the horse layout's outlet.
    const params = { stableId: 'sample-stable-42', horseId: 'sample-horse-73' }
    const root = createRootRoute({ component: Outlet })
    const previous = createRoute({
      getParentRoute: () => root,
      path: '/previous',
      component: () => <h1>Previous page</h1>,
    })
    const aliasPage = createRoute({
      getParentRoute: () => root,
      path: `/stables/$stableId/horses/$horseId${suffix}`,
      beforeLoad: (context) => alias.options.beforeLoad?.(context as never),
    })
    const destinationPage = createRoute({
      getParentRoute: () => root,
      path: `/stables/$stableId/horses/$horseId/${destination}`,
      component: () => <h1>Horse {destination}</h1>,
    })
    const horsePath = `/stables/${params.stableId}/horses/${params.horseId}`
    const history = createMemoryHistory({
      initialEntries: ['/previous', `${horsePath}${suffix}`],
    })
    const router = createRouter({
      routeTree: root.addChildren([previous, aliasPage, destinationPage]),
      history,
    })
    await router.load()
    render(<RouterProvider router={router} />)

    expect(
      await screen.findByRole('heading', { name: `Horse ${destination}` }),
    ).toBeTruthy()
    expect(history.location.pathname).toBe(`${horsePath}/${destination}`)

    act(() => history.back())
    expect(
      await screen.findByRole('heading', { name: 'Previous page' }),
    ).toBeTruthy()
    expect(history.location.pathname).toBe('/previous')

    act(() => history.forward())
    expect(
      await screen.findByRole('heading', { name: `Horse ${destination}` }),
    ).toBeTruthy()
    await waitFor(() => expect(router.state.status).toBe('idle'))
    expect(history.location.pathname).toBe(`${horsePath}/${destination}`)
    expect(history.length).toBe(2)
  },
)
