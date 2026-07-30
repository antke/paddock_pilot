import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { EventRow } from '#/components/events/EventRow'
import { getUpcomingEvents } from './stableDashboardDates'
import type { StableDashboardEvent } from './stableDashboardDates'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'

type StableUpcomingEventsProps = {
  stableId: string
  events: Array<StableDashboardEvent>
  limit?: number
  chrome?: DashboardChrome
}

export function StableUpcomingEvents({
  stableId,
  events,
  limit = 5,
  chrome = 'cards',
}: StableUpcomingEventsProps) {
  const upcomingEvents = getUpcomingEvents(events, new Date()).slice(0, limit)

  if (upcomingEvents.length === 0) {
    return (
      <DashboardEmptyState chrome={chrome} title="No upcoming events.">
        Add an event to start building this stable schedule.
      </DashboardEmptyState>
    )
  }

  return (
    <DashboardItemList gap="comfortable">
      {upcomingEvents.map((event) => (
        <EventRow
          key={event._id}
          event={event}
          stableId={stableId}
          chrome={chrome}
          horseCount={event.horseIds.length}
          variant="agenda"
        />
      ))}
    </DashboardItemList>
  )
}

export function StableUpcomingEventsCard({
  stableId,
  events,
  limit,
  chrome = 'cards',
}: StableUpcomingEventsProps) {
  return (
    <DashboardSection
      as="h3"
      chrome={chrome}
      contentAlign="start"
      title="Next upcoming events"
      description="The next 5 scheduled items."
      size="panel"
      descriptionSize="sm"
    >
      <StableUpcomingEvents
        stableId={stableId}
        events={events}
        limit={limit}
        chrome={chrome}
      />
    </DashboardSection>
  )
}
