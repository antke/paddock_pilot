import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import type { ReactNode } from 'react'
import { eventTypeLabels } from 'shared/events/eventSchema'
import {
  careReminderCategoryLabels,
  careReminderPriorityLabels,
} from 'shared/reminders/careReminderSchema'

type UserCareOverview = FunctionReturnType<
  typeof api.userCareOverview.getForCurrentUser
>
type ReminderItem = UserCareOverview['dueReminders'][number]
type EventItem = UserCareOverview['upcomingEvents'][number]
type AttentionHorseItem = UserCareOverview['attentionHorses'][number]
type CareTone = 'due' | 'planned' | 'attention' | 'stable'

const dashboardDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
})

const careRowClassName = (tone: CareTone) =>
  cn(
    'group/open grid gap-2 rounded-row border border-transparent border-l-4 bg-transparent py-3 pl-4 pr-3 transition-colors hover:border-primary/15 hover:bg-primary/5',
    tone === 'due' && 'border-l-amber-400 hover:border-l-amber-400',
    tone === 'planned' && 'border-l-primary/45 hover:border-l-primary/45',
    tone === 'attention' &&
      'border-l-destructive/45 hover:border-l-destructive/45',
    tone === 'stable' && 'border-l-muted-foreground/30 hover:border-l-primary/35',
  )

type DashboardCareOverviewProps = {
  stableId: Doc<'stables'>['_id'] | undefined
}

export function DashboardCareOverview({ stableId }: DashboardCareOverviewProps) {
  const overviewArgs = stableId ? { stableId } : {}
  const { data: overview } = useSuspenseQuery(
    convexQuery(api.userCareOverview.getForCurrentUser, overviewArgs),
  )

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-xl font-semibold">Care command centre</h2>
        <p className="text-sm text-muted-foreground">
          Reminders, attention items, and upcoming care for the selected stable.
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
          Pending reminders due soon for this stable.
        </p>
      </div>
      <div className="grid gap-2">
        {reminders.length === 0 ? (
          <EmptyState>No reminders due in the next 14 days.</EmptyState>
        ) : (
          reminders.map((reminder) => (
            <Link
              key={reminder.id}
              to="/stables/$stableId/reminders"
              params={{ stableId: reminder.stableId }}
              className={careRowClassName(reminder.overdue ? 'attention' : 'due')}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold underline-offset-4 transition-colors group-hover/open:text-primary group-hover/open:underline">
                  {reminder.title}
                </span>
                {reminder.overdue && <CareTag tone="attention">Overdue</CareTag>}
                {reminder.priority && (
                  <CareTag tone="due">
                    {careReminderPriorityLabels[reminder.priority]}
                  </CareTag>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Due {formatDashboardDate(reminder.dueDate)}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <CareTag tone="planned">
                  {careReminderCategoryLabels[reminder.category]}
                </CareTag>
                <CareTag tone="stable">{reminder.stableName}</CareTag>
                {reminder.horseName && (
                  <CareTag tone="horse">{reminder.horseName}</CareTag>
                )}
              </div>
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
          Planned events for this stable.
        </p>
      </div>
      <div className="grid gap-2">
        {events.length === 0 ? (
          <EmptyState>No planned events in the next 14 days.</EmptyState>
        ) : (
          events.map((event) => (
            <Link
              key={event.id}
              to="/stables/$stableId/events/$eventId"
              params={{ stableId: event.stableId, eventId: event.id }}
              className={careRowClassName('planned')}
            >
              <span className="text-sm font-semibold underline-offset-4 transition-colors group-hover/open:text-primary group-hover/open:underline">
                {event.title}
              </span>
              <p className="text-xs text-muted-foreground">
                {formatDashboardDate(event.date)} at {event.time}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <CareTag tone="planned">{eventTypeLabels[event.type]}</CareTag>
                <CareTag tone="stable">{event.stableName}</CareTag>
                <CareTag tone="horse">
                  {event.horseCount} horse
                  {event.horseCount === 1 ? '' : 's'}
                </CareTag>
              </div>
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
      <div className="grid gap-2">
        {horses.length === 0 ? (
          <EmptyState>No horse-level attention items right now.</EmptyState>
        ) : (
          horses.map((horse) => (
            <Link
              key={horse.horseId}
              to="/stables/$stableId/horses/$horseId"
              params={{ stableId: horse.stableId, horseId: horse.horseId }}
              className={careRowClassName('attention')}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold underline-offset-4 transition-colors group-hover/open:text-primary group-hover/open:underline">
                  {horse.horseName}
                </span>
                {horse.highIssueCount > 0 && (
                  <CareTag tone="attention">{horse.highIssueCount} high</CareTag>
                )}
                {horse.overdueReminderCount > 0 && (
                  <CareTag tone="due">
                    {horse.overdueReminderCount} overdue
                  </CareTag>
                )}
                {horse.activeMedicationCount > 0 && (
                  <CareTag tone="medication">
                    {horse.activeMedicationCount} medication
                  </CareTag>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {horse.activeIssueCount} active issue
                {horse.activeIssueCount === 1 ? '' : 's'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <CareTag tone="stable">{horse.stableName}</CareTag>
              </div>
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

function formatDashboardDate(date: string) {
  return dashboardDateFormatter.format(new Date(`${date}T00:00:00`))
}

function CareTag({
  tone,
  children,
}: {
  tone: 'attention' | 'due' | 'planned' | 'stable' | 'horse' | 'medication'
  children: ReactNode
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'shadow-none',
        tone === 'attention' &&
          'border-destructive/25 bg-destructive/10 text-destructive',
        tone === 'due' && 'border-amber-400/35 bg-amber-100/45 text-amber-900',
        tone === 'planned' && 'border-primary/25 bg-primary/8 text-primary',
        tone === 'stable' &&
          'border-slate-400/25 bg-slate-100/40 text-slate-700 dark:border-slate-500/30 dark:bg-slate-900/30 dark:text-slate-200',
        tone === 'horse' &&
          'border-emerald-500/25 bg-emerald-100/35 text-emerald-800 dark:bg-emerald-950/25 dark:text-emerald-200',
        tone === 'medication' &&
          'border-sky-500/25 bg-sky-100/40 text-sky-800 dark:bg-sky-950/30 dark:text-sky-200',
      )}
    >
      {children}
    </Badge>
  )
}
