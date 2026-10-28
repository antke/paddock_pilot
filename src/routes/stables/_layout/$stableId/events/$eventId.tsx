import { useQuery } from 'convex/react'
import { RoutePending } from '#/components/layout/RoutePending'
import { ActivitySharing } from '#/components/events/ActivitySharing'
import {
  ActivityPeople,
  MyActivityInvitations,
} from '#/components/events/ActivityPeople'
import { EventParticipation } from '#/components/events/EventParticipation'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { EventDetail } from '#/components/events/EventDetail'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/events/$eventId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId, eventId } = Route.useParams()
  const shared = useQuery(api.activitySharing.detail, {
    eventId: eventId as Id<'events'>,
    stableId: stableId as Id<'stables'>,
  })
  if (shared === undefined) return <RoutePending />
  if (shared)
    return <Navigate to="/events/$eventId" params={{ eventId }} replace />
  return <OriginalDetail />
}
function OriginalDetail() {
  const { stableId, eventId } = Route.useParams()

  const { data } = useSuspenseQuery(
    convexQuery(api.events.getWithHorses, {
      id: eventId,
      stableId: stableId as Id<'stables'>,
    }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.events.getPermissions, { id: eventId as Id<'events'> }),
  )

  if (!data) {
    return <RouteEntityNotFoundAlert entity="event" />
  }

  if (data.event.type === 'training')
    return (
      <Navigate
        to="/stables/$stableId/training/$eventId"
        params={{ stableId, eventId }}
        replace
      />
    )

  return (
    <DashboardPage>
      <EventDetail
        stableId={stableId}
        event={data.event}
        createdByName={data.createdByName}
        horses={data.horses}
        canManageEvent={permissions?.canManageEvent ?? false}
      />
      <EventParticipation eventId={eventId as Id<'events'>} />
      <ActivitySharing eventId={eventId as Id<'events'>} />
      <ActivityPeople
        eventId={eventId as Id<'events'>}
        date={data.event.date}
      />
      <MyActivityInvitations eventId={eventId} />
      <Outlet />
    </DashboardPage>
  )
}
