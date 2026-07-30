export type StableBreadcrumbDestination =
  | 'horses'
  | 'horse'
  | 'events'
  | 'event'

export type StableBreadcrumbItem = {
  destination?: StableBreadcrumbDestination
  label: string
}

type StableBreadcrumbLabels = {
  eventTitle?: string
  horseName?: string
}

const horseSectionLabels: Record<string, string> = {
  activity: 'Activity',
  care: 'Care',
  'care-summary': 'Care summary',
  documents: 'Documents',
  edit: 'Edit horse',
  health: 'Nutrition',
  nutrition: 'Nutrition',
  timeline: 'Timeline',
}

export function getStableRouteSegments(pathAfterStable: string) {
  return pathAfterStable.split('/').filter(Boolean)
}

export function createStableBreadcrumbItems(
  pathAfterStable: string,
  labels: StableBreadcrumbLabels = {},
): Array<StableBreadcrumbItem> {
  const segments = getStableRouteSegments(pathAfterStable)
  const [feature, entityOrAction, section] = segments

  if (!feature) return [{ label: 'Overview' }]

  if (feature === 'horses') {
    if (!entityOrAction) return [{ label: 'Horses' }]

    if (entityOrAction === 'create') {
      return [
        { destination: 'horses', label: 'Horses' },
        { label: 'Add horse' },
      ]
    }

    const horseItem = { label: labels.horseName ?? 'Horse' }

    if (!section || section === 'profile') {
      return [{ destination: 'horses', label: 'Horses' }, horseItem]
    }

    return [
      { destination: 'horses', label: 'Horses' },
      { ...horseItem, destination: 'horse' },
      { label: horseSectionLabels[section] ?? formatSegment(section) },
    ]
  }

  if (feature === 'events') {
    if (!entityOrAction) return [{ label: 'Events' }]

    if (entityOrAction === 'calendar') {
      return [{ destination: 'events', label: 'Events' }, { label: 'Calendar' }]
    }

    if (entityOrAction === 'create') {
      return [
        { destination: 'events', label: 'Events' },
        { label: 'Add event' },
      ]
    }

    const eventItem = { label: labels.eventTitle ?? 'Event' }

    if (section !== 'edit') {
      return [{ destination: 'events', label: 'Events' }, eventItem]
    }

    return [
      { destination: 'events', label: 'Events' },
      { ...eventItem, destination: 'event' },
      { label: 'Edit event' },
    ]
  }

  const featureLabels: Record<string, string> = {
    analysis: 'Analysis',
    documents: 'Documents',
    edit: 'Edit stable',
    reminders: 'Care',
    settings: 'Settings',
  }

  return [{ label: featureLabels[feature] ?? formatSegment(feature) }]
}

function formatSegment(segment: string) {
  const words = segment.replaceAll('-', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}
