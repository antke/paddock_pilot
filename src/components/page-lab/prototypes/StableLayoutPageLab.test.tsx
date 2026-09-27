// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { StableLayoutPageLab } from './StableLayoutPageLab'

const access = vi.hoisted(() => ({ enabled: true }))
vi.mock('#/lib/devAuthBypass', () => ({
  useDevAuthBypassEnabled: () => access.enabled,
}))
vi.mock('convex/react', () => ({
  useQuery: () => {
    throw new Error('Live query in local layout sample')
  },
  useMutation: () => {
    throw new Error('Live mutation in local layout sample')
  },
}))
afterEach(() => {
  cleanup()
  access.enabled = true
  vi.restoreAllMocks()
})
async function show() {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const root = createRootRoute({ component: StableLayoutPageLab })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  await screen.findByRole('navigation', { name: 'breadcrumb' })
  return router
}
function current() {
  const nav = screen.getByRole('navigation', { name: 'breadcrumb' })
  const pages = nav.querySelectorAll('[aria-current="page"]')
  expect(pages).toHaveLength(1)
  expect(pages[0].hasAttribute('href')).toBe(false)
  return pages[0]
}
it('uses actual current-page semantics and native parent destinations inside the isolated sample', async () => {
  const outerRouter = await show()
  const nav = screen.getByRole('navigation', { name: 'breadcrumb' })
  expect(current().textContent).toBe('Care')
  expect(
    within(nav).getByRole('link', { name: 'Dashboard' }).getAttribute('href'),
  ).toBe('/')
  expect(
    within(nav).getByRole('link', { name: 'Horses' }).getAttribute('href'),
  ).toBe('/stables/sample-stable/horses')
  const horse = within(nav).getByRole('link', { name: 'Juniper' })
  expect(horse.getAttribute('href')).toBe(
    '/stables/sample-stable/horses/sample-horse/profile',
  )
  fireEvent.click(horse)
  await waitFor(() => expect(current().textContent).toBe('Juniper'))
  expect(outerRouter.state.location.pathname).toBe('/')
  fireEvent.click(within(nav).getByRole('link', { name: 'Dashboard' }))
  await screen.findByText('Sample dashboard')
  expect(screen.queryByRole('navigation', { name: 'breadcrumb' })).toBeNull()
  expect(outerRouter.state.location.pathname).toBe('/')
})
it('updates fallback and long record labels without changing their actual destinations', async () => {
  await show()
  fireEvent.change(screen.getByLabelText('Sample record labels'), {
    target: { value: 'unavailable' },
  })
  let nav = screen.getByRole('navigation', { name: 'breadcrumb' })
  expect(
    within(nav).getByRole('link', { name: 'Horse' }).getAttribute('href'),
  ).toBe('/stables/sample-stable/horses/sample-horse/profile')
  fireEvent.change(screen.getByLabelText('Sample record labels'), {
    target: { value: 'long' },
  })
  expect(
    within(nav).getByRole('link', {
      name: 'Juniper of the North Meadow and the Old Orchard',
    }),
  ).toBeTruthy()
  fireEvent.change(screen.getByLabelText('Sample page'), {
    target: { value: '/events/sample-event/edit' },
  })
  await waitFor(() => expect(current().textContent).toBe('Edit event'))
  nav = screen.getByRole('navigation', { name: 'breadcrumb' })
  expect(
    within(nav).getByRole('link', { name: 'Events' }).getAttribute('href'),
  ).toBe('/stables/sample-stable/events')
  const event = within(nav).getByRole('link', {
    name: 'Autumn care visit for the horses at the north meadow and the old orchard',
  })
  expect(event.getAttribute('href')).toBe(
    '/stables/sample-stable/events/sample-event',
  )
  fireEvent.change(screen.getByLabelText('Sample record labels'), {
    target: { value: 'unavailable' },
  })
  expect(within(nav).getByRole('link', { name: 'Event' })).toBeTruthy()
  fireEvent.click(within(nav).getByRole('link', { name: 'Event' }))
  await waitFor(() => expect(current().textContent).toBe('Event'))
})
it('keeps special list/create paths as their actual terminal pages', async () => {
  await show()
  for (const [path, label] of [
    ['', 'Overview'],
    ['/horses/create', 'Add horse'],
    ['/horses/deleted', 'Deleted horses'],
    ['/settings', 'Settings'],
  ]) {
    fireEvent.change(screen.getByLabelText('Sample page'), {
      target: { value: path },
    })
    await waitFor(() => expect(current().textContent).toBe(label))
  }
})
it('does not mount the isolated router outside development sample access', () => {
  access.enabled = false
  render(<StableLayoutPageLab />)
  expect(
    screen.getByText('Stable layout samples require development sample data.'),
  ).toBeTruthy()
  expect(screen.queryByLabelText('Sample page')).toBeNull()
})
