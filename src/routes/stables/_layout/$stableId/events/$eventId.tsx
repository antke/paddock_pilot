import { EventDetail } from '#/components/events/EventDetail'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/events/$eventId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId, eventId } = Route.useParams()

  const { data } = useSuspenseQuery(
    convexQuery(api.events.getWithHorses, { id: eventId as Id<'events'> }),
  )

  if (!data || data.event.stableId !== stableId) {
    return (
      <Alert>
        <AlertTitle>Event not found</AlertTitle>
        <AlertDescription>
          This event does not exist or is no longer available.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-6">
      <EventDetail
        stableId={stableId}
        event={data.event}
        horses={data.horses}
      />
      <Outlet />
    </div>
  )
}
