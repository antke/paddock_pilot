import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQueries } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'
import { api } from 'convex/_generated/api'

import {
  RouteEntityNotFoundAlert,
  RouteQueryErrorAlert,
} from '#/components/layout/RouteStatusAlert'
import { StableMembersPage } from '#/components/stables/StableMembersPage'

export const Route = createFileRoute('/stables/_layout/$stableId/members')({
  component: RouteComponent,
  errorComponent: StableMembersError,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const id = stableId as Id<'stables'>
  const [stableQuery, accessQuery, peopleQuery, myDetailsQuery] =
    useSuspenseQueries({
      queries: [
        convexQuery(api.stables.get, { id }),
        convexQuery(api.stables.getAccess, { id }),
        convexQuery(api.stableMembers.listByStable, { stableId: id }),
        convexQuery(api.stableMembers.getMyDetails, { stableId: id }),
      ],
    })
  const stable = stableQuery.data
  const access = accessQuery.data
  const people = peopleQuery.data
  const myDetails = myDetailsQuery.data

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

function StableMembersError({ reset }: ErrorComponentProps) {
  return (
    <RouteQueryErrorAlert
      reset={reset}
      title="The stable directory couldn’t load"
      description="Check your connection, then try again. Member access has not been changed."
    />
  )
}
