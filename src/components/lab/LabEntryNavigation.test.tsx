// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Route as PageIndex } from '#/routes/page-lab/index'
import { Route as PageLayout } from '#/routes/page-lab'
import { Route as DashboardIndex } from '#/routes/dashboard-lab/index'
import { Route as DashboardLayout } from '#/routes/dashboard-lab'

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('lab entry navigation', () => {
  for (const lab of [
    {
      path: 'page-lab',
      target: '$page',
      value: 'stable-dashboard',
      index: PageIndex,
      layout: PageLayout,
    },
    {
      path: 'dashboard-lab',
      target: '$version',
      value: '1',
      index: DashboardIndex,
      layout: DashboardLayout,
    },
  ]) {
    it(`${lab.path} replaces its index so Back returns to the previous page`, async () => {
      // Real exported index/layout components with local destination stand-ins.
      // This exercises router history, not authenticated lab rendering.
      const root = createRootRoute()
      const previous = createRoute({
        getParentRoute: () => root,
        path: '/before',
        component: () => <h1>Previous page</h1>,
      })
      const layout = createRoute({
        getParentRoute: () => root,
        path: lab.path,
        component: lab.layout.options.component,
      })
      const index = createRoute({
        getParentRoute: () => layout,
        path: '/',
        component: lab.index.options.component,
      })
      const target = createRoute({
        getParentRoute: () => layout,
        path: lab.target,
        component: () => <h1>Lab sample</h1>,
      })
      const history = createMemoryHistory({
        initialEntries: ['/before', `/${lab.path}/`],
        initialIndex: 1,
      })
      const router = createRouter({
        routeTree: root.addChildren([
          previous,
          layout.addChildren([index, target]),
        ]),
        history,
      })
      await router.load()
      render(<RouterProvider router={router} />)
      await screen.findByRole('heading', { name: 'Lab sample' })
      await waitFor(() =>
        expect(router.state.location.pathname).toBe(
          `/${lab.path}/${lab.value}`,
        ),
      )
      await act(async () => history.back())
      await screen.findByRole('heading', { name: 'Previous page' })
      expect(router.state.location.pathname).toBe('/before')
      await act(async () => history.forward())
      await screen.findByRole('heading', { name: 'Lab sample' })
      expect(history.length).toBe(2)
    })
  }
})
