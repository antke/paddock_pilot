import { createDashboardCommandData } from '#/components/dashboard/command-center/dashboardData'
import { StableCommandCenter } from '#/components/dashboard/command-center/StableCommandCenter'
import {
  DashboardItemRecordCard,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
import { formatEventDateTime } from '#/components/events/eventDisplay'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { NoStablesPrompt } from '#/components/stables/NoStablesPrompt'
import { Button } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
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
    return (
      <NoStablesPrompt>
        Create a stable to start using the dashboard.
      </NoStablesPrompt>
    )
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
  const data = createDashboardCommandData({
    stable: activeStable,
    stables,
    events,
    horses,
    overview,
  })

  return (
    <DashboardPage>
      <StableCommandCenter data={data} />
      <PendingHorseInvitations stableId={activeStable._id} />
    </DashboardPage>
  )
}

function PendingHorseInvitations({
  stableId,
}: {
  stableId: Doc<'stables'>['_id']
}) {
  const { data: invitations } = useSuspenseQuery(
    convexQuery(api.events.listPendingHorseInvitations),
  )
  const approveInvitation = useMutation(api.events.approveHorseInvitation)
  const declineInvitation = useMutation(api.events.declineHorseInvitation)
  const [busyInvitationId, setBusyInvitationId] = useState<string>()

  const onApprove = async (eventHorseId: Doc<'eventsHorses'>['_id']) => {
    try {
      setBusyInvitationId(eventHorseId)
      await approveInvitation({ eventHorseId })
      showAppSuccessToast({ title: 'Horse invitation approved' })
    } catch {
      showAppErrorToast()
    } finally {
      setBusyInvitationId(undefined)
    }
  }

  const onDecline = async (eventHorseId: Doc<'eventsHorses'>['_id']) => {
    try {
      setBusyInvitationId(eventHorseId)
      await declineInvitation({ eventHorseId })
      showAppSuccessToast({ title: 'Horse invitation declined' })
    } catch {
      showAppErrorToast()
    } finally {
      setBusyInvitationId(undefined)
    }
  }

  const stableInvitations = invitations.filter(
    ({ event }) => event?.stableId === stableId,
  )

  if (stableInvitations.length === 0) return null

  return (
    <DashboardSectionCard
      title="Horse invitations"
      description="Approve or decline event invitations for your horses."
      descriptionSize="sm"
    >
      {stableInvitations.map(({ invitation, event, horse }) => (
        <DashboardItemRecordCard
          key={invitation._id}
          chrome="soft"
          actions={
            <>
              <Button
                type="button"
                variant="outline"
                disabled={busyInvitationId === invitation._id}
                onClick={() => onDecline(invitation._id)}
              >
                Decline
              </Button>
              <Button
                type="button"
                disabled={busyInvitationId === invitation._id}
                onClick={() => onApprove(invitation._id)}
              >
                Approve
              </Button>
            </>
          }
        >
          <DashboardItemRecordContent
            title={`${horse?.name ?? 'Horse'} invited to ${event?.title ?? 'event'}`}
            titleSize="dense"
            meta={
              event && (
                <span>
                  {formatEventDateTime(event.date, event.time, event.endDate)}
                </span>
              )
            }
          />
        </DashboardItemRecordCard>
      ))}
    </DashboardSectionCard>
  )
}
