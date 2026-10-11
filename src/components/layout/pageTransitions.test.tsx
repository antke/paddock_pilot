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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getPageTransition, installPageTransitions } from './pageTransitions'
import { horseDetailTabs } from '#/components/horses/horseDetailTabs'

const location = (pathname: string, index = 1) => ({
  pathname,
  state: { __TSR_index: index },
})
const change = (from: string, to: string, fromIndex = 1, toIndex = 2) => ({
  fromLocation: location(from, fromIndex),
  toLocation: location(to, toIndex),
})

describe('navigation motion policy', () => {
  it.each([
    ['/', '/events', 'page', 'tab-next'],
    ['/events', '/training', 'page', 'tab-next'],
    ['/stables/a', '/stables/a/training', 'page', 'tab-next'],
    ['/', '/stables/a', 'page', 'fade'],
    ['/', '/horses/a/profile', 'page', 'forward'],
    ['/training', '/events/a', 'page', 'forward'],
    ['/events', '/events/create', 'page', 'create-open'],
    ['/events/a', '/events/a/edit', 'page', 'forward'],
    ['/events/a/edit', '/events/a', 'page', 'back'],
    ['/horses/a/profile', '/', 'page', 'back'],
    ['/horses/a/care', '/horses/a/edit', 'page', 'forward'],
    ['/horses/a/profile', '/horses/a/care', 'horse-section', 'tab-next'],
    [
      '/stables/a/horses/b/training',
      '/stables/a/horses/b/documents',
      'horse-section',
      'tab-next',
    ],
    ['/horses/a/profile', '/horses/b/profile', 'page', 'fade'],
    [
      '/stables/a/horses/h/profile',
      '/stables/b/horses/h/profile',
      'page',
      'fade',
    ],
  ])('%s → %s uses %s / %s', (from, to, scope, direction) => {
    expect(getPageTransition(change(from, to))).toEqual({ scope, direction })
  })

  it.each([
    ['/horses', '/horses/create'],
    ['/horses/a/care', '/events/create'],
    ['/stables', '/stables/create'],
    ['/stables/a', '/stables/create'],
    ['/stables/a/events', '/stables/a/events/create'],
    ['/stables/a/horses', '/stables/a/horses/create'],
    ['/stables/a/training', '/stables/a/training/create'],
    ['/stables/a/horses/h/training', '/events/create'],
  ])('opens %s → %s upward and reverses on return', (from, to) => {
    expect(getPageTransition(change(from, to))).toEqual({
      scope: 'page',
      direction: 'create-open',
    })
    expect(getPageTransition(change(to, from, 2, 1))).toEqual({
      scope: 'page',
      direction: 'create-close',
    })
    // Saving/replacing the form and browser Forward use the same spatial model.
    expect(getPageTransition(change(to, '/horses/new/profile', 2, 2))).toEqual({
      scope: 'page',
      direction: 'create-close',
    })
    expect(getPageTransition(change(from, to, 2, 1))).toEqual({
      scope: 'page',
      direction: 'create-open',
    })
  })

  it('follows the visible horse tab order on direct selection and history navigation', () => {
    for (const base of ['/horses/a', '/stables/yard/horses/a']) {
      for (const [fromIndex, from] of horseDetailTabs.entries()) {
        for (const [toIndex, to] of horseDetailTabs.entries()) {
          const transition = getPageTransition(
            change(`${base}/${from}`, `${base}/${to}`, 5, 4),
          )
          expect(transition).toEqual(
            fromIndex === toIndex
              ? undefined
              : {
                  scope: 'horse-section',
                  direction: toIndex > fromIndex ? 'tab-next' : 'tab-previous',
                },
          )
        }
      }
    }
  })

  it('handles horse aliases and canonical links without moving the identity header', () => {
    expect(
      getPageTransition(
        change('/stables/yard/horses/a/profile', '/horses/a/documents'),
      ),
    ).toEqual({ scope: 'horse-section', direction: 'tab-next' })
    expect(
      getPageTransition(
        change('/horses/a/documents', '/stables/yard/horses/a/profile'),
      ),
    ).toEqual({ scope: 'horse-section', direction: 'tab-previous' })
    for (const base of ['/horses/a', '/stables/yard/horses/a']) {
      expect(getPageTransition(change(base, `${base}/profile`))).toBeUndefined()
      expect(
        getPageTransition(change(`${base}/health`, `${base}/care`)),
      ).toBeUndefined()
      expect(
        getPageTransition(change(`${base}/documents`, `${base}/manage`)),
      ).toEqual({ scope: 'horse-section', direction: 'fade' })
    }
  })

  it('follows tab order between main sections and history direction between records', () => {
    expect(
      getPageTransition(change('/events/a', '/events/b', 3, 2))?.direction,
    ).toBe('back')
    expect(
      getPageTransition(change('/training', '/events', 3, 2))?.direction,
    ).toBe('tab-previous')
    expect(
      getPageTransition(change('/events/b', '/events/b/edit', 2, 3))?.direction,
    ).toBe('forward')
  })

  it('keeps initial loads, query-only changes, public routes and onboarding immediate', () => {
    expect(getPageTransition({ toLocation: location('/') })).toBeUndefined()
    for (const [from, to] of [
      ['/events', '/events'],
      ['/horses/a/care', '/horses/a/care/'],
      ['/events/create', '/events/create'],
      ['/sign-in', '/'],
      ['/', '/pricing'],
      ['/onboarding', '/horses/create'],
      ['/stables/a/welcome', '/stables/a'],
      ['/page-lab', '/events'],
    ])
      expect(getPageTransition(change(from, to))).toBeUndefined()
  })
})

