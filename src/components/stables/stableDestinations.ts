import type { StableRole } from 'shared/stables/stableAccess'

/**
 * Stable-specific destinations shared by the Stables-list gateway and the
 * phone stable rail. Each destination always names its stable explicitly.
 */
export type StableDestinationId =
  | 'overview'
  | 'horses'
  | 'care'
  | 'people'
  | 'contacts'
  | 'yard'
  | 'documents'
  | 'analysis'
  | 'gettingStarted'
  | 'settings'

export type StableDestination = {
  id: StableDestinationId
  to:
    | '/stables/$stableId'
    | '/stables/$stableId/horses'
    | '/stables/$stableId/reminders'
    | '/stables/$stableId/stable'
    | '/stables/$stableId/analysis'
    | '/stables/$stableId/settings'
  search?: { tab: 'people' | 'contacts' | 'yard' | 'documents' | 'welcome' }
  labelKey: `stables.destinations.${StableDestinationId}`
}

const destination = (
  id: StableDestinationId,
  to: StableDestination['to'],
  search?: StableDestination['search'],
): StableDestination => ({
  id,
  to,
  search,
  labelKey: `stables.destinations.${id}`,
})

const destinations = {
  overview: destination('overview', '/stables/$stableId'),
  horses: destination('horses', '/stables/$stableId/horses'),
  care: destination('care', '/stables/$stableId/reminders'),
  people: destination('people', '/stables/$stableId/stable', {
    tab: 'people',
  }),
  contacts: destination('contacts', '/stables/$stableId/stable', {
    tab: 'contacts',
  }),
  yard: destination('yard', '/stables/$stableId/stable', { tab: 'yard' }),
  documents: destination('documents', '/stables/$stableId/stable', {
    tab: 'documents',
  }),
  analysis: destination('analysis', '/stables/$stableId/analysis'),
  gettingStarted: destination('gettingStarted', '/stables/$stableId/stable', {
    tab: 'welcome',
  }),
  settings: destination('settings', '/stables/$stableId/settings'),
} satisfies Record<StableDestinationId, StableDestination>

/** Settings is owner-only; the settings queries enforce the same rule. */
function withEligibleSettings(
  items: Array<StableDestination>,
  role: StableRole | undefined,
) {
  return role === 'owner' ? [...items, destinations.settings] : items
}

/** Stables-list gateway: frequent destinations beside the stable name. */
export const stableGatewayDirectDestinations: ReadonlyArray<StableDestination> =
  [destinations.horses, destinations.care]

export function getStableGatewayMoreDestinations(role: StableRole | undefined) {
  return withEligibleSettings(
    [
      destinations.people,
      destinations.contacts,
      destinations.yard,
      destinations.documents,
      destinations.analysis,
      destinations.gettingStarted,
    ],
    role,
  )
}

/** Phone stable rail: the local sections shown directly in the rail. */
export const stableRailDirectDestinations: ReadonlyArray<StableDestination> = [
  destinations.overview,
  destinations.horses,
  destinations.care,
  destinations.people,
  destinations.contacts,
]

export function getStableRailMoreDestinations(role: StableRole | undefined) {
  return withEligibleSettings(
    [
      destinations.yard,
      destinations.documents,
      destinations.analysis,
      destinations.gettingStarted,
    ],
    role,
  )
}

const collectionPaths = [
  { pattern: /^$/, id: 'overview' },
  { pattern: /^\/horses(\/(deleted|history))?$/, id: 'horses' },
  { pattern: /^\/reminders$/, id: 'care' },
  { pattern: /^\/members$/, id: 'people' },
  { pattern: /^\/stable$/, id: 'directory' },
  { pattern: /^\/analysis$/, id: 'analysis' },
  { pattern: /^\/settings$/, id: 'settings' },
] as const

/**
 * Which rail destination a stable collection or management screen belongs to.
 * Nested detail pages, calendars and create/edit forms return undefined: they
 * keep their own entity navigation or task controls instead of the rail.
 */
export function getStableRailDestination(
  pathAfterStable: string,
  directoryTab?: string,
): StableDestinationId | undefined {
  const path = pathAfterStable.split(/[?#]/, 1)[0].replace(/\/+$/, '')
  const match = collectionPaths.find(({ pattern }) => pattern.test(path))
  if (!match) return undefined
  if (match.id !== 'directory') return match.id
  if (directoryTab === 'welcome') return 'gettingStarted'
  return directoryTab === 'people' ||
    directoryTab === 'yard' ||
    directoryTab === 'documents'
    ? directoryTab
    : 'contacts'
}
