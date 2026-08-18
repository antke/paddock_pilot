import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'

import {
  RouteEntityNotFoundAlert,
  RouteStatusAlert,
} from '#/components/layout/RouteStatusAlert'
import {
  MemberStableWelcomePage,
  OwnerStableWelcomePage,
} from '#/components/stables/StableWelcomePage'

export const Route = createFileRoute('/stables/_layout/$stableId/welcome')({
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

  if (!stable) return <RouteEntityNotFoundAlert entity="stable" />

  return access.role === 'owner' ? (
    <OwnerWelcomeData stable={stable} />
  ) : (
    <MemberWelcomeData stable={stable} />
  )
}

function OwnerWelcomeData({
  stable,
}: {
  stable: NonNullable<FunctionReturnType<typeof api.stables.get>>
}) {
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stable._id }),
  )
  const { data: settings } = useSuspenseQuery(
    convexQuery(api.stableMembers.listWithUsers, { stableId: stable._id }),
  )
  const { data: providers } = useSuspenseQuery(
    convexQuery(api.stableProviders.listForStable, { stableId: stable._id }),
  )

  return (
    <OwnerStableWelcomePage
      stable={stable}
      horseCount={horses.length}
      memberCount={
        settings.members.filter((person) => person.role === 'member').length
      }
      invitationCount={settings.invitations.length}
      providerCount={providers.providers.length}
    />
  )
}

function MemberWelcomeData({
  stable,
}: {
  stable: NonNullable<FunctionReturnType<typeof api.stables.get>>
}) {
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stable._id }),
  )
  const { data: member } = useSuspenseQuery(
    convexQuery(api.stableMembers.getMyDetails, { stableId: stable._id }),
  )

  if (!member) {
    return (
      <RouteStatusAlert
        tone="danger"
        title="Membership not found"
        description="Your account is not connected to this stable as an active member."
      />
    )
  }

  return (
    <MemberStableWelcomePage
      stable={stable}
      member={member}
      ownHorseCount={
        horses.filter((horse) => horse.ownerId === member.userId).length
      }
    />
  )
}
