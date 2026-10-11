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
  | 'dashboard.contacts'
  | 'navigationShell.personalContacts'

export type WorkspaceNavigationItem = {
  id: string
  href: string
  labelKey: WorkspaceNavigationLabelKey
  icon: WorkspaceNavigationIcon
  active: boolean
}

export type WorkspaceNavigationGroup = {
  id: 'primary' | 'records' | 'management'
  labelKey?:
    | 'navigationShell.dailyWork'
    | 'navigationShell.stableRecords'
    | 'navigationShell.personalRecords'
    | 'navigationShell.stableManagement'
    | 'navigationShell.workspace'
  items: Array<WorkspaceNavigationItem>
}

export type WorkspaceNavigationOptions = {
  pathname: string
  /** The stable whose access information is being supplied, if available. */
  stableId?: string
  canManageStable?: boolean
  currentTab?: string
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
  stableId,
  canManageStable = false,
  currentTab,
}: WorkspaceNavigationOptions): Array<WorkspaceNavigationGroup> {
  const path = normalizedPath(pathname)
  const routeStableId = stableIdFromPath(path)
  const base = routeStableId ? `/stables/${routeStableId}` : ''
  const home = base || '/'
  const horses = `${base}/horses`
  const contacts = `${base}/horses/contacts`
  const item = (
    id: string,
    href: string,
    labelKey: WorkspaceNavigationLabelKey,
    icon: WorkspaceNavigationIcon,
    active = isWithin(path, href),
  ): WorkspaceNavigationItem => ({ id, href, labelKey, icon, active })
  const primary: WorkspaceNavigationGroup = {
    id: 'primary',
    labelKey: 'navigationShell.dailyWork',
    items: [
      item('home', home, 'navigation.home', 'home', path === home),
      item('events', `${base}/events`, 'navigation.events', 'events'),
      item('training', `${base}/training`, 'navigation.training', 'training'),
      item(
        'horses',
        horses,
        'navigation.horses',
        'horses',
        isWithin(path, horses) &&
          (Boolean(routeStableId) || !isWithin(path, contacts)),
      ),
    ],
  }

  if (!routeStableId) {
    return [
      primary,
      {
        id: 'records',
        labelKey: 'navigationShell.personalRecords',
        items: [
          item(
            'contacts',
            '/horses/contacts',
            'navigationShell.personalContacts',
            'contacts',
          ),
        ],
      },
      {
        id: 'management',
        labelKey: 'navigationShell.workspace',
        items: [
          item(
            'manage-stables',
            '/stables',
            'navigation.manageStables',
            'stable',
          ),
        ],
      },
    ]
  }

  const directory = `${base}/stable`
  // The directory route validates unknown tabs back to its Contacts default.
  const tab = ['yard', 'people'].includes(currentTab ?? '')
    ? currentTab
    : 'contacts'
  const directoryActive = path === directory
  const management: Array<WorkspaceNavigationItem> = [
    item(
      'stable',
      `${directory}?tab=yard`,
      'navigation.stable',
      'stable',
      (directoryActive && tab === 'yard') || path === `${base}/edit`,
    ),
    item(
      'people',
      `${directory}?tab=people`,
      'navigation.people',
      'people',
      (directoryActive && tab === 'people') ||
        isWithin(path, `${base}/members`),
    ),
    item('welcome', `${base}/welcome`, 'navigation.gettingStarted', 'welcome'),
  ]
  if (canManageStable && (!stableId || stableId === routeStableId)) {
    management.push(
      item('settings', `${base}/settings`, 'navigation.settings', 'settings'),
    )
  }

  return [
    primary,
    {
      id: 'records',
      labelKey: 'navigationShell.stableRecords',
      items: [
        item('care', `${base}/reminders`, 'navigation.care', 'care'),
        item(
          'contacts',
          `${directory}?tab=contacts`,
          'dashboard.contacts',
          'contacts',
          directoryActive && tab === 'contacts',
        ),
        item(
          'documents',
          `${base}/documents`,
          'navigation.documents',
          'documents',
        ),
        item('analysis', `${base}/analysis`, 'navigation.analysis', 'analysis'),
      ],
    },
    {
      id: 'management',
      labelKey: 'navigationShell.stableManagement',
      items: management,
    },
  ]
}
