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
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { RouteRecoveryPageLab } from './RouteRecoveryPageLab'

const access = vi.hoisted(() => ({ enabled: true }))
vi.mock('#/lib/devAuthBypass', () => ({
  useDevAuthBypassEnabled: () => access.enabled,
}))
beforeEach(() => {
  access.enabled = true
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

async function mountInsideApplicationRouter() {
  const root = createRootRoute({ component: Outlet })
  const page = createRoute({
    getParentRoute: () => root,
    path: '/page-lab/route-recovery',
    component: RouteRecoveryPageLab,
  })
  const router = createRouter({
    routeTree: root.addChildren([page]),
    history: createMemoryHistory({
      initialEntries: ['/page-lab/route-recovery'],
    }),
  })
  await router.load()
  const invalidate = vi.spyOn(router, 'invalidate')
  const rendered = render(<RouterProvider router={router} />)
  return { router, invalidate, ...rendered }
}

it('retries a real isolated loader through failure and success, with a local home destination', async () => {
  const { router, invalidate } = await mountInsideApplicationRouter()
  await screen.findByRole('heading', { name: 'This page couldn’t load' })
  fireEvent.change(screen.getByLabelText('Next sample retry'), {
    target: { value: 'failure' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  await screen.findByText('Loading page…')
  await screen.findByRole('button', { name: 'Try again' }, { timeout: 2500 })
  fireEvent.change(screen.getByLabelText('Next sample retry'), {
    target: { value: 'success' },
  })
  fireEvent.change(screen.getByLabelText('Sample load delay'), {
    target: { value: '0' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
  await screen.findByText('Sample page loaded')
  expect(invalidate).not.toHaveBeenCalled()
  expect(router.state.location.pathname).toBe('/page-lab/route-recovery')
  fireEvent.click(screen.getByRole('button', { name: 'Restart sample' }))
  fireEvent.click(await screen.findByRole('link', { name: 'Go home' }))
  await screen.findByText('Sample home')
  expect(router.state.location.pathname).toBe('/page-lab/route-recovery')
  expect(screen.queryByText('Sample page loaded')).toBeNull()
}, 10000)

it('cancels a delayed local attempt on restart without replacing the new error view', async () => {
  const { invalidate } = await mountInsideApplicationRouter()
  fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))
  await screen.findByText('Loading page…')
  fireEvent.click(screen.getByRole('button', { name: 'Restart sample' }))
  await screen.findByRole('heading', { name: 'This page couldn’t load' })
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1600))
  })
  await waitFor(() =>
    expect(screen.queryByText('Sample page loaded')).toBeNull(),
  )
  expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()
  expect(invalidate).not.toHaveBeenCalled()
}, 10000)

it('does not mount the failure fixture outside development sample mode', () => {
  access.enabled = false
  render(<RouteRecoveryPageLab />)
  expect(
    screen.getByText('Route recovery samples require development sample data.'),
  ).toBeTruthy()
  expect(screen.queryByLabelText('Next sample retry')).toBeNull()
})
