import { describe, expect, it } from 'vitest'
import { getWorkspaceNavigation, stableIdFromPath } from './workspaceNavigation'
import type { WorkspaceNavigationOptions } from './workspaceNavigation'
import { localeInstances } from '#/i18n/resources'

function items(options: WorkspaceNavigationOptions) {
  return getWorkspaceNavigation(options).flatMap((group) => group.items)
}

function activeIds(options: WorkspaceNavigationOptions) {
  return items(options)
    .filter((item) => item.active)
    .map((item) => item.id)
}

describe('workspace navigation scope', () => {
  it.each([
    '/',
    '/horses/horse-a/profile',
    '/events',
    '/training',
    '/stables',
    '/stables/',
    '/stables/create',
    '/stables/create/',
    '/stables/deleted',
    '/stables-extra/stable-a',
  ])('keeps %s personal despite a saved stable preference', (pathname) => {
    expect(stableIdFromPath(pathname)).toBeUndefined()
    const navigation = getWorkspaceNavigation({
      pathname,
      stableId: 'saved-stable',
      canManageStable: true,
    })
    expect(navigation[0].items.map((item) => item.href)).toEqual([
      '/',
      '/events',
      '/training',
      '/horses',
    ])
    expect(
      navigation.flatMap((group) => group.items.map((item) => item.href)),
    ).toEqual([
      '/',
      '/events',
      '/training',
      '/horses',
      '/horses/contacts',
      '/stables',
    ])
  })

  it('derives stable links from the route and rejects stale management access', () => {
    const navigation = getWorkspaceNavigation({
      pathname: '/stables/current-stable/events',
      stableId: 'saved-stable',
      canManageStable: true,
    })
    expect(stableIdFromPath('/stables/current-stable/events')).toBe(
      'current-stable',
    )
    expect(navigation[0].items.map((item) => item.href)).toEqual([
      '/',
      '/events',
      '/training',
      '/horses',
    ])
    expect(
      navigation
        .flatMap((group) => group.items)
        .some((item) => item.id === 'settings'),
    ).toBe(false)
  })

  it.each(['/stables/stable-a', '/stables/stable-a/'])(
    'keeps Home global and exposes a local stable overview for %s',
    (pathname) => {
      const home = items({ pathname }).find((item) => item.id === 'home')
      expect(home).toMatchObject({
        href: '/',
        labelKey: 'navigation.home',
        active: false,
      })
      expect(activeIds({ pathname })).toEqual(['stable-overview'])
    },
  )

  it('keeps daily work ordered consistently in each workspace', () => {
    for (const pathname of ['/', '/stables/stable-a']) {
      expect(
        getWorkspaceNavigation({ pathname })[0].items.map((item) => item.id),
      ).toEqual(['home', 'events', 'training', 'horses'])
    }
    expect(
      getWorkspaceNavigation({ pathname: '/stables/stable-a' }).map(
        (group) => ({
          id: group.id,
          items: group.items.map((item) => item.id),
        }),
      ),
    ).toEqual([
      { id: 'primary', items: ['home', 'events', 'training', 'horses'] },
      { id: 'records', items: ['care', 'contacts', 'documents', 'analysis'] },
      {
        id: 'management',
        items: [
          'stable-overview',
          'stable-horses',
          'stable',
          'people',
          'welcome',
          'manage-stables',
        ],
      },
    ])
  })

  it('shows Settings only for the current stable owner', () => {
    const pathname = '/stables/stable-a/settings'
    expect(items({ pathname }).some((item) => item.id === 'settings')).toBe(
      false,
    )
    expect(
      items({ pathname, canManageStable: false }).some(
        (item) => item.id === 'settings',
      ),
    ).toBe(false)
    expect(
      items({ pathname, stableId: 'stable-a', canManageStable: true }),
    ).toContainEqual({
      id: 'settings',
      href: '/stables/stable-a/settings',
      icon: 'settings',
      labelKey: 'navigation.settings',
      active: true,
    })
  })
})

describe('workspace navigation selection', () => {
  it.each([
    ['/', 'home'],
    ['/horses', 'horses'],
    ['/horses/horse-a/profile', 'horses'],
    ['/horses/deleted', 'horses'],
    ['/horses/contacts', 'contacts'],
    ['/events/event-a/edit', 'events'],
    ['/training', 'training'],
    ['/stables/create', 'manage-stables'],
    ['/stables/stable-a/events/event-a', 'events'],
    ['/stables/stable-a/training/session-a/edit', 'training'],
    ['/stables/stable-a/horses/horse-a/care', 'stable-horses'],
    ['/stables/stable-a/reminders', 'care'],
    ['/stables/stable-a/documents', 'documents'],
    ['/stables/stable-a/analysis', 'analysis'],
    ['/stables/stable-a/welcome', 'welcome'],
    ['/stables/stable-a/members', 'people'],
    ['/stables/stable-a/edit', 'stable'],
  ])('selects one matching destination for %s', (pathname, id) => {
    expect(activeIds({ pathname })).toEqual([id])
  })

  it.each([
    '/events-extra',
    '/training-extra',
    '/horses-extra',
    '/stables-extra',
    '/stables/stable-a/events-extra',
    '/stables/stable-a/horses-extra',
    '/stables/stable-a/stable-extra',
    '/stables/stable-a/members-extra',
  ])('does not select a destination by a partial prefix on %s', (pathname) => {
    expect(activeIds({ pathname })).toEqual([])
  })

  it.each([
    [undefined, 'contacts'],
    ['contacts', 'contacts'],
    ['people', 'people'],
    ['yard', 'stable'],
    ['unknown', 'contacts'],
  ])(
    'selects the directory tab %s without selecting its siblings',
    (currentTab, id) => {
      expect(
        activeIds({ pathname: '/stables/stable-a/stable', currentTab }),
      ).toEqual([id])
    },
  )

  it('uses explicit tab destinations and ignores directory tabs elsewhere', () => {
    const navigation = items({
      pathname: '/stables/stable-a/events',
      currentTab: 'yard',
    })
    expect(
      navigation
        .filter((item) => ['contacts', 'people', 'stable'].includes(item.id))
        .map(({ href, active }) => ({ href, active })),
    ).toEqual([
      { href: '/stables/stable-a/stable?tab=contacts', active: false },
      { href: '/stables/stable-a/stable?tab=yard', active: false },
      { href: '/stables/stable-a/stable?tab=people', active: false },
    ])
    expect(
      navigation.filter((item) => item.active).map((item) => item.id),
    ).toEqual(['events'])
  })

  it('resolves every navigation label in English and Polish', () => {
    for (const pathname of ['/', '/stables/stable-a']) {
      const navigation = getWorkspaceNavigation({
        pathname,
        canManageStable: true,
      })
      const keys = navigation.flatMap((group) => [
        ...(group.labelKey ? [group.labelKey] : []),
        ...group.items.map((item) => item.labelKey),
      ])
      for (const locale of Object.values(localeInstances)) {
        for (const key of keys) expect(locale.exists(key)).toBe(true)
      }
    }
  })
})
