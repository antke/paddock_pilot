import { localeInstances } from '#/i18n/resources'
import type { Locale } from 'shared/i18n/locale'
import type {
  ListFilterConfig,
  ListFilterOption,
} from '#/components/list-filtering/listFiltering'
import type { Doc } from 'convex/_generated/dataModel'
import { eventStatuses, eventTypes } from 'shared/events/eventSchema'
import type { EventStatus, EventType } from 'shared/events/eventSchema'

export type EventListFilterFacetId = 'type' | 'status'

export function createEventListFilterConfig(
  locale: Locale = 'en',
): ListFilterConfig<Doc<'events'>, EventListFilterFacetId> {
  const t = localeInstances[locale].t
  const eventTypeFilterOptions = eventTypes
    .filter((type) => type !== 'training')
    .map((type) => ({
      value: type,
      label: t(`events.types.${type}`),
    })) satisfies ReadonlyArray<ListFilterOption & { value: EventType }>

  const eventStatusFilterOptions = eventStatuses.map((status) => ({
    value: status,
    label: t(`calendar.${status}`),
  })) satisfies ReadonlyArray<ListFilterOption & { value: EventStatus }>

  return {
    searchLabel: t('eventViews.search'),
    searchPlaceholder: t('eventViews.searchPlaceholder'),
    searchFields: [
      {
        id: 'title',
        weight: 12,
        getValues: (event) => [event.title],
      },
      {
        id: 'details',
        weight: 6,
        getValues: (event) => [
          event.description,
          event.location,
          event.providerName,
        ],
      },
      {
        id: 'schedule',
        weight: 4,
        getValues: (event) => [event.date, event.endDate, event.time],
      },
      {
        id: 'labels',
        weight: 3,
        getValues: (event) => [
          t(`events.types.${event.type}`),
          t(`calendar.${event.status ?? 'planned'}`),
        ],
      },
      {
        id: 'notes',
        weight: 2,
        getValues: (event) => [event.notesAfterCompletion],
      },
    ],
    facets: [
      {
        id: 'type',
        label: t('eventViews.type'),
        allLabel: t('eventViews.allTypes'),
        options: eventTypeFilterOptions,
        matches: (event, selectedValue) => event.type === selectedValue,
      },
      {
        id: 'status',
        label: t('eventViews.status'),
        allLabel: t('eventViews.allStatuses'),
        options: eventStatusFilterOptions,
        matches: (event, selectedValue) =>
          (event.status ?? 'planned') === selectedValue,
      },
    ],
  }
}
