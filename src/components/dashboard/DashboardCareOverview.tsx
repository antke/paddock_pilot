import { formatEventDate } from '#/components/events/eventDisplay'
import { Badge } from '#/components/ui/badge'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import { eventTypeLabels } from 'shared/events/eventSchema'
import {
  careReminderCategoryLabels,
  careReminderPriorityLabels,
} from 'shared/reminders/careReminderSchema'

type UserCareOverview = FunctionReturnType<
  typeof api.userCareOverview.getForCurrentUser
>
type StableSummary = UserCareOverview['stableSummaries'][number]
type ReminderItem = UserCareOverview['dueReminders'][number]
type EventItem = UserCareOverview['upcomingEvents'][number]
type AttentionHorseItem = UserCareOverview['attentionHorses'][number]

export function DashboardCareOverview() {
  const { data: overview } = useSuspenseQuery(
    convexQuery(api.userCareOverview.getForCurrentUser),
  )

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-xl font-semibold">Care command centre</h2>
        <p className="text-sm text-muted-foreground">
          Cross-stable reminders, attention items, and upcoming care for the
          next two weeks.
        </p>
      </div>

      <div className="grid gap-3 border-y border-border-subtle py-5 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewMetric
          title="Due reminders"
          value={`${overview.summary.dueReminderCount}`}
        >
          {overview.summary.overdueReminderCount} overdue
        </OverviewMetric>
        <OverviewMetric
          title="Upcoming care"
          value={`${overview.summary.upcomingEventCount}`}
        >
          Planned in the next 14 days
        </OverviewMetric>
        <OverviewMetric
          title="High alerts"
          value={`${overview.summary.highSeverityIssueCount}`}
        >
          Active high-severity issues
        </OverviewMetric>
        <OverviewMetric
          title="Active medication"
          value={`${overview.summary.activeMedicationCount}`}
        >
          Current medication courses
        </OverviewMetric>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <DueReminderCard reminders={overview.dueReminders} />
        <UpcomingEventCard events={overview.upcomingEvents} />
        <AttentionHorseCard horses={overview.attentionHorses} />
        <StableSummaryCard stables={overview.stableSummaries} />
      </div>
    </section>
  )
}

function OverviewMetric({
  title,
  value,
  children,
}: {
  title: string
  value: string
  children: string
}) {
  return (
    <div className="grid gap-1 sm:border-l sm:border-border-subtle sm:pl-4 first:sm:border-l-0 first:sm:pl-0">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

function DueReminderCard({ reminders }: { reminders: ReminderItem[] }) {
  return (
    <section className="grid min-w-0 content-start gap-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Due reminders</h3>
        <p className="text-sm text-muted-foreground">
          Pending reminders due soon across your stables.
        </p>
      </div>
      <div className="grid gap-3">
        {reminders.length === 0 ? (
          <EmptyState>No reminders due in the next 14 days.</EmptyState>
        ) : (
          reminders.map((reminder) => (
            <Link
              key={reminder.id}
              to="/stables/$stableId/reminders"
              params={{ stableId: reminder.stableId }}
              className="app-row app-row-hover grid gap-2 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{reminder.title}</span>
                {reminder.overdue && (
                  <Badge variant="destructive">Overdue</Badge>
                )}
                {reminder.priority && (
                  <Badge variant="secondary">
                    {careReminderPriorityLabels[reminder.priority]}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatEventDate(reminder.dueDate)} ·{' '}
                {careReminderCategoryLabels[reminder.category]} ·{' '}
                {reminder.stableName}
                {reminder.horseName ? ` · ${reminder.horseName}` : ''}
              </p>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

function UpcomingEventCard({ events }: { events: EventItem[] }) {
  return (
    <section className="grid min-w-0 content-start gap-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">Upcoming care</h3>
        <p className="text-sm text-muted-foreground">
          Planned events across your stables.
        </p>
      </div>
      <div className="grid gap-3">
        {events.length === 0 ? (
          <EmptyState>No planned events in the next 14 days.</EmptyState>
        ) : (
          events.map((event) => (
            <Link
              key={event.id}
              to="/stables/$stableId/events/$eventId"
              params={{ stableId: event.stableId, eventId: event.id }}
              className="app-row app-row-hover grid gap-2 p-4"
            >
              <span className="font-medium">{event.title}</span>
              <p className="text-sm text-muted-foreground">
                {formatEventDate(event.date)} at {event.time} ·{' '}
                {eventTypeLabels[event.type]} · {event.stableName} ·{' '}
                {event.horseCount} horse
                {event.horseCount === 1 ? '' : 's'}
              </p>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

function AttentionHorseCard({ horses }: { horses: AttentionHorseItem[] }) {
  return (
    <section className="grid min-w-0 content-start gap-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">
          Horses needing attention
        </h3>
        <p className="text-sm text-muted-foreground">
          Health, medication, and overdue reminder signals.
        </p>
      </div>
      <div className="grid gap-3">
        {horses.length === 0 ? (
          <EmptyState>No horse-level attention items right now.</EmptyState>
        ) : (
          horses.map((horse) => (
            <Link
              key={horse.horseId}
              to="/stables/$stableId/horses/$horseId"
              params={{ stableId: horse.stableId, horseId: horse.horseId }}
              className="app-row app-row-hover grid gap-2 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{horse.horseName}</span>
                {horse.highIssueCount > 0 && (
                  <Badge variant="destructive">
                    {horse.highIssueCount} high
                  </Badge>
                )}
                {horse.overdueReminderCount > 0 && (
                  <Badge variant="destructive">
                    {horse.overdueReminderCount} overdue
                  </Badge>
                )}
                {horse.activeMedicationCount > 0 && (
                  <Badge variant="secondary">
                    {horse.activeMedicationCount} medication
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {horse.stableName} · {horse.activeIssueCount} active issue
                {horse.activeIssueCount === 1 ? '' : 's'}
              </p>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

function StableSummaryCard({ stables }: { stables: StableSummary[] }) {
  return (
    <section className="grid min-w-0 content-start gap-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">
          Stable workload
        </h3>
        <p className="text-sm text-muted-foreground">
          Where care activity is concentrated.
        </p>
      </div>
      <div className="grid gap-3">
        {stables.length === 0 ? (
          <EmptyState>
            Create a stable to start tracking care workload.
          </EmptyState>
        ) : (
          stables.map((stable) => (
            <Link
              key={stable.stableId}
              to="/stables/$stableId"
              params={{ stableId: stable.stableId }}
              className="app-row app-row-hover grid gap-2 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{stable.stableName}</p>
                  <p className="text-sm text-muted-foreground">
                    {stable.location}
                  </p>
                </div>
                <Badge
                  variant={
                    stable.overdueReminderCount > 0
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {stable.overdueReminderCount} overdue
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {stable.horseCount} horses · {stable.upcomingEventCount}{' '}
                upcoming · {stable.dueReminderCount} due reminders ·{' '}
                {stable.highSeverityIssueCount} high alerts
              </p>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

function EmptyState({ children }: { children: string }) {
  return (
    <p className="rounded-row border border-dashed border-border-subtle p-4 text-sm text-muted-foreground">
      {children}
    </p>
  )
}
