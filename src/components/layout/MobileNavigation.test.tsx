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
  RouterProvider,
} from '@tanstack/react-router'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Dialog, DialogContent, DialogTitle } from '#/components/ui/dialog'
import { MobileNavigationView } from './MobileNavigation'

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
async function setup(pathname: string, stableId?: string) {
  const root = createRootRoute({
    component: () => (
      <MobileNavigationView
        pathname={pathname}
        stableId={stableId}
        // Production wraps Menu in the shell drawer's trigger; a bare dialog stands in for it.
        renderMore={(button) => (
          <Dialog>
            <DialogPrimitive.Trigger render={button} />
            <DialogContent>
              <DialogTitle>Menu</DialogTitle>
            </DialogContent>
          </Dialog>
        )}
      />
    ),
  })
  const router = createRouter({
    routeTree: root.addChildren([
      createRoute({
        getParentRoute: () => root,
        path: '/',
        component: () => null,
      }),
      createRoute({
        getParentRoute: () => root,
        path: '$',
        component: () => null,
      }),
    ]),
    history: createMemoryHistory({ initialEntries: [pathname] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  return router
}
it('has stable destinations, selected page semantics and a focus-restoring menu trigger', async () => {
  await setup('/stables/sample/events', 'sample')
  expect(
    (await screen.findByRole('link', { name: 'Events' })).getAttribute(
      'aria-current',
    ),
  ).toBe('page')
  expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe(
    '/',
  )
  expect(
    screen.getByRole('link', { name: 'Training' }).getAttribute('href'),
  ).toBe('/training')
  const more = screen.getByRole('button', { name: 'Open navigation menu' })
  act(() => more.focus())
  fireEvent.click(more)
  expect(await screen.findByRole('dialog', { name: 'Menu' })).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(more))
})
it('uses personal destinations without a stable and removes navigation on task screens', async () => {
  await setup('/horses')
  expect(await screen.findByRole('link', { name: 'Training' })).toBeTruthy()
  expect(screen.queryByRole('link', { name: 'Today' })).toBeNull()
  cleanup()
  await setup('/stables/sample/events/create', 'sample')
  expect(screen.queryByRole('navigation')).toBeNull()
})

it.each(['/', '/horses/sample', '/events', '/training'])(
  'uses personal Home, Events and Training navigation at %s',
  async (path) => {
    await setup(path)
    const home = await screen.findByRole('link', { name: 'Home' })
    expect(home.getAttribute('href')).toBe('/')
    expect(screen.queryByRole('link', { name: 'My horses' })).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Training' }).getAttribute('href'),
    ).toBe('/training')
    expect(home.getAttribute('aria-current')).toBe(path === '/' ? 'page' : null)
    expect(
      screen.getByRole('link', { name: 'Horses' }).getAttribute('aria-current'),
    ).toBe(path.startsWith('/horses') ? 'page' : null)
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  },
)

it.each([
  ['/stables/sample/horses', 'sample'],
  ['/stables/sample/horses/juniper', 'sample'],
  ['/stables/sample/horses/deleted', 'sample'],
  ['/horses/contacts', undefined],
  ['/horses/deleted', undefined],
])(
  'selects Horses, not Menu, where Back leads to Horses at %s',
  async (path, stableId) => {
    await setup(path, stableId)
    const horses = await screen.findByRole('link', { name: 'Horses' })
    expect(horses.getAttribute('href')).toBe('/horses')
    expect(horses.getAttribute('aria-current')).toBe('page')
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
    expect(
      screen
        .getByRole('button', { name: 'Open navigation menu' })
        .classList.contains('bg-selection-surface'),
    ).toBe(false)
  },
)
