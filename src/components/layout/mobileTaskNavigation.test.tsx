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
  useEditSavedExit,
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
function EditSaveHarness() {
  const exit = useEditSavedExit()
  return (
    <>
      <button
        onClick={() =>
          void exit({
            fallback: { to: '/events/$eventId', params: { eventId: 'e1' } },
            updated: {
              to: '/events/$eventId',
              params: { eventId: 'e1' },
              search: { date: '2026-11-05' },
            },
          })
        }
      >
        Save
      </button>
      <Outlet />
    </>
  )
}

async function editRouter(entries: Array<unknown>) {
  const root = createRootRoute({ component: EditSaveHarness })
  const routes = [
    createRoute({
      getParentRoute: () => root,
      path: '/events',
      component: () => <h1>Calendar</h1>,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/events/$eventId',
      validateSearch: (s: Record<string, unknown>) => ({
        date: typeof s.date === 'string' ? s.date : undefined,
      }),
      component: () => <h1>Event detail</h1>,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/events/$eventId/edit',
      component: () => <h1>Event form</h1>,
    }),
  ]
  const history = createMemoryHistory({ initialEntries: entries as string[] })
  const router = createRouter({ routeTree: root.addChildren(routes), history })
  await router.load()
  render(<RouterProvider router={router} />)
  return { router, history }
}

it('pops an edit form back to the page that opened it, then refreshes its address', async () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const { router, history } = await editRouter([
    '/events',
    '/events/e1',
    '/events/e1/edit',
  ])
  // Simulate the Edit link capturing where the form was opened from.
  history.replace('/events/e1/edit', {
    taskOrigin: { href: '/events/e1', index: 1, scrollY: 0 },
    __TSR_index: 2,
  })
  await act(() => router.load())
  fireEvent.click(await screen.findByRole('button', { name: 'Save' }))
  await screen.findByRole('heading', { name: 'Event detail' })
  await waitFor(() =>
    expect(router.state.location.search).toEqual({ date: '2026-11-05' }),
  )
  // The form and the stale detail entry are gone: Back reaches the calendar.
  act(() => history.back())
  await screen.findByRole('heading', { name: 'Calendar' })
})

it('replaces an edit form with its fallback when there is nothing to return to', async () => {
  const { history } = await editRouter(['/events/e1/edit'])
  fireEvent.click(await screen.findByRole('button', { name: 'Save' }))
  await screen.findByRole('heading', { name: 'Event detail' })
  expect(history.location.pathname).toBe('/events/e1')
  expect(history.length).toBe(1)
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