let reducedMotion = false
let typedTransitions = true
let disposers: Array<() => void> = []
const startTransition = vi.fn(
  (options: (() => Promise<void>) | { update: () => Promise<void> }) => {
    const updateCallbackDone = Promise.resolve().then(
      typeof options === 'function' ? options : options.update,
    )
    return {
      updateCallbackDone,
      ready: updateCallbackDone,
      finished: updateCallbackDone,
      skipTransition: vi.fn(),
    }
  },
)

beforeEach(() => {
  reducedMotion = false
  typedTransitions = true
  startTransition.mockClear()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: reducedMotion })),
  )
  vi.stubGlobal('CSS', { supports: () => typedTransitions })
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: startTransition,
  })
})

afterEach(() => {
  cleanup()
  disposers.forEach((dispose) => dispose())
  disposers = []
  Reflect.deleteProperty(document, 'startViewTransition')
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function openApp(loader?: () => Promise<void>) {
  const root = createRootRoute({
    component: () => (
      <>
        <header>
          <Link to="/">Home link</Link>
          <Link to="/events">Events link</Link>
        </header>
        <main data-slot="app-main-content">
          <Outlet />
        </main>
      </>
    ),
  })
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <h1>Home</h1>,
  })
  const events = createRoute({
    getParentRoute: () => root,
    path: '/events',
    loader,
    pendingComponent: () => <p data-slot="route-pending">Loading events</p>,
    component: () => (
      <>
        <h1>Events</h1>
        <input aria-label="Search events" />
      </>
    ),
  })
  const createEvent = createRoute({
    getParentRoute: () => root,
    path: '/events/create',
    component: () => <h1>Create event</h1>,
  })
  const horse = createRoute({
    getParentRoute: () => root,
    path: '/horses/$horseId/$section',
    component: () => <div data-slot="horse-section-content">Horse section</div>,
  })
  const history = createMemoryHistory({ initialEntries: ['/'] })
  const router = createRouter({
    routeTree: root.addChildren([home, events, createEvent, horse]),
    history,
    defaultPendingMs: 250,
    defaultPendingMinMs: 0,
  })
  disposers.push(installPageTransitions(router))
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByRole('heading', { name: 'Home' })
  return router
}

