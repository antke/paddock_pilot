import { EventTable } from '#/components/events/EventList'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

type EventListPageLabProps = {
  data: DashboardLabData
}

export function EventListPageLab({ data }: EventListPageLabProps) {
  const stableEvents = data.events.filter(
    (event) => event.stableId === data.stable._id,
  )

  return (
    <EventTable
      stableId={data.stable._id}
      events={stableEvents}
      emptyTitle="No events added yet."
      emptyDescription="Create an event to start building this stable schedule."
      chrome="soft"
    />
  )
}
