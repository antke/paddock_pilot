import { StableDashboard } from '#/components/stables/StableDashboard'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useLocalDateContext } from '#/lib/useLocalDateContext'

export const Route = createFileRoute('/stables/_layout/$stableId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  const { data: stable } = useSuspenseQuery(
    convexQuery(api.stables.get, { id: stableId as Id<'stables'> }),
  )

  if (!stable) {
    return <RouteEntityNotFoundAlert entity="stable" />
  }

  return <StableDashboardData stableId={stableId} stable={stable} />
}

function StableDashboardData({
  stableId,
  stable,
}: {
  stableId: string
  stable: Doc<'stables'>
}) {
  const { today } = useLocalDateContext()
  const { data: stables } = useSuspenseQuery(convexQuery(api.stables.list))
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stableId as Id<'stables'> }),
  )
  const { data: events } = useSuspenseQuery(
    convexQuery(api.events.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  const { data: overview } = useSuspenseQuery(
    convexQuery(api.userCareOverview.getForCurrentUser, {
      stableId: stable._id,
      today,
    }),
  )

  return (
    <StableDashboard
      stable={stable}
      stables={stables}
      horses={horses}
      events={events}
      overview={overview}
    />
  )
}
