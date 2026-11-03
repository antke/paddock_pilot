// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { ComponentProps, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { StableListPage } from './StableListPage'
import { StableLocalNavigationView } from './StableLocalNavigation'
import { StableMembersPage } from './StableMembersPage'
import { getStableRailDestination } from './stableDestinations'
import {
  isStableSettingsRelocatedTab,
  isStableSettingsTab,
  stableSettingsRelocatedTabs,
} from './StableSettingsPage'

vi.mock('convex/react', () => ({
  useMutation: () => {
    throw new Error('Navigation tests must not mount live mutations')
  },
  useQuery: () => {
    throw new Error('Navigation tests must not mount live queries')
  },
}))

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

async function renderWithRouter(element: ReactNode) {
  const root = createRootRoute({ component: () => element })
  const router = createRouter({
    routeTree: root,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  render(<RouterProvider router={router} />)
}

const stableId = 'north' as Id<'stables'>
const stables = [
  {
    _id: stableId,
    name: 'North Yard',
    location: 'Lowicz',
    viewerRole: 'owner' as const,
  },
  {
    _id: 'south' as Id<'stables'>,
    name: 'South Yard',
    location: 'Kutno',
    viewerRole: 'member' as const,
  },
]

function hrefOf(element: HTMLElement) {
  return element.getAttribute('href')
}

describe('Stables list gateway', () => {
  it('opens the overview from the whole row and offers direct Horses and Care links for each stable', async () => {
    await renderWithRouter(<StableListPage stables={stables} />)
    const overview = await screen.findByRole('link', { name: 'South Yard' })
    expect(hrefOf(overview)).toBe('/stables/south')
    // Destination controls sit beside the overview link, never inside it.
    expect(overview.querySelector('a, button')).toBeNull()
    expect(
      hrefOf(screen.getByRole('link', { name: 'Horses, South Yard' })),
    ).toBe('/stables/south/horses')
    expect(hrefOf(screen.getByRole('link', { name: 'Care, South Yard' }))).toBe(
      '/stables/south/reminders',
    )
    expect(hrefOf(screen.getByRole('link', { name: 'Care, North Yard' }))).toBe(
      '/stables/north/reminders',
    )
  })

  it('lists less frequent destinations in More and offers Settings only to the owner', async () => {
    await renderWithRouter(<StableListPage stables={stables} />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'More sections for South Yard',
      }),
    )
    let menu = await screen.findByRole('menu')
    expect(
      within(menu)
        .getAllByRole('menuitem')
        .map((item) => [item.textContent, hrefOf(item)]),
    ).toEqual([
      ['People', '/stables/south/stable?tab=people'],
      ['Contacts', '/stables/south/stable?tab=contacts'],
      ['Yard information', '/stables/south/stable?tab=yard'],
      ['Documents', '/stables/south/stable?tab=documents'],
      ['Analysis', '/stables/south/analysis'],
      ['Getting started', '/stables/south/stable?tab=welcome'],
    ])
    fireEvent.keyDown(menu, { key: 'Escape' })
    cleanup()

    await renderWithRouter(<StableListPage stables={stables} />)
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'More sections for North Yard',
      }),
    )
    menu = await screen.findByRole('menu')
    expect(
      hrefOf(within(menu).getByRole('menuitem', { name: 'Settings' })),
    ).toBe('/stables/north/settings')
  })
})

