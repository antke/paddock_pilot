import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { EventDetail } from '#/components/events/EventDetail'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/events/$eventId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId, eventId } = Route.useParams()

  const { data } = useSuspenseQuery(
    convexQuery(api.events.getWithHorses, { id: eventId }),
  )

  if (!data || data.event.stableId !== stableId) {
    return <RouteEntityNotFoundAlert entity="event" />
  }

  return (
    <DashboardPage>
      <EventDetail
        stableId={stableId}
        event={data.event}
        horses={data.horses}
      />
      <Outlet />
    </DashboardPage>
  )
}
