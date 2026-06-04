import { HorseDetail } from '#/components/horses/HorseDetail'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId, horseId } = Route.useParams()

  const { data: horse } = useSuspenseQuery(
    convexQuery(api.horses.get, { id: horseId as Id<'horses'> }),
  )

  const { data: events } = useSuspenseQuery(
    convexQuery(api.events.listForHorse, { horseId: horseId as Id<'horses'> }),
  )

  if (!horse || horse.stableId !== stableId) {
    return (
      <Alert>
        <AlertTitle>Horse not found</AlertTitle>
        <AlertDescription>
          This horse does not exist or is no longer available.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-6">
      <HorseDetail stableId={stableId} horse={horse} events={events} />
      <Outlet />
    </div>
  )
}
