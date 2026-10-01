import type { Locale } from 'shared/i18n/locale'
import { localeInstances } from '#/i18n/resources'

export type StableBreadcrumbDestination =
  'horses' | 'horse' | 'events' | 'event' | 'training' | 'trainingSession'

export type StableBreadcrumbItem = {
  destination?: StableBreadcrumbDestination
  label: string
}

export type StableBreadcrumbLabels = {
  eventTitle?: string
  horseName?: string
}

export function getStableRouteSegments(pathAfterStable: string) {
  return pathAfterStable.split('/').filter(Boolean)
}

export function getStableBreadcrumbEntityIds(pathAfterStable: string) {
  const [feature, entityOrAction] = getStableRouteSegments(pathAfterStable)
  return {
    horseId:
      feature === 'horses' &&
      entityOrAction !== 'create' &&
      entityOrAction !== 'deleted'
        ? entityOrAction
        : undefined,
    eventId:
      (feature === 'events' || feature === 'training') &&
      entityOrAction !== 'create' &&
      entityOrAction !== 'calendar'
        ? entityOrAction
        : undefined,
  }
}

export function createStableBreadcrumbItems(
  pathAfterStable: string,
  labels: StableBreadcrumbLabels = {},
  locale: Locale = 'en',
): Array<StableBreadcrumbItem> {
  const t = localeInstances[locale].t
  const horseSectionLabels: Record<string, string> = {
    activity: t('breadcrumbs.activity'),
    training: t('breadcrumbs.training'),
    care: t('breadcrumbs.care'),
    'care-summary': t('breadcrumbs.careSummary'),
    documents: t('breadcrumbs.documents'),
    edit: t('breadcrumbs.editHorse'),
    health: t('breadcrumbs.nutrition'),
    nutrition: t('breadcrumbs.nutrition'),
    timeline: t('breadcrumbs.timeline'),
  }

  const segments = getStableRouteSegments(pathAfterStable)
  const [feature, entityOrAction, section] = segments

  if (!feature) return [{ label: t('breadcrumbs.overview') }]

  if (feature === 'horses') {
    if (!entityOrAction) return [{ label: t('breadcrumbs.horses') }]

    if (entityOrAction === 'create') {
      return [
        { destination: 'horses', label: t('breadcrumbs.horses') },
        { label: t('breadcrumbs.addHorse') },
      ]
    }

    if (entityOrAction === 'deleted') {
      return [
        { destination: 'horses', label: t('breadcrumbs.horses') },
        { label: t('breadcrumbs.deletedHorses') },
      ]
    }

    const horseItem = { label: labels.horseName ?? t('breadcrumbs.horse') }

    if (!section || section === 'profile') {
      return [
        { destination: 'horses', label: t('breadcrumbs.horses') },
        horseItem,
      ]
    }

    return [
      { destination: 'horses', label: t('breadcrumbs.horses') },
      { ...horseItem, destination: 'horse' },
      { label: horseSectionLabels[section] ?? formatSegment(section) },
    ]
  }

  if (feature === 'training') {
    if (!entityOrAction) return [{ label: t('breadcrumbs.trainingLog') }]
    const home: StableBreadcrumbItem = {
      destination: 'training',
      label: t('breadcrumbs.trainingLog'),
    }
    if (entityOrAction === 'create')
      return [home, { label: t('breadcrumbs.addSession') }]
    const session = { label: labels.eventTitle ?? t('breadcrumbs.session') }
    return section === 'edit'
      ? [
          home,
          { ...session, destination: 'trainingSession' },
          { label: t('breadcrumbs.editSession') },
        ]
      : [home, session]
  }

  if (feature === 'events') {
    if (!entityOrAction) return [{ label: t('breadcrumbs.events') }]

    if (entityOrAction === 'calendar') {
      return [
        { destination: 'events', label: t('breadcrumbs.events') },
        { label: t('breadcrumbs.calendar') },
      ]
    }

    if (entityOrAction === 'create') {
      return [
        { destination: 'events', label: t('breadcrumbs.events') },
        { label: t('breadcrumbs.addEvent') },
      ]
    }

    const eventItem = { label: labels.eventTitle ?? t('breadcrumbs.event') }

    if (section !== 'edit') {
      return [
        { destination: 'events', label: t('breadcrumbs.events') },
        eventItem,
      ]
    }

    return [
      { destination: 'events', label: t('breadcrumbs.events') },
      { ...eventItem, destination: 'event' },
      { label: t('breadcrumbs.editEvent') },
    ]
  }

  const featureLabels: Record<string, string> = {
    analysis: t('breadcrumbs.analysis'),
    documents: t('breadcrumbs.documents'),
    edit: t('breadcrumbs.editStable'),
    members: t('breadcrumbs.people'),
    reminders: t('breadcrumbs.care'),
    settings: t('breadcrumbs.settings'),
    welcome: t('breadcrumbs.gettingStarted'),
  }

  return [{ label: featureLabels[feature] ?? formatSegment(feature) }]
}

function formatSegment(segment: string) {
  const words = segment.replaceAll('-', ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}
