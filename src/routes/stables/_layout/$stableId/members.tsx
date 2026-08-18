import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'
import { api } from 'convex/_generated/api'

import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { StableMembersPage } from '#/components/stables/StableMembersPage'

export const Route = createFileRoute('/stables/_layout/$stableId/members')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const id = stableId as Id<'stables'>
  const { data: stable } = useSuspenseQuery(
    convexQuery(api.stables.get, { id }),
  )
  const { data: access } = useSuspenseQuery(
    convexQuery(api.stables.getAccess, { id }),
  )
  const { data: people } = useSuspenseQuery(
    convexQuery(api.stableMembers.listByStable, { stableId: id }),
  )
  const { data: myDetails } = useSuspenseQuery(
    convexQuery(api.stableMembers.getMyDetails, { stableId: id }),
  )

  if (!stable) return <RouteEntityNotFoundAlert entity="stable" />

  return (
    <StableMembersPage
      stable={stable}
      access={access}
      people={people}
      myDetails={myDetails}
    />
  )
}
