import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { FilteredDashboardItemList } from '#/components/list-filtering/FilteredDashboardItemList'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { isEmpty } from 'lodash'
import { useMemo } from 'react'
import { createEventListFilterConfig } from './eventListFilters'
import { EventRow } from './EventRow'

type EventListProps = {
  stableId: string
  chrome?: DashboardChrome
}

type EventTableProps = {
  stableId: string
  events: Array<Doc<'events'>>
  emptyTitle?: string
  emptyDescription?: string
  chrome?: DashboardChrome
}

export function EventList({ stableId, chrome = 'soft' }: EventListProps) {
  const { data: events } = useSuspenseQuery(
    convexQuery(api.events.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )

  return <EventTable stableId={stableId} events={events} chrome={chrome} />
}

export function EventTable({
  stableId,
  events,
  emptyTitle = 'No events added yet.',
  emptyDescription = 'Create an event to start building this stable schedule.',
  chrome = 'soft',
}: EventTableProps) {
  const filterConfig = useMemo(createEventListFilterConfig, [])
  const filtering = useListFiltering({ items: events, config: filterConfig })

  if (isEmpty(events)) {
    return (
      <DashboardEmptyState chrome={chrome} title={emptyTitle}>
        {emptyDescription}
      </DashboardEmptyState>
    )
  }

  return (
    <FilteredDashboardItemList
      config={filterConfig}
      filtering={filtering}
      gap="compact"
      emptyMessage={emptyDescription}
      filteredEmptyMessage="No events match these filters."
      stickyFilters
      renderItem={(event) => (
        <EventRow
          key={event._id}
          stableId={stableId}
          event={event}
          chrome={chrome}
          horseCount={event.horseIds.length}
          variant="agenda"
        />
      )}
    />
  )
}
