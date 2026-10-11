import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { HorseDetail } from '#/components/horses/HorseDetail'
import { RoutePending } from '#/components/layout/RoutePending'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'

export const Route = createFileRoute('/horses/$horseId')({
  component: HorsePage,
})
function HorsePage() {
  const { horseId } = Route.useParams()
  const horse = useQuery(api.horses.get, { id: horseId })
  const events = useQuery(api.events.listForHorse, { horseId })
  const permissions = useQuery(api.horses.getPermissions, {
    id: horseId as Id<'horses'>,
  })
  if (horse === undefined || events === undefined || permissions === undefined)
    return <RoutePending />
  if (!horse || !permissions?.canRead)
    return <RouteEntityNotFoundAlert entity="horse" />
  return (
    <HorseDetail
      horse={horse}
      events={events}
      canManageHorse={permissions.canEditProfile}
      canAddRecords={permissions.canAddRecords}
    >
      <Outlet />
    </HorseDetail>
  )
}
