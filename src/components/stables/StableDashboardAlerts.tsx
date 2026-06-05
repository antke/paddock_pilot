import { formatEventDate } from '#/components/events/eventDisplay'
import { Badge } from '#/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import { eventTypeLabels } from 'shared/events/eventSchema'
import { careReminderCategoryLabels } from 'shared/reminders/careReminderSchema'

type StableDashboardAlerts = FunctionReturnType<
  typeof api.stableDashboardAlerts.getForStable
>

type StableDashboardAlertsProps = {
  stableId: string
}

export function StableDashboardAlerts({ stableId }: StableDashboardAlertsProps) {
  const { data: alerts } = useSuspenseQuery(
    convexQuery(api.stableDashboardAlerts.getForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  const hasAlerts = Object.values(alerts.summary).some((count) => count > 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Care alerts</CardTitle>
          {hasAlerts && <Badge variant="secondary">Actionable</Badge>}
        </div>
        <CardDescription>
          Quick checks for urgent care, missing details, follow-ups, and upcoming
          service coordination.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 xl:grid-cols-3">
        <AlertSection title="Needs attention" count={alerts.summary.highSeverityIssueCount}>
          {alerts.highSeverityIssues.length === 0 ? (
            <EmptyAlert>No high-severity active health issues.</EmptyAlert>
          ) : (
            alerts.highSeverityIssues.slice(0, 4).map((issue) => (
              <AlertItem key={issue.id}>
                <Link
                  to="/stables/$stableId/horses/$horseId"
                  params={{ stableId, horseId: issue.horseId }}
                  className="font-medium hover:underline"
                >
                  {issue.horseName}
                </Link>
                <p className="text-sm text-muted-foreground">{issue.title}</p>
              </AlertItem>
            ))
          )}
        </AlertSection>

        <AlertSection title="Due reminders" count={alerts.summary.dueReminderCount}>
          {alerts.dueReminders.length === 0 ? (
            <EmptyAlert>No reminders due in the next 7 days.</EmptyAlert>
          ) : (
            alerts.dueReminders.slice(0, 4).map((reminder) => (
              <AlertItem key={reminder.id}>
                <Link
                  to="/stables/$stableId/reminders"
                  params={{ stableId }}
                  className="font-medium hover:underline"
                >
                  {reminder.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {reminder.overdue ? 'Overdue' : 'Due'} {formatEventDate(reminder.dueDate)} ·{' '}
                  {careReminderCategoryLabels[reminder.category]}
                  {reminder.horseName ? ` · ${reminder.horseName}` : ''}
                </p>
              </AlertItem>
            ))
          )}
        </AlertSection>

        <AlertSection title="Upcoming care" count={alerts.summary.upcomingEventCount}>
          {alerts.upcomingEvents.length === 0 ? (
            <EmptyAlert>No planned events in the next 30 days.</EmptyAlert>
          ) : (
            alerts.upcomingEvents.slice(0, 4).map((event) => (
              <AlertItem key={event.id}>
                <Link
                  to="/stables/$stableId/events/$eventId"
                  params={{ stableId, eventId: event.id }}
                  className="font-medium hover:underline"
                >
                  {event.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatEventDate(event.date)} · {eventTypeLabels[event.type]} ·{' '}
                  {event.horseCount} horse{event.horseCount === 1 ? '' : 's'}
                </p>
              </AlertItem>
            ))
          )}
        </AlertSection>

        <AlertSection title="Profile gaps" count={alerts.summary.profileGapCount}>
          {alerts.profileGaps.length === 0 ? (
            <EmptyAlert>Important horse profile details are filled in.</EmptyAlert>
          ) : (
            alerts.profileGaps.slice(0, 4).map((horse) => (
              <AlertItem key={horse.horseId}>
                <Link
                  to="/stables/$stableId/horses/$horseId/edit"
                  params={{ stableId, horseId: horse.horseId }}
                  className="font-medium hover:underline"
                >
                  {horse.horseName}
                </Link>
                <p className="text-sm text-muted-foreground">
                  Missing {horse.missingFields.slice(0, 3).join(', ')}
                  {horse.missingFields.length > 3 ? '…' : ''}
                </p>
              </AlertItem>
            ))
          )}
        </AlertSection>

        <AlertSection title="Event follow-ups" count={alerts.summary.completionNoteGapCount}>
          {alerts.completionNoteGaps.length === 0 ? (
            <EmptyAlert>Completed events have aftercare notes.</EmptyAlert>
          ) : (
            alerts.completionNoteGaps.slice(0, 4).map((event) => (
              <AlertItem key={event.id}>
                <Link
                  to="/stables/$stableId/events/$eventId/edit"
                  params={{ stableId, eventId: event.id }}
                  className="font-medium hover:underline"
                >
                  {event.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  Completed {formatEventDate(event.date)} without notes.
                </p>
              </AlertItem>
            ))
          )}
        </AlertSection>

        <AlertSection title="Horse outcomes" count={alerts.summary.serviceOutcomeGapCount}>
          {alerts.serviceOutcomeGaps.length === 0 ? (
            <EmptyAlert>Completed shared visits have per-horse outcomes.</EmptyAlert>
          ) : (
            alerts.serviceOutcomeGaps.slice(0, 4).map((row) => (
              <AlertItem key={row.id}>
                <Link
                  to="/stables/$stableId/events/$eventId"
                  params={{ stableId, eventId: row.eventId }}
                  className="font-medium hover:underline"
                >
                  {row.eventTitle}
                </Link>
                <p className="text-sm text-muted-foreground">
                  Add outcome notes for {row.horseName}.
                </p>
              </AlertItem>
            ))
          )}
        </AlertSection>

        <AlertSection title="Provider details" count={alerts.summary.providerGapCount}>
          {alerts.providerGaps.length === 0 ? (
            <EmptyAlert>Event provider details are filled in.</EmptyAlert>
          ) : (
            alerts.providerGaps.slice(0, 4).map((event) => (
              <AlertItem key={event.id}>
                <Link
                  to="/stables/$stableId/events/$eventId/edit"
                  params={{ stableId, eventId: event.id }}
                  className="font-medium hover:underline"
                >
                  {event.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  Missing{' '}
                  {[
                    event.missingProviderName ? 'provider name' : null,
                    event.missingProviderPhone ? 'provider phone' : null,
                  ]
                    .filter(Boolean)
                    .join(' and ')}
                  .
                </p>
              </AlertItem>
            ))
          )}
        </AlertSection>

        <AlertSection title="Pending invites" count={alerts.summary.pendingInvitationCount}>
          {alerts.summary.pendingInvitationCount === 0 ? (
            <EmptyAlert>No pending stable or horse event invitations.</EmptyAlert>
          ) : (
            <div className="grid gap-3">
              {alerts.pendingStableInvitations.slice(0, 2).map((invitation) => (
                <AlertItem key={invitation.id}>
                  <Link
                    to="/stables/$stableId/settings"
                    params={{ stableId }}
                    className="font-medium hover:underline"
                  >
                    {invitation.email}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Stable {invitation.role} invitation is {invitation.status}.
                  </p>
                </AlertItem>
              ))}
              {alerts.pendingHorseInvitations.slice(0, 2).map((invitation) => (
                <AlertItem key={invitation.id}>
                  <Link
                    to="/stables/$stableId/events/$eventId"
                    params={{ stableId, eventId: invitation.eventId }}
                    className="font-medium hover:underline"
                  >
                    {invitation.eventTitle}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Waiting for {invitation.horseName}.
                  </p>
                </AlertItem>
              ))}
            </div>
          )}
        </AlertSection>
      </CardContent>
    </Card>
  )
}

function AlertSection({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        <Badge variant={count > 0 ? 'default' : 'secondary'}>{count}</Badge>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  )
}

function AlertItem({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-1 text-sm">{children}</div>
}

function EmptyAlert({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}
