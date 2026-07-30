import { EventTable } from '#/components/events/EventList'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ButtonLink } from '#/components/ui/button'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

type EventListPageLabProps = {
  data: DashboardLabData
}

export function EventListPageLab({ data }: EventListPageLabProps) {
  const stableEvents = data.events.filter(
    (event) => event.stableId === data.stable._id,
  )

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Events"
        actions={
          <ButtonLink
            to="/stables/$stableId/events/create"
            params={{ stableId: data.stable._id }}
            variant="secondary"
          >
            Add event
          </ButtonLink>
        }
      />

      <DashboardSectionCard contentGap="comfortable">
        <EventTable
          stableId={data.stable._id}
          events={stableEvents}
          emptyTitle="No events added yet."
          emptyDescription="Create an event to start building this stable schedule."
          chrome="soft"
        />
      </DashboardSectionCard>
    </DashboardPage>
  )
}
