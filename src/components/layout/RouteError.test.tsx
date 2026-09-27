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
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { RouteQueryErrorAlert } from './RouteStatusAlert'
import { RouteError } from './RouteError'
import { RoutePending } from './RoutePending'
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
  useSuspenseQuery,
} from '@tanstack/react-query'

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

it('handles repeated loader failure, pending duplicate activation and a later successful retry', async () => {
  let release = () => {}
  let calls = 0
  const loader = vi.fn(async () => {
    calls++
    if (calls === 2)
      await new Promise<void>((resolve) => {
        release = resolve
      })
    if (calls <= 2) throw new Error('Private loader details')
    return 'Recovered'
  })
  const root = createRootRoute({ component: Outlet })
  const page = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader,
    component: () => <h1>Recovered loader</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([page]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
    defaultErrorComponent: RouteError,
    defaultPendingComponent: RoutePending,
    defaultPendingMs: 0,
    defaultPendingMinMs: 0,
  })
  await router.load()
  render(<RouterProvider router={router} />)
  expect(
    await screen.findByRole('heading', {
      name: 'This page couldn’t load',
      level: 1,
    }),
  ).toBeTruthy()
  expect(screen.queryByText('Private loader details')).toBeNull()
  const retry = screen.getByRole('button', { name: 'Try again' })
  act(() => {
    fireEvent.click(retry)
    fireEvent.click(retry)
  })
  await waitFor(() => expect(loader).toHaveBeenCalledTimes(2))
  expect(await screen.findByText('Loading page…')).toBeTruthy()
  await act(async () => release())
  const nextRetry = await screen.findByRole('button', { name: 'Try again' })
  fireEvent.click(nextRetry)
  expect(
    await screen.findByRole('heading', { name: 'Recovered loader' }),
  ).toBeTruthy()
  expect(loader).toHaveBeenCalledTimes(3)
})

it('does not reset the old boundary after deferred recovery is interrupted by navigation', async () => {
  let release = () => {}
  let initial = true
  const reset = vi.fn()
  const root = createRootRoute({ component: Outlet })
  const broken = createRoute({
    getParentRoute: () => root,
    path: '/broken',
    loader: async () => {
      if (initial) {
        initial = false
        throw new Error('Private error')
      }
      await new Promise<void>((resolve) => {
        release = resolve
      })
      return 'Old route'
    },
    component: () => <h1>Old route</h1>,
  })
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <h1>Home page</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([broken, home]),
    history: createMemoryHistory({ initialEntries: ['/broken'] }),
    defaultErrorComponent: (props) => (
      <RouteError
        {...props}
        reset={() => {
          reset()
          props.reset()
        }}
      />
    ),
    defaultPendingMs: 0,
    defaultPendingMinMs: 0,
  })
  await router.load()
  render(<RouterProvider router={router} />)
  fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))
  await act(async () => {
    await router.navigate({ to: '/' })
  })
  expect(await screen.findByRole('heading', { name: 'Home page' })).toBeTruthy()
  await act(async () => release())
  expect(screen.getByRole('heading', { name: 'Home page' })).toBeTruthy()
  expect(reset).not.toHaveBeenCalled()
})

it('resets actual suspense query failure and preserves explicit route-specific messages', async () => {
  let fails = true
  const queryFn = vi.fn(async () => {
    if (fails) throw new Error('Private query details')
    return 'Query recovered'
  })
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  function Page() {
    const { data } = useSuspenseQuery({ queryKey: ['route-recovery'], queryFn })
    return <h1>{data}</h1>
  }
  const root = createRootRoute({
    component: () => (
      <QueryClientProvider client={client}>
        <QueryErrorResetBoundary>
          <Outlet />
        </QueryErrorResetBoundary>
      </QueryClientProvider>
    ),
  })
  const page = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: Page,
    errorComponent: SpecificError,
  })
  const router = createRouter({
    routeTree: root.addChildren([page]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
    defaultErrorComponent: RouteError,
    defaultPendingComponent: RoutePending,
    defaultPendingMinMs: 0,
  })
  await router.load()
  render(<RouterProvider router={router} />)
  expect(await screen.findByText('Your stable couldn’t load')).toBeTruthy()
  expect(screen.queryByText('This page couldn’t load')).toBeNull()
  fails = false
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(
    await screen.findByRole('heading', { name: 'Query recovered' }),
  ).toBeTruthy()
  expect(queryFn).toHaveBeenCalledTimes(2)
  client.clear()
})

it('offers a safe home escape from a persistent component render error without exposing raw details', async () => {
  const root = createRootRoute({ component: Outlet })
  const broken = createRoute({
    getParentRoute: () => root,
    path: '/broken',
    component: () => {
      throw new Error('Private rendered error')
    },
  })
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <h1>Home page</h1>,
  })
  const router = createRouter({
    routeTree: root.addChildren([broken, home]),
    history: createMemoryHistory({ initialEntries: ['/broken'] }),
    defaultErrorComponent: RouteError,
  })
  await router.load()
  render(<RouterProvider router={router} />)
  expect(
    await screen.findByRole('heading', { name: 'This page couldn’t load' }),
  ).toBeTruthy()
  expect(screen.queryByText('Private rendered error')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  expect(await screen.findByRole('button', { name: 'Try again' })).toBeTruthy()
  expect(screen.queryByText('Private rendered error')).toBeNull()
  fireEvent.click(screen.getByRole('link', { name: 'Go home' }))
  expect(await screen.findByRole('heading', { name: 'Home page' })).toBeTruthy()
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
function SpecificError({ reset }: ErrorComponentProps) {
  return (
    <RouteQueryErrorAlert
      reset={reset}
      title="Your stable couldn’t load"
      description="Check your connection."
    />
  )
}

it('reruns an actual failed loader rather than only resetting its React boundary', async () => {
  let fails = true
  const loader = vi.fn(async () => {
    if (fails) throw new Error('Private backend error')
    return 'Loaded'
  })
  const root = createRootRoute({ component: Outlet })
  const page = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader,
    component: () => <h1>Recovered page</h1>,
    errorComponent: SpecificError,
  })
  const router = createRouter({
    routeTree: root.addChildren([page]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
    defaultPendingMinMs: 0,
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByText('Your stable couldn’t load')
  fails = false
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  await waitFor(() => expect(loader).toHaveBeenCalledTimes(2))
  expect(
    await screen.findByRole('heading', { name: 'Recovered page' }),
  ).toBeTruthy()
})
