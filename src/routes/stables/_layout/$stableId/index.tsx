import { StableDashboard } from '#/components/stables/StableDashboard'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/stables/_layout/$stableId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  const { data } = useSuspenseQuery(
    convexQuery(api.stables.getWithOwner, { id: stableId as Id<'stables'> }),
  )

  if (!data?.stable) {
    return (
      <Alert>
        <AlertTitle>Stable not found</AlertTitle>
        <AlertDescription>
          This stable does not exist or is no longer available.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <StableDashboardData
      stableId={stableId}
      stable={data.stable}
      owner={data.owner}
    />
  )
}

function StableDashboardData({
  stableId,
  stable,
  owner,
}: {
  stableId: string
  stable: Doc<'stables'>
  owner: Doc<'users'> | null
}) {
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stableId as Id<'stables'> }),
  )
  const { data: events } = useSuspenseQuery(
    convexQuery(api.events.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )

  return (
    <StableDashboard
      stable={stable}
      owner={owner}
      horses={horses}
      events={events}
    />
  )
}
