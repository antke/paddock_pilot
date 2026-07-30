import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { HorseDetail } from '#/components/horses/HorseDetail'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId, horseId } = Route.useParams()

  const { data: horse } = useSuspenseQuery(
    convexQuery(api.horses.get, { id: horseId }),
  )

  const { data: events } = useSuspenseQuery(
    convexQuery(api.events.listForHorse, { horseId }),
  )

  if (!horse || horse.stableId !== stableId) {
    return <RouteEntityNotFoundAlert entity="horse" />
  }

  return (
    <DashboardPage>
      <HorseDetail stableId={stableId} horse={horse} events={events} />
      <Outlet />
    </DashboardPage>
  )
}