describe('TanStack navigation integration', () => {
  it.each([true, false])(
    'animates route commits, not initial loading or search (typed API: %s)',
    async (typed) => {
      typedTransitions = typed
      const router = await openApp()
      expect(startTransition).not.toHaveBeenCalled()
      const link = screen.getByRole('link', { name: 'Events link' })
      link.focus()
      fireEvent.click(link)
      await screen.findByRole('heading', { name: 'Events' })
      expect(startTransition).toHaveBeenCalledTimes(1)
      expect(document.documentElement.dataset.pageTransition).toBe('tab-next')
      expect(document.activeElement).toBe(link)
      const input = screen.getByLabelText('Search events')
      input.focus()
      await act(() =>
        router.navigate({
          to: '/events',
          search: { q: 'pony' },
          replace: true,
          resetScroll: false,
        } as never),
      )
      expect(startTransition).toHaveBeenCalledTimes(1)
      expect(document.activeElement).toBe(input)
      await act(() => router.invalidate())
      expect(startTransition).toHaveBeenCalledTimes(1)
    },
  )

  it('uses a section snapshot for horse tabs, reverses Back and respects explicit opt-out', async () => {
    const router = await openApp()
    await act(() => router.navigate({ href: '/horses/a/profile' }))
    expect(document.documentElement.dataset.pageTransition).toBe('forward')
    await act(() => router.navigate({ href: '/horses/a/care' }))
    expect(document.documentElement.dataset.transitionScope).toBe(
      'horse-section',
    )
    expect(document.documentElement.dataset.pageTransition).toBe('tab-next')
    act(() => router.history.back())
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/horses/a/profile'),
    )
    await waitFor(() => expect(router.state.status).toBe('idle'))
    expect(document.documentElement.dataset.pageTransition).toBe('tab-previous')
    act(() => router.history.back())
    await screen.findByRole('heading', { name: 'Home' })
    expect(document.documentElement.dataset.pageTransition).toBe('back')
    const count = startTransition.mock.calls.length
    await act(() => router.navigate({ href: '/events', viewTransition: false }))
    expect(startTransition).toHaveBeenCalledTimes(count)
  })

  it('uses vertical creation transitions on open, Back, Forward and successful return', async () => {
    const router = await openApp()
    await act(() => router.navigate({ href: '/events/create' }))
    expect(document.documentElement.dataset.transitionScope).toBe('page')
    expect(document.documentElement.dataset.pageTransition).toBe('create-open')
    act(() => router.history.back())
    await screen.findByRole('heading', { name: 'Home' })
    expect(document.documentElement.dataset.pageTransition).toBe('create-close')
    await waitFor(() => expect(router.state.status).toBe('idle'))
    act(() => router.history.forward())
    await screen.findByRole('heading', { name: 'Create event' })
    expect(document.documentElement.dataset.pageTransition).toBe('create-open')
    await act(() => router.navigate({ href: '/events', replace: true }))
    expect(document.documentElement.dataset.pageTransition).toBe('create-close')
    await act(() => router.navigate({ href: '/' }))
    expect(document.documentElement.dataset.pageTransition).toBe('tab-previous')
  })

  it.each(['reduced', 'unsupported', 'dialog', 'pending'] as const)(
    'navigates immediately with %s',
    async (mode) => {
      const router = await openApp()
      if (mode === 'reduced') reducedMotion = true
      if (mode === 'unsupported')
        Reflect.deleteProperty(document, 'startViewTransition')
      const overlay = document.createElement('div')
      if (mode === 'dialog') overlay.setAttribute('role', 'alertdialog')
      if (mode === 'pending') overlay.dataset.slot = 'route-pending'
      document.body.append(overlay)
      try {
        await act(() => router.navigate({ href: '/events' }))
        expect(screen.getByRole('heading', { name: 'Events' })).toBeTruthy()
        expect(startTransition).not.toHaveBeenCalled()
        await act(() => router.navigate({ href: '/events/create' }))
        await act(() => router.navigate({ href: '/horses/a/profile' }))
        await act(() => router.navigate({ href: '/horses/a/care' }))
        expect(startTransition).not.toHaveBeenCalled()
      } finally {
        overlay.remove()
      }
    },
  )

  it('leaves blocked navigation alone and transitions only after it is allowed', async () => {
    const router = await openApp()
    const blockerFn = vi.fn(() => true)
    const unblock = router.history.block({ blockerFn })
    fireEvent.click(screen.getByRole('link', { name: 'Events link' }))
    await waitFor(() => expect(blockerFn).toHaveBeenCalled())
    expect(screen.getByRole('heading', { name: 'Home' })).toBeTruthy()
    expect(startTransition).not.toHaveBeenCalled()
    unblock()
    await act(() => router.navigate({ href: '/events' }))
    expect(startTransition).toHaveBeenCalledTimes(1)
  })

  it('retains the current page during a short load and follows the latest navigation', async () => {
    let resolve!: () => void
    const router = await openApp(
      () =>
        new Promise<void>((done) => {
          resolve = done
        }),
    )
    fireEvent.click(screen.getByRole('link', { name: 'Events link' }))
    await waitFor(() => expect(resolve).toBeTypeOf('function'))
    expect(screen.queryByText('Loading events')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Home' })).toBeTruthy()
    await act(() => router.navigate({ href: '/horses/a/profile' }))
    await act(async () => {
      resolve()
    })
    expect(router.state.location.pathname).toBe('/horses/a/profile')
    expect(startTransition).toHaveBeenCalledTimes(1)
  })

  it('shows a pending state on a slow load, then does not animate that placeholder', async () => {
    let resolve!: () => void
    await openApp(
      () =>
        new Promise<void>((done) => {
          resolve = done
        }),
    )
    fireEvent.click(screen.getByRole('link', { name: 'Events link' }))
    await screen.findByText('Loading events')
    expect(startTransition).not.toHaveBeenCalled()
    await act(async () => {
      resolve()
    })
    await screen.findByRole('heading', { name: 'Events' })
    expect(startTransition).not.toHaveBeenCalled()
  })
})
