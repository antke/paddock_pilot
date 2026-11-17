export type WorkspaceNavigationIcon =
  | 'home'
  | 'events'
  | 'training'
  | 'horses'
  | 'care'
  | 'contacts'
  | 'documents'
  | 'analysis'
  | 'stable'
  | 'people'
  | 'settings'
  | 'welcome'

type WorkspaceNavigationLabelKey =
  | 'navigation.home'
  | 'navigation.events'
  | 'navigation.training'
  | 'navigation.horses'
  | 'navigation.care'
  | 'navigation.documents'
  | 'navigation.analysis'
  | 'navigation.stable'
  | 'navigation.people'
  | 'navigation.gettingStarted'
  | 'navigation.settings'
  | 'navigation.manageStables'
  | 'navigation.stables'
  | 'navigationShell.allStables'
  | 'navigationShell.stableDirectory'
  | 'dashboard.contacts'
  | 'navigationShell.personalContacts'

export type WorkspaceNavigationItem = {
  id: string
  href: string
  labelKey: WorkspaceNavigationLabelKey
  /** A stable's own name, shown instead of the translated label. */
  label?: string
  icon: WorkspaceNavigationIcon
  active: boolean
  /** A stable's own pages, disclosed under its row. */
  children?: Array<WorkspaceNavigationItem>
  /** The stable the route is in, whose pages start disclosed. */
  current?: boolean
}

export type WorkspaceNavigationGroup = {
  id: 'primary' | 'management'
  labelKey?:
    | 'navigationShell.stableManagement'
    | 'navigationShell.workspace'
    | 'navigation.stables'
  items: Array<WorkspaceNavigationItem>
}

export type WorkspaceNavigationOptions = {
  pathname: string
  /** Every stable is listed by name, so each one is one tap from anywhere. */
  stables?: ReadonlyArray<{ _id: string; name: string; canManage?: boolean }>
  /** Set by a personal training page, whose URL sits under /events. */
  section?: 'training'
}

function normalizedPath(pathname: string) {
  return pathname.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/'
}

function isWithin(pathname: string, destination: string) {
  return pathname === destination || pathname.startsWith(`${destination}/`)
}

/** A saved workspace preference must never establish the current route scope. */
export function stableIdFromPath(pathname: string): string | undefined {
  const match = /^\/stables\/([^/\\]+)(?:\/|$)/.exec(normalizedPath(pathname))
  return match && !['create', 'deleted'].includes(match[1])
    ? match[1]
    : undefined
}

export function getWorkspaceNavigation({
  pathname,
  stables = [],
  section,
}: WorkspaceNavigationOptions): Array<WorkspaceNavigationGroup> {
  const path = normalizedPath(pathname)
  const routeStableId = stableIdFromPath(path)
  const home = '/'
  const horses = '/horses'
  const contacts = '/horses/contacts'
  const item = (
    id: string,
    href: string,
    labelKey: WorkspaceNavigationLabelKey,
    icon: WorkspaceNavigationIcon,
    active = isWithin(path, href),
  ): WorkspaceNavigationItem => ({ id, href, labelKey, icon, active })
  const inStable = (page: string) =>
    Boolean(
      routeStableId && isWithin(path, `/stables/${routeStableId}/${page}`),
    )
  const stableItem = (stable: {
    _id: string
    name?: string
    canManage?: boolean
  }): WorkspaceNavigationItem => {
    const base = `/stables/${stable._id}`
    const directory = `${base}/stable`
    // Contacts, People, Yard, Documents and Getting started are tabs of one page.
    const directoryActive =
      path === directory ||
      path === `${base}/edit` ||
      ['members', 'documents', 'welcome'].some((page) =>
        isWithin(path, `${base}/${page}`),
      )
    const children = [
      item('stable-horses', `${base}/horses`, 'navigation.horses', 'horses'),
      item('care', `${base}/reminders`, 'navigation.care', 'care'),
      item(
        'stable',
        directory,
        'navigationShell.stableDirectory',
        'people',
        directoryActive,
      ),
      item('analysis', `${base}/analysis`, 'navigation.analysis', 'analysis'),
    ]
    if (stable.canManage)
      children.push(
        item('settings', `${base}/settings`, 'navigation.settings', 'settings'),
      )
    return {
      ...item(
        `stable-${stable._id}`,
        base,
        'navigation.stable',
        'stable',
        path === base,
      ),
      label: stable.name,
      children,
      current: stable._id === routeStableId,
    }
  }
  const listed =
    routeStableId && !stables.some((stable) => stable._id === routeStableId)
      ? // The current stable stays reachable while the list loads.
        [...stables, { _id: routeStableId }]
      : stables

  return [
    {
      // Daily pages and personal contacts read as one uncaptioned list.
      id: 'primary',
      items: [
        item('home', home, 'navigation.home', 'home', path === home),
        item(
          'events',
          '/events',
          'navigation.events',
          'events',
          (isWithin(path, '/events') || inStable('events')) &&
            section !== 'training',
        ),
        item(
          'training',
          '/training',
          'navigation.training',
          'training',
          isWithin(path, '/training') ||
            inStable('training') ||
            section === 'training',
        ),
        item(
          'horses',
          horses,
          'navigation.horses',
          'horses',
          isWithin(path, horses) && !isWithin(path, contacts),
        ),
        item(
          'contacts',
          contacts,
          'navigationShell.personalContacts',
          'contacts',
        ),
      ],
    },
    {
      id: 'management',
      labelKey: 'navigation.stables',
      items: [
        ...listed.map(stableItem),
        item(
          'manage-stables',
          '/stables',
          'navigationShell.allStables',
          'stable',
          isWithin(path, '/stables') && !routeStableId,
        ),
      ],
    },
  ]
}
