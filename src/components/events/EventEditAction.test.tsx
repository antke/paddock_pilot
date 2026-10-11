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
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Doc } from 'convex/_generated/dataModel'
import { EventDetail } from './EventDetail'
import { EventEditAction } from './EventEditAction'

vi.mock('#/lib/useSmallScreen', () => ({ useSmallScreen: () => true }))
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

async function mount(canManage = true, stable = false) {
  const root = createRootRoute()
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () =>
      stable ? (
        <EventEditAction eventId="session" stableId="yard" training mobile />
      ) : (
        <EventDetail
          event={
            {
              _id: 'session',
              title: 'Schooling',
              type: 'training',
              date: '2026-10-09',
              time: '10:00',
            } as Doc<'events'>
          }
          horses={[]}
          canManageEvent={canManage}
          showHorses={false}
          showServiceDetails={false}
        />
      ),
  })
  const edit = createRoute({
    getParentRoute: () => root,
    path: stable
      ? '/stables/$stableId/training/$eventId/edit'
      : '/events/$eventId/edit',
    component: () => <h1>Editing session</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([index, edit]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  return router
}

it.each([false, true])(
  'opens the editor directly from the mobile pencil and retains the return destination (stable: %s)',
  async (stable) => {
    const router = await mount(true, stable)
    const links = await screen.findAllByRole('link', {
      name: 'Edit training session',
    })
    expect(links).toHaveLength(1)
    const link = links[0]
    const destination = stable
      ? '/stables/yard/training/session/edit'
      : '/events/session/edit'
    expect(link.getAttribute('href')).toBe(destination)
    expect(link.closest('[data-slot="mobile-floating-action"]')).toBeTruthy()
    expect(screen.queryByRole('menu')).toBeNull()
    fireEvent.click(link)
    await screen.findByRole('heading', { name: 'Editing session' })
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(destination),
    )
    expect(router.state.location.state.taskOrigin?.href).toBe('/')
  },
)

it('does not offer a mobile edit action without management permission', async () => {
  await mount(false)
  await screen.findByRole('heading', { name: 'Schooling' })
  expect(
    screen.queryByRole('link', { name: 'Edit training session' }),
  ).toBeNull()
})
