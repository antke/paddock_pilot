import { EventList } from '#/components/events/EventList'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ButtonLink } from '#/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/events/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Events"
        actions={
          <ButtonLink
            to="/stables/$stableId/events/create"
            params={{ stableId }}
            action="create"
          >
            Add event
          </ButtonLink>
        }
      />

      <DashboardSectionCard contentGap="comfortable">
        <EventList stableId={stableId} chrome="soft" />
      </DashboardSectionCard>
    </DashboardPage>
  )
}
