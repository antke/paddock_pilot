import { createDashboardLabData } from '#/components/dashboard-lab/dashboardLabData'
import { StableCommandCenter } from '#/components/dashboard-lab/prototypes/StableCommandCenter'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button, buttonVariants } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type AppDashboardProps = {
  stables: Array<Doc<'stables'>>
  events: Array<Doc<'events'>>
}

export function AppDashboard({ stables, events }: AppDashboardProps) {
  const [activeStableId, setActiveStableId] = useState<Doc<'stables'>['_id']>()
  const activeStable = stables.find((stable) => stable._id === activeStableId) ?? stables[0]

  useEffect(() => {
    if (stables.length === 0) {
      setActiveStableId(undefined)
      return
    }

    if (!activeStableId || !stables.some((stable) => stable._id === activeStableId)) {
      setActiveStableId(stables[0]._id)
    }
  }, [activeStableId, stables])

  if (!activeStable) {
    return (
      <Alert>
        <AlertTitle>No stables yet</AlertTitle>
        <AlertDescription className="grid gap-4">
          <span>Create a stable to start using the dashboard.</span>
          <Link to="/stables/create" className={buttonVariants()}>
            Create stable
          </Link>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <AppDashboardData
      activeStable={activeStable}
      stables={stables}
      events={events}
      onActiveStableChange={setActiveStableId}
    />
  )
}

function AppDashboardData({
  activeStable,
  stables,
  events,
  onActiveStableChange,
}: {
  activeStable: Doc<'stables'>
  stables: Array<Doc<'stables'>>
  events: Array<Doc<'events'>>
  onActiveStableChange: (stableId: Doc<'stables'>['_id']) => void
}) {
  const { data: overview } = useSuspenseQuery(
    convexQuery(api.userCareOverview.getForCurrentUser, {
      stableId: activeStable._id,
    }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: activeStable._id }),
  )
  const data = createDashboardLabData({
    stable: activeStable,
    stables,
    events,
    horses,
    overview,
  })

  return (
    <div className="grid gap-6">
      <StableCommandCenter data={data} onActiveStableChange={onActiveStableChange} />
      <PendingHorseInvitations stableId={activeStable._id} />
    </div>
  )
}

function PendingHorseInvitations({ stableId }: { stableId: Doc<'stables'>['_id'] }) {
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
      toast.success('Horse invitation approved', { position: 'top-right' })
    } catch {
      toast.error('Oops! Something went wrong.', { position: 'top-right' })
    } finally {
      setBusyInvitationId(undefined)
    }
  }

  const onDecline = async (eventHorseId: Doc<'eventsHorses'>['_id']) => {
    try {
      setBusyInvitationId(eventHorseId)
      await declineInvitation({ eventHorseId })
      toast.success('Horse invitation declined', { position: 'top-right' })
    } catch {
      toast.error('Oops! Something went wrong.', { position: 'top-right' })
    } finally {
      setBusyInvitationId(undefined)
    }
  }

  const stableInvitations = invitations.filter(({ event }) => event?.stableId === stableId)

  if (stableInvitations.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horse invitations</CardTitle>
        <CardDescription>
          Approve or decline event invitations for your horses.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {stableInvitations.map(({ invitation, event, horse }, index) => (
          <div key={invitation._id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="grid gap-1">
                <span className="font-medium">
                  {horse?.name ?? 'Horse'} invited to {event?.title ?? 'event'}
                </span>
                {event && (
                  <span className="text-sm text-muted-foreground">
                    {event.date} at {event.time}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
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
              </div>
            </div>
            {index < stableInvitations.length - 1 && (
              <Separator className="mt-4" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
