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
import type { ReactNode } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

type AppDashboardProps = {
  user: Doc<'users'> | null
  stables: Array<Doc<'stables'>>
  events: Array<Doc<'events'>>
}

export function AppDashboard({ user, stables, events }: AppDashboardProps) {
  const today = new Date().toISOString().slice(0, 10)
  const upcomingEvents = events
    .filter((event) => event.date >= today)
    .slice(0, 5)
  const stableNames = new Map(
    stables.map((stable) => [stable._id, stable.name]),
  )

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl font-semibold">
            {user ? formatUserName(user) : 'Paddock Pilot'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your stables, horses, and upcoming work from one place.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/stables/create"
            className={buttonVariants({ variant: 'outline' })}
          >
            Create stable
          </Link>
          <Link to="/stables" className={buttonVariants()}>
            View stables
          </Link>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Stables" value={`${stables.length}`} />
        <SummaryCard
          title="Upcoming events"
          value={`${upcomingEvents.length}`}
        />
        <SummaryCard title="All events" value={`${events.length}`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Your stables</CardTitle>
            <CardDescription>
              Open a stable or create your first one.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {stables.length === 0 ? (
              <EmptyState
                title="No stables yet"
                description="Create a stable to start adding horses and events."
                action={
                  <Link to="/stables/create" className={buttonVariants()}>
                    Create stable
                  </Link>
                }
              />
            ) : (
              stables.map((stable) => (
                <Link
                  key={stable._id}
                  to="/stables/$stableId"
                  params={{ stableId: stable._id }}
                  className="grid gap-1 border p-4 transition-colors hover:bg-muted/50"
                >
                  <span className="font-medium">{stable.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {stable.location}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming events</CardTitle>
            <CardDescription>Your next scheduled stable work.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {upcomingEvents.length === 0 ? (
              <EmptyState
                title="Nothing scheduled"
                description="Add events from a stable dashboard when you are ready."
              />
            ) : (
              upcomingEvents.map((event) => (
                <Link
                  key={event._id}
                  to="/stables/$stableId/events/$eventId"
                  params={{ stableId: event.stableId, eventId: event._id }}
                  className="grid gap-1 border p-4 transition-colors hover:bg-muted/50"
                >
                  <span className="font-medium">{event.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {event.date} at {event.time} ·{' '}
                    {stableNames.get(event.stableId) ?? 'Stable'}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <PendingHorseInvitations />
    </div>
  )
}

function PendingHorseInvitations() {
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

  if (invitations.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horse invitations</CardTitle>
        <CardDescription>
          Approve or decline event invitations for your horses.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {invitations.map(({ invitation, event, horse }, index) => (
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
            {index < invitations.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="grid gap-3 border border-dashed p-6 text-center">
      <div className="grid gap-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

function formatUserName(user: Doc<'users'>) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ')
}