describe('phone stable rail', () => {
  it.each([
    ['', undefined, 'overview'],
    ['/horses', undefined, 'horses'],
    ['/horses/deleted', undefined, 'horses'],
    ['/reminders', undefined, 'care'],
    ['/members', undefined, 'people'],
    ['/stable', 'people', 'people'],
    ['/stable', undefined, 'contacts'],
    ['/stable', 'yard', 'yard'],
    ['/stable', 'documents', 'documents'],
    ['/stable', 'welcome', 'gettingStarted'],
    ['/settings', undefined, 'settings'],
  ])('marks %s (tab %s) as %s', (path, tab, expected) => {
    expect(getStableRailDestination(path, tab)).toBe(expected)
  })

  it.each([
    '/horses/create',
    '/horses/unclaimed',
    '/horses/horse-1',
    '/horses/horse-1/care',
    '/events',
    '/events/event-1',
    '/training/create',
    '/edit',
  ])('stays out of detail pages, calendars and forms such as %s', (path) => {
    expect(getStableRailDestination(path)).toBeUndefined()
  })

  it('offers Overview, Horses, Care, People, Contacts and More for the named stable', async () => {
    await renderWithRouter(
      <StableLocalNavigationView
        stableId="north"
        stableName="North Yard"
        pathAfterStable="/stable"
        directoryTab="people"
        role="member"
      />,
    )
    const rail = await screen.findByRole('navigation', {
      name: 'North Yard sections',
    })
    expect(
      within(rail)
        .getAllByRole('link')
        .map((link) => [link.textContent, hrefOf(link)]),
    ).toEqual([
      ['Overview', '/stables/north'],
      ['Horses', '/stables/north/horses'],
      ['Care', '/stables/north/reminders'],
      ['People', '/stables/north/stable?tab=people'],
      ['Contacts', '/stables/north/stable?tab=contacts'],
    ])
    expect(
      within(rail)
        .getByRole('link', { name: 'People' })
        .getAttribute('aria-current'),
    ).toBe('page')
    expect(within(rail).getByRole('button', { name: 'More' })).toBeTruthy()
  })

  it('renders nothing on a nested horse page', async () => {
    await renderWithRouter(
      <StableLocalNavigationView
        stableId="north"
        stableName="North Yard"
        pathAfterStable="/horses/horse-1/profile"
      />,
    )
    expect(screen.queryByRole('navigation')).toBeNull()
  })
})

describe('stable settings relocation', () => {
  it('sends old Members and Providers settings tabs to People and Contacts', () => {
    expect(isStableSettingsRelocatedTab('members')).toBe(true)
    expect(isStableSettingsRelocatedTab('providers')).toBe(true)
    expect(isStableSettingsTab('members')).toBe(false)
    expect(isStableSettingsTab('providers')).toBe(false)
    expect(stableSettingsRelocatedTabs).toEqual({
      members: 'people',
      providers: 'contacts',
    })
  })
})

type MembersPageProps = ComponentProps<typeof StableMembersPage>
const stable = {
  _id: stableId,
  _creationTime: 1,
  name: 'North Yard',
  location: 'Lowicz',
  ownerId: 'owner-user' as Id<'users'>,
} as Doc<'stables'>
const people: MembersPageProps['people'] = [
  {
    membership: null,
    user: {
      _id: 'owner-user' as Id<'users'>,
      firstName: 'Mae',
      lastName: 'Turner',
      preferredName: undefined,
      photoUrl: undefined,
    },
    role: 'owner',
  },
] as MembersPageProps['people']
const myDetails = {
  _id: 'membership' as Id<'stableMembers'>,
  _creationTime: 1,
  stableId,
  userId: 'member-user' as Id<'users'>,
  role: 'member',
  displayNameOverride: 'Alex',
  phone: '',
  emergencyContact: '',
} as NonNullable<MembersPageProps['myDetails']>

function OwnerManagementProbe(): ReactNode {
  return <section aria-label="Owner membership controls" />
}

describe('People page', () => {
  it('shows an ordinary member the directory and their own details, never owner controls', async () => {
    await renderWithRouter(
      <StableMembersPage
        stable={stable}
        access={{ role: 'member' }}
        people={people}
        myDetails={myDetails}
        management={<OwnerManagementProbe />}
        embedded
      />,
    )
    expect(await screen.findByText('Mae Turner')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: 'Edit your yard profile' }),
    ).toBeTruthy()
    expect(
      screen.queryByRole('region', { name: 'Owner membership controls' }),
    ).toBeNull()
    expect(document.querySelector('a[href*="/settings"]')).toBeNull()
  })

  it('gives the owner the membership controls on People', async () => {
    await renderWithRouter(
      <StableMembersPage
        stable={stable}
        access={{ role: 'owner' }}
        people={people}
        myDetails={null}
        management={<OwnerManagementProbe />}
        embedded
      />,
    )
    expect(
      await screen.findByRole('region', { name: 'Owner membership controls' }),
    ).toBeTruthy()
    expect(document.querySelector('a[href*="/settings"]')).toBeNull()
  })
})
