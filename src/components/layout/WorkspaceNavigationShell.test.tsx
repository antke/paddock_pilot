// @vitest-environment jsdom
import {
  act,
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
  createRoute,
  createRouter,
  RouterProvider,
  useLocation,
} from '@tanstack/react-router'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import {
  SIDEBAR_COLLAPSED_KEY,
  WorkspaceNavigationView,
} from './WorkspaceNavigationShell'
import { DrawerAccountView } from '#/integrations/clerk/DrawerAccount'

const stables = [
  { _id: 'stable-a', name: 'Oak Farm' },
  { _id: 'stable-b', name: 'North Annex' },
]
const savedStableKey = 'paddockPilot.activeStableId'

function setViewport(width: number) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches:
      query === '(min-width: 64rem)'
        ? width >= 1024
        : query === '(min-width: 48rem)'
          ? width >= 768
          : query === '(max-width: 47.999rem)'
            ? width < 768
            : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

beforeEach(() => {
  window.localStorage.clear()
  setViewport(1280)
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function setup(
  href: string,
  actions: {
    onManageAccount?: () => void
    onPreferences?: () => void
    onSignOut?: () => Promise<unknown>
  } = {},
) {
  const root = createRootRoute({
    component: () => {
      const { pathname, searchStr } = useLocation()
      return (
        <WorkspaceNavigationView
          pathname={pathname}
          currentTab={new URLSearchParams(searchStr).get('tab') ?? undefined}
          stables={stables}
          canManageStable
          accountActions={<button>Account and preferences</button>}
          renderDrawerAccount={(closeDrawer) => (
            <DrawerAccountView
              name="Sample member"
              email="sample@example.test"
              onNavigate={() => closeDrawer()}
              onManageAccount={() => closeDrawer(actions.onManageAccount)}
              onPreferences={() => closeDrawer(actions.onPreferences)}
              onSignOut={actions.onSignOut ?? (() => Promise.resolve())}
            />
          )}
        />
      )
    },
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
    history: createMemoryHistory({ initialEntries: [href] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
  return router
}

function headerMenu() {
  return within(
    document.querySelector('[data-slot="app-header"]') as HTMLElement,
  ).getByRole('button', { name: 'Open navigation menu' })
}

function navigation(container: HTMLElement) {
  return within(container).getByRole('navigation', {
    name: 'Primary navigation',
  })
}

function navigationHrefs(container: HTMLElement) {
  return within(navigation(container))
    .getAllByRole('link')
    .map((link) => link.getAttribute('href'))
}

it('keeps stable Home on the stable dashboard with one current item in the sidebar', async () => {
  await setup('/stables/stable-a')
  const sidebar = await screen.findByRole('complementary', { name: 'Menu' })
  const nav = navigation(sidebar)
  const home = within(nav).getByRole('link', { name: 'Home' })
  expect(home.getAttribute('href')).toBe('/stables/stable-a')
  expect(home.getAttribute('aria-current')).toBe('page')
  expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  expect(
    within(nav)
      .getAllByRole('link')
      .slice(0, 4)
      .map((link) => link.textContent),
  ).toEqual(['Home', 'Events', 'Training log', 'Horses'])
})

it.each([
  ['/events', 'Personal', '/'],
  ['/stables/stable-a/events', 'Oak Farm', '/stables/stable-a'],
])(
  'shows one route-scoped workspace in each navigation instance at %s',
  async (href, name, homeHref) => {
    window.localStorage.setItem(savedStableKey, 'stable-b')
    await setup(href)
    const sidebar = await screen.findByRole('complementary', { name: 'Menu' })
    const sidebarHrefs = navigationHrefs(sidebar)
    expect(
      within(sidebar).getAllByRole('button', { name: /^Current workspace:/ }),
    ).toHaveLength(1)
    expect(
      within(sidebar).getByRole('button', {
        name: `Current workspace: ${name}`,
      }),
    ).toBeTruthy()
    expect(
      within(navigation(sidebar))
        .getByRole('link', { name: 'Home' })
        .getAttribute('href'),
    ).toBe(homeHref)
    if (homeHref === '/') {
      expect(
        sidebarHrefs.some((target) => target?.startsWith('/stables/')),
      ).toBe(false)
    } else {
      expect(
        sidebarHrefs.every((target) => target?.startsWith('/stables/stable-a')),
      ).toBe(true)
    }

    fireEvent.click(headerMenu())
    const drawer = await screen.findByRole('dialog', { name: 'Paddock Pilot' })
    expect(
      within(drawer).getAllByRole('button', { name: /^Current workspace:/ }),
    ).toHaveLength(1)
    expect(navigationHrefs(drawer)).toEqual(sidebarHrefs)
    expect(
      navigation(drawer).querySelectorAll('[aria-current="page"]'),
    ).toHaveLength(1)
  },
)

it('persists collapse across remounts and expands from the drawer with restored focus', async () => {
  await setup('/events')
  fireEvent.click(
    await screen.findByRole('button', { name: 'Collapse sidebar' }),
  )
  await waitFor(() => expect(screen.queryByRole('complementary')).toBeNull())
  expect(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY)).toBe('true')
  expect(document.activeElement).toBe(headerMenu())

  cleanup()
  await setup('/events')
  await waitFor(() => expect(screen.queryByRole('complementary')).toBeNull())
  fireEvent.click(headerMenu())
  const drawer = await screen.findByRole('dialog', { name: 'Paddock Pilot' })
  fireEvent.click(
    within(drawer).getByRole('button', { name: 'Expand sidebar' }),
  )
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  const sidebar = await screen.findByRole('complementary', { name: 'Menu' })
  expect(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY)).toBe('false')
  expect(
    within(navigation(sidebar))
      .getByRole('link', { name: 'Events' })
      .getAttribute('aria-current'),
  ).toBe('page')
  await waitFor(() =>
    expect(document.activeElement).toBe(
      within(sidebar).getByRole('button', { name: 'Collapse sidebar' }),
    ),
  )
})

it('uses one icon-only mobile opener and restores focus from the full-screen menu', async () => {
  setViewport(390)
  await setup('/stables/stable-a/events')
  const sidebar = await screen.findByRole('complementary', { name: 'Menu' })
  const expectedHrefs = navigationHrefs(sidebar)
  const menu = screen.getByRole('button', { name: 'Open navigation menu' })
  expect(menu.textContent).toBe('')
  expect(menu.closest('[data-slot="mobile-app-navigation"]')).toBeTruthy()
  expect(
    within(
      document.querySelector('[data-slot="app-header"]') as HTMLElement,
    ).queryByRole('button', { name: 'Open navigation menu' }),
  ).toBeNull()
  act(() => menu.focus())
  fireEvent.click(menu)
  const drawer = await screen.findByRole('dialog', { name: 'Paddock Pilot' })
  expect(screen.getAllByRole('dialog')).toHaveLength(1)
  expect(navigationHrefs(drawer)).toEqual(expectedHrefs)
  const close = within(drawer).getByRole('button', {
    name: 'Close navigation menu',
  })
  expect(close.textContent).toBe('')
  expect(
    within(drawer).getAllByRole('button', { name: 'Close navigation menu' }),
  ).toHaveLength(1)
  fireEvent.click(
    within(drawer).getByRole('button', { name: 'Close navigation menu' }),
  )
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(menu))
})

it('keeps menu access in the header on mobile task screens without bottom navigation', async () => {
  setViewport(390)
  await setup('/events/create')
  expect(
    document.querySelector('[data-slot="mobile-app-navigation"]'),
  ).toBeNull()
  const menu = headerMenu()
  fireEvent.click(menu)
  const drawer = await screen.findByRole('dialog', { name: 'Paddock Pilot' })
  fireEvent.click(
    within(drawer).getByRole('button', { name: 'Close navigation menu' }),
  )
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

it('returns focus to Menu when resizing hides the mobile menu opener', async () => {
  setViewport(390)
  await setup('/events')
  const more = await screen.findByRole('button', {
    name: 'Open navigation menu',
  })
  act(() => more.focus())
  fireEvent.click(more)
  const drawer = await screen.findByRole('dialog', { name: 'Paddock Pilot' })
  setViewport(900)
  fireEvent.click(
    within(drawer).getByRole('button', { name: 'Close navigation menu' }),
  )
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  await waitFor(() => expect(document.activeElement).toBe(headerMenu()))
})

it('switches to Personal home and closes the drawer despite a saved stable preference', async () => {
  setViewport(390)
  window.localStorage.setItem(savedStableKey, 'stable-a')
  const router = await setup('/stables/stable-a/events')
  fireEvent.click(
    await screen.findByRole('button', { name: 'Open navigation menu' }),
  )
  const drawer = await screen.findByRole('dialog', { name: 'Paddock Pilot' })
  fireEvent.click(
    within(drawer).getByRole('button', { name: 'Current workspace: Oak Farm' }),
  )
  fireEvent.click(
    await screen.findByRole('menuitemradio', { name: 'Personal' }),
  )
  await waitFor(() => expect(router.state.location.href).toBe('/'))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  const sidebar = await screen.findByRole('complementary', { name: 'Menu' })
  expect(
    within(sidebar).getByRole('button', {
      name: 'Current workspace: Personal',
    }),
  ).toBeTruthy()
  expect(
    within(navigation(sidebar))
      .getByRole('link', { name: 'Home' })
      .getAttribute('href'),
  ).toBe('/')
  expect(navigationHrefs(sidebar)).toContain('/horses/contacts')
  expect(window.localStorage.getItem(savedStableKey)).toBe('stable-a')
})

it.each([
  ['Contacts', 'contacts'],
  ['Stable', 'yard'],
  ['Stable people', 'people'],
])(
  'preserves the %s tab destination and closes the drawer after navigation',
  async (name, tab) => {
    setViewport(390)
    const router = await setup('/stables/stable-a')
    fireEvent.click(
      await screen.findByRole('button', { name: 'Open navigation menu' }),
    )
    const drawer = await screen.findByRole('dialog', { name: 'Paddock Pilot' })
    const link = within(navigation(drawer)).getByRole('link', {
      name,
    })
    const expected = `/stables/stable-a/stable?tab=${tab}`
    expect(link.getAttribute('href')).toBe(expected)
    fireEvent.click(link)
    await waitFor(() => expect(router.state.location.href).toBe(expected))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    const sidebar = await screen.findByRole('complementary', { name: 'Menu' })
    const nav = navigation(sidebar)
    expect(
      within(nav).getByRole('link', { name }).getAttribute('aria-current'),
    ).toBe('page')
    expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
  },
)

it('exposes account destinations directly and closes the drawer when following a profile link', async () => {
  setViewport(390)
  const router = await setup('/events')
  fireEvent.click(
    await screen.findByRole('button', { name: 'Open navigation menu' }),
  )
  const drawer = await screen.findByRole('dialog', { name: 'Paddock Pilot' })
  const account = within(drawer).getByRole('region', {
    name: 'Account and preferences',
  })
  expect(within(account).getByText('sample@example.test')).toBeTruthy()
  expect(
    within(account)
      .getByRole('link', { name: 'Plans and billing' })
      .getAttribute('href'),
  ).toBe('/pricing')
  expect(
    within(account)
      .getByRole('link', { name: 'Manage stables' })
      .getAttribute('href'),
  ).toBe('/stables')
  expect(
    within(account).getByRole('button', { name: 'Preferences' }),
  ).toBeTruthy()
  expect(
    within(account).getByRole('button', { name: 'Manage account' }),
  ).toBeTruthy()
  expect(screen.queryByRole('menu')).toBeNull()
  fireEvent.click(within(account).getByRole('link', { name: 'Your profile' }))
  await waitFor(() => expect(router.state.location.pathname).toBe('/profile'))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})

it.each(['Preferences', 'Manage account'])(
  'releases the drawer before opening %s and hands off focus once',
  async (label) => {
    setViewport(390)
    const action = vi.fn(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
    await setup('/events', { onManageAccount: action, onPreferences: action })
    const opener = await screen.findByRole('button', {
      name: 'Open navigation menu',
    })
    act(() => opener.focus())
    fireEvent.click(opener)
    const drawer = await screen.findByRole('dialog', { name: 'Paddock Pilot' })
    fireEvent.click(within(drawer).getByRole('button', { name: label }))
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(document.activeElement).toBe(opener))
    fireEvent.click(opener)
    const reopened = await screen.findByRole('dialog', {
      name: 'Paddock Pilot',
    })
    fireEvent.click(
      within(reopened).getByRole('button', { name: 'Close navigation menu' }),
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(action).toHaveBeenCalledTimes(1)
  },
)

it('prevents duplicate sign-out, reports failure in the drawer, and permits retry', async () => {
  setViewport(390)
  let reject!: (reason: Error) => void
  const onSignOut = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail
        }),
    )
    .mockResolvedValue(undefined)
  await setup('/events', { onSignOut })
  fireEvent.click(
    await screen.findByRole('button', { name: 'Open navigation menu' }),
  )
  const drawer = await screen.findByRole('dialog', { name: 'Paddock Pilot' })
  const signOut = within(drawer).getByRole<HTMLButtonElement>('button', {
    name: 'Sign out',
  })
  fireEvent.click(signOut)
  fireEvent.click(signOut)
  expect(signOut.disabled).toBe(true)
  expect(signOut.getAttribute('aria-busy')).toBe('true')
  expect(onSignOut).toHaveBeenCalledTimes(1)
  await act(async () => reject(new Error('offline')))
  expect(within(drawer).getByRole('alert').textContent).toContain(
    'We couldn’t sign you out',
  )
  expect(document.activeElement).toBe(within(drawer).getByRole('alert'))
  expect(signOut.disabled).toBe(false)
  fireEvent.click(signOut)
  await waitFor(() => expect(onSignOut).toHaveBeenCalledTimes(2))
  await waitFor(() => expect(signOut.disabled).toBe(false))
  expect(within(drawer).queryByRole('alert')).toBeNull()
})
