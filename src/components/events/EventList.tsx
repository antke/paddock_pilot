import { useT, useLocale } from '#/i18n/LocaleProvider'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { FilteredDashboardItemList } from '#/components/list-filtering/FilteredDashboardItemList'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMemo } from 'react'
import { createEventListFilterConfig } from './eventListFilters'
import { EventRow } from './EventRow'

type EventListProps = {
  stableId: string
  chrome?: DashboardChrome
}

type EventTableProps = {
  stableId?: string
  events: Array<
    Doc<'events'> & { contextHorseId?: string; contextParticipationId?: string }
  >
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
  emptyTitle,
  emptyDescription,
  chrome = 'soft',
}: EventTableProps) {
  const t = useT()
  const { locale } = useLocale()

  const filterConfig = useMemo(
    () => createEventListFilterConfig(locale),
    [locale],
  )
  const filtering = useListFiltering({
    items: events,
    config: filterConfig,
    storageKey: stableId ? `paddock:events:${stableId}:log` : undefined,
  })

  return (
    <FilteredDashboardItemList
      config={filterConfig}
      filtering={filtering}
      getItemKey={(item) => item.contextParticipationId ?? item._id}
      gap="compact"
      emptyMessage={emptyDescription ?? t('eventViews.emptyHelp')}
      emptyState={
        <DashboardEmptyState
          chrome={chrome}
          title={emptyTitle ?? t('eventViews.empty')}
        >
          {emptyDescription ?? t('eventViews.emptyHelp')}
        </DashboardEmptyState>
      }
      filteredEmptyMessage={t('eventViews.filteredEmpty')}
      stickyFilters
      renderItem={(event) => (
        <EventRow
          key={event.contextParticipationId ?? event._id}
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
