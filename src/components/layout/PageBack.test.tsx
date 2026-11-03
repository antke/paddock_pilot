// @vitest-environment jsdom
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { PageBack } from './PageBack'
import { pageBackRuleFor, pageBackRules } from './pageHierarchy'

afterEach(cleanup)

async function renderAt(path: string, page: () => React.ReactNode) {
  const root = createRootRoute()
  const routes = [
    createRoute({
      getParentRoute: () => root,
      path: '/',
      component: () => <p>Home page</p>,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/horses',
      component: () => <p>Horses page</p>,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/horses/contacts',
      component: page,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/horses/create',
      component: page,
    }),
    createRoute({
      getParentRoute: () => root,
      path: '/training',
      component: page,
    }),
  ]
  const history = createMemoryHistory({ initialEntries: [path] })
  const router = createRouter({ routeTree: root.addChildren(routes), history })
  await router.load()
  render(<RouterProvider router={router} />)
  return { router, history }
}

describe('page hierarchy', () => {
  it('gives every page an explicit decision and never points Back at a lab', () => {
    for (const [id, rule] of Object.entries(pageBackRules)) {
      expect(id).not.toMatch(/lab/)
      if (rule && rule !== 'none') expect(rule.to).toMatch(/^\//)
    }
    expect(pageBackRuleFor('/page-lab/$page')).toBe('none')
  })
})

describe('PageBack in page headers', () => {
  it('renders the route parent at the top left by default', async () => {
    await renderAt('/horses/contacts', () => (
      <DashboardPageHeader title="Contacts" />
    ))
    const back = await screen.findByRole('link', { name: 'Back' })
    expect(back.getAttribute('href')).toBe('/horses')
    expect(back.closest('[data-slot="page-back-slot"]')).toBeTruthy()
  })

  it('renders nothing on a global destination', async () => {
    await renderAt('/training', () => <DashboardPageHeader title="Training" />)
    await screen.findByRole('heading', { name: 'Training' })
    expect(screen.queryByRole('link', { name: 'Back' })).toBeNull()
  })

  it('returns to the previous in-app page when the rule prefers history', async () => {
    const { router } = await renderAt('/', () => <PageBack />)
    await act(() => router.navigate({ to: '/horses/create' }))
    await act(() =>
      router.navigate({ to: '/horses/create', replace: true }),
    )
    fireEvent.click(await screen.findByRole('link', { name: 'Back' }))
    expect(await screen.findByText('Home page')).toBeTruthy()
  })

  it('lets a page opt out with null', async () => {
    await renderAt('/horses/contacts', () => (
      <DashboardPageHeader title="Contacts" backAction={null} />
    ))
    await screen.findByRole('heading', { name: 'Contacts' })
    expect(screen.queryByRole('link', { name: 'Back' })).toBeNull()
  })
})
