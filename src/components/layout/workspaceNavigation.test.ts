import { describe, expect, it } from 'vitest'
import { getWorkspaceNavigation, stableIdFromPath } from './workspaceNavigation'
import type { WorkspaceNavigationOptions } from './workspaceNavigation'
import { localeInstances } from '#/i18n/resources'

function items(options: WorkspaceNavigationOptions) {
  return getWorkspaceNavigation(options)
    .flatMap((group) => group.items)
    .flatMap((item) => [item, ...(item.children ?? [])])
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
    const navigation = getWorkspaceNavigation({ pathname })
    expect(navigation[0].items.map((item) => item.href)).toEqual([
      '/',
      '/events',
      '/training',
      '/horses',
      '/horses/contacts',
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

  it('derives stable links from the route and keeps management per stable', () => {
    const navigation = getWorkspaceNavigation({
      pathname: '/stables/current-stable/events',
      stables: [{ _id: 'saved-stable', name: 'Saved', canManage: true }],
    })
    expect(stableIdFromPath('/stables/current-stable/events')).toBe(
      'current-stable',
    )
    expect(navigation[0].items.map((item) => item.href)).toEqual([
      '/',
      '/events',
      '/training',
      '/horses',
      '/horses/contacts',
    ])
    const current = navigation
      .flatMap((group) => group.items)
      .find((item) => item.id === 'stable-current-stable')
    expect(current?.children?.map((item) => item.id)).not.toContain('settings')
  })

  it.each(['/stables/stable-a', '/stables/stable-a/'])(
    'keeps Home global and selects the stable row as its overview for %s',
    (pathname) => {
      const home = items({ pathname }).find((item) => item.id === 'home')
      expect(home).toMatchObject({
        href: '/',
        labelKey: 'navigation.home',
        active: false,
      })
      expect(activeIds({ pathname })).toEqual(['stable-stable-a'])
    },
  )

  it('keeps one menu shape inside and outside a stable', () => {
    for (const pathname of ['/', '/stables/stable-a']) {
      expect(
        getWorkspaceNavigation({ pathname })[0].items.map((item) => item.id),
      ).toEqual(['home', 'events', 'training', 'horses', 'contacts'])
    }
    const stables = [
      { _id: 'stable-a', name: 'Oak Farm' },
      { _id: 'stable-b', name: 'North Annex' },
    ]
    const shape = (pathname: string) =>
      getWorkspaceNavigation({ pathname, stables }).map((group) => ({
        id: group.id,
        items: group.items.map((item) => item.id),
      }))
    expect(shape('/stables/stable-a')).toEqual(shape('/'))
    expect(shape('/')).toEqual([
      {
        id: 'primary',
        items: ['home', 'events', 'training', 'horses', 'contacts'],
      },
      {
        id: 'management',
        items: ['stable-stable-a', 'stable-stable-b', 'manage-stables'],
      },
    ])
    const oak = getWorkspaceNavigation({ pathname: '/', stables })[1].items[0]
    expect(oak).toMatchObject({ href: '/stables/stable-a', label: 'Oak Farm' })
    expect(oak.children?.map((item) => item.id)).toEqual([
      'stable-horses',
      'care',
      'stable',
      'analysis',
    ])
  })

  it('lists every stable, not only the first three', () => {
    const stables = Array.from({ length: 5 }, (_, i) => ({
      _id: 'stable-' + i,
      name: 'Yard ' + i,
    }))
    const management = getWorkspaceNavigation({ pathname: '/', stables })[1]
    expect(management.items).toHaveLength(6)
  })

  it('shows Settings only under stables the user manages', () => {
    const pathname = '/stables/stable-a/settings'
    expect(items({ pathname }).some((item) => item.id === 'settings')).toBe(
      false,
    )
    expect(
      items({
        pathname,
        stables: [{ _id: 'stable-a', name: 'Oak Farm', canManage: false }],
      }).some((item) => item.id === 'settings'),
    ).toBe(false)
    expect(
      items({
        pathname,
        stables: [{ _id: 'stable-a', name: 'Oak Farm', canManage: true }],
      }),
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
    ['/stables/stable-a/documents', 'stable'],
    ['/stables/stable-a/analysis', 'analysis'],
    ['/stables/stable-a/welcome', 'stable'],
    ['/stables/stable-a/members', 'stable'],
    ['/stables/stable-a/edit', 'stable'],
  ])('selects one matching destination for %s', (pathname, id) => {
    expect(activeIds({ pathname })).toEqual([id])
  })

  it.each(['/events/session-a', '/events/session-a/edit', '/events/create'])(
    'selects Training, not Events, when a personal training page on %s claims it',
    (pathname) => {
      expect(activeIds({ pathname, section: 'training' })).toEqual(['training'])
    },
  )

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

  it('keeps one entry for the stable directory and its tabs', () => {
    const navigation = items({ pathname: '/stables/stable-a/events' })
    expect(navigation.find((item) => item.id === 'stable')).toMatchObject({
      href: '/stables/stable-a/stable',
      active: false,
    })
    expect(
      navigation.filter((item) => item.active).map((item) => item.id),
    ).toEqual(['events'])
    expect(activeIds({ pathname: '/stables/stable-a/stable' })).toEqual([
      'stable',
    ])
  })

  it('resolves every navigation label in English and Polish', () => {
    for (const pathname of ['/', '/stables/stable-a']) {
      const stables = [{ _id: 'stable-a', name: 'Oak Farm', canManage: true }]
      const keys = [
        ...getWorkspaceNavigation({ pathname, stables }).flatMap((group) =>
          group.labelKey ? [group.labelKey] : [],
        ),
        ...items({ pathname, stables }).map((item) => item.labelKey),
      ]
      for (const locale of Object.values(localeInstances)) {
        for (const key of keys) expect(locale.exists(key)).toBe(true)
      }
    }
  })

  it.each([
    { pathname: '/', stables: [] },
    { pathname: '/', stables: [{ _id: 'stable-a', name: 'Oak Farm' }] },
    { pathname: '/stables/stable-a', stables: [] },
  ])('captions the stable links as Stables on $pathname', (options) => {
    const management = getWorkspaceNavigation(options).find(
      (group) => group.id === 'management',
    )
    expect(management?.labelKey).toBe('navigation.stables')
    expect(management?.items.at(-1)).toMatchObject({
      href: '/stables',
      labelKey: 'navigationShell.allStables',
    })
  })

  it('names the stable row and keeps the current stable listed while loading', () => {
    expect(
      items({
        pathname: '/stables/stable-a/horses',
        stables: [{ _id: 'stable-a', name: 'Oak Farm' }],
      }).find((item) => item.id === 'stable-stable-a')?.label,
    ).toBe('Oak Farm')
    expect(
      items({ pathname: '/stables/stable-a/horses' }).find(
        (item) => item.id === 'stable-stable-a',
      ),
    ).toMatchObject({ labelKey: 'navigation.stable', label: undefined })
  })
})
