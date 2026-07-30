import type {
  ListFilterConfig,
  ListFilterOption,
} from '#/components/list-filtering/listFiltering'
import type { Doc } from 'convex/_generated/dataModel'
import {
  eventStatuses,
  eventStatusLabels,
  eventTypes,
  eventTypeLabels,
} from 'shared/events/eventSchema'
import type { EventStatus, EventType } from 'shared/events/eventSchema'

export type EventListFilterFacetId = 'type' | 'status'

export function createEventListFilterConfig(): ListFilterConfig<
  Doc<'events'>,
  EventListFilterFacetId
> {
  return {
    searchLabel: 'Search events',
    searchPlaceholder: 'Search title, location, provider, date, or notes',
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
          eventTypeLabels[event.type],
          eventStatusLabels[event.status ?? 'planned'],
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
        label: 'Type',
        allLabel: 'All event types',
        options: eventTypeFilterOptions,
        matches: (event, selectedValue) => event.type === selectedValue,
      },
      {
        id: 'status',
        label: 'Status',
        allLabel: 'All statuses',
        options: eventStatusFilterOptions,
        matches: (event, selectedValue) =>
          (event.status ?? 'planned') === selectedValue,
      },
    ],
  }
}

const eventTypeFilterOptions = eventTypes.map((type) => ({
  value: type,
  label: eventTypeLabels[type],
})) satisfies ReadonlyArray<ListFilterOption & { value: EventType }>

const eventStatusFilterOptions = eventStatuses.map((status) => ({
  value: status,
  label: eventStatusLabels[status],
})) satisfies ReadonlyArray<ListFilterOption & { value: EventStatus }>
