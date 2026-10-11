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
  Link,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, expect, it, vi } from 'vitest'
import {
  isLocalTaskOrigin,
  useMobileTaskReturn,
  useTaskOriginState,
} from './mobileTaskNavigation'
import { keyboardViewportInset } from './useMobileViewport'
import { isMobileTaskPath, mobileStableId } from './MobileNavigation'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
it('accepts local browse origins and rejects external, malformed and negative positions', () => {
  for (const href of [
    '/',
    '/stables/a/training?view=week',
    '/horses/h/profile',
    '/events',
    '/training',
  ])
    expect(isLocalTaskOrigin({ href, index: 1, scrollY: 120 })).toBe(true)
  for (const href of [
    '//evil.test',
    'https://evil.test',
    '/events\\evil',
    '/profile',
    '/trainingevil',
  ])
    expect(isLocalTaskOrigin({ href, index: 1, scrollY: 0 })).toBe(false)
  expect(isLocalTaskOrigin({ href: '/events', index: -1, scrollY: 0 })).toBe(
    false,
  )
  expect(
    isLocalTaskOrigin({ href: '/events', index: 1, scrollY: Infinity }),
  ).toBe(false)
})
it('distinguishes stable browse routes and task routes without inventing a stable', () => {
  expect(mobileStableId('/stables/a/events')).toBe('a')
  for (const path of ['/stables', '/stables/create', '/horses/h/profile'])
    expect(mobileStableId(path)).toBeUndefined()
  expect(isMobileTaskPath('/stables/a/training/create')).toBe(true)
  expect(isMobileTaskPath('/events/e/edit')).toBe(true)
  expect(isMobileTaskPath('/events')).toBe(false)
})
it('uses visual viewport occlusion but ignores pinch zoom and browser chrome', () => {
  expect(keyboardViewportInset(844, 500, 0, 1)).toBe(344)
  expect(keyboardViewportInset(844, 500, 44, 1)).toBe(300)
  expect(keyboardViewportInset(500, 500, 0, 1)).toBe(0)
  expect(keyboardViewportInset(844, 780, 0, 1)).toBe(0)
  expect(keyboardViewportInset(844, 400, 0, 2)).toBe(0)
})
it.each(['/events', '/training'])(
  'returns a mobile task to the same %s history entry and search',
  async (path) => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const root = createRootRoute({ component: Outlet })
    const list = createRoute({
      getParentRoute: () => root,
      path,
      component: () => {
        const state = useTaskOriginState()
        return (
          <Link to="/events/create" state={state}>
            Add event
          </Link>
        )
      },
    })
    const form = createRoute({
      getParentRoute: () => root,
      path: '/events/create',
      component: () => {
        const finish = useMobileTaskReturn('/events')
        return <button onClick={() => finish()}>Saved</button>
      },
    })
    const router = createRouter({
      routeTree: root.addChildren([list, form]),
      history: createMemoryHistory({ initialEntries: [`${path}?view=log`] }),
    })
    await router.load()
    render(<RouterProvider router={router} />)
    fireEvent.click(await screen.findByRole('link', { name: 'Add event' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Saved' }))
    await waitFor(() =>
      expect(router.state.location.href).toBe(`${path}?view=log`),
    )
    expect(router.state.location.state.__TSR_index).toBe(0)
    await act(async () => {})
  },
)
