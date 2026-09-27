import { createDashboardCommandData } from '#/components/dashboard/command-center/dashboardData'
import { AppDashboardView } from './AppDashboardView'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useEffect } from 'react'
import { useAppUserState } from '#/components/layout/AppUserStateProvider'
import { useLocalDateContext } from '#/lib/useLocalDateContext'

type AppDashboardProps = {
  stables: Array<Doc<'stables'>>
  events: Array<Doc<'events'>>
}

export function AppDashboard({ stables, events }: AppDashboardProps) {
  const { activeStableId, setActiveStableId } = useAppUserState()
  const activeStable =
    stables.find((stable) => stable._id === activeStableId) ?? stables[0]

  useEffect(() => {
    if (activeStable && activeStable._id !== activeStableId) {
      setActiveStableId(activeStable._id)
    }
  }, [activeStable, activeStableId, setActiveStableId])

  if (!activeStable) {
    return <AppDashboardView />
  }

  return (
    <AppDashboardData
      activeStable={activeStable}
      stables={stables}
      events={events}
    />
  )
}

function AppDashboardData({
  activeStable,
  stables,
  events,
}: {
  activeStable: Doc<'stables'>
  stables: Array<Doc<'stables'>>
  events: Array<Doc<'events'>>
}) {
  const { today } = useLocalDateContext()
  const { data: overview } = useSuspenseQuery(
    convexQuery(api.userCareOverview.getForCurrentUser, {
      stableId: activeStable._id,
      today,
    }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: activeStable._id }),
  )
  const { data: invitations } = useSuspenseQuery(
    convexQuery(api.events.listPendingHorseInvitations),
  )
  const approveInvitation = useMutation(api.events.approveHorseInvitation)
  const declineInvitation = useMutation(api.events.declineHorseInvitation)
  const data = createDashboardCommandData({
    stable: activeStable,
    stables,
    events,
    horses,
    overview,
    todayKey: today,
  })

  return (
    <AppDashboardView
      data={data}
      invitations={invitations}
      onApprove={async (eventHorseId) => {
        await approveInvitation({ eventHorseId })
      }}
      onDecline={async (eventHorseId) => {
        await declineInvitation({ eventHorseId })
      }}
    />
  )
}
