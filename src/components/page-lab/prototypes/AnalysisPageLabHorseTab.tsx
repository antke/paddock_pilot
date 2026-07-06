import {
  dashboardEmptyClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
import { dashboardItemCardClassName } from '#/components/dashboard/DashboardItemCard'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import {
  formatEventDate,
  formatEventDateRange,
} from '#/components/events/eventDisplay'
import { Badge } from '#/components/ui/badge'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { cn } from '#/lib/utils'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { eventStatusLabels, eventTypeLabels } from 'shared/events/eventSchema'
import {
  careReminderCategoryLabels,
  careReminderPriorityLabels,
} from 'shared/reminders/careReminderSchema'
import type { LabTimelineSignal } from './analysisPageLabData'
import type {
  LabHorseCareCadence,
  LabHorseDeepDive,
  LabHorseNutritionSignal,
  LabHorseOutcomeGap,
  LabHorseWeightTrend,
} from './analysisPageLabHorseData'
import {
  timelineSignalKindAccentColors,
  timelineSignalKindLabels,
} from './analysisTimelineSignalMeta'

type LabHorse = DashboardLabData['horses'][number]
type HorseEvent = LabHorseDeepDive['upcomingEvents'][number]
type HorseReminder = LabHorseDeepDive['dueReminders'][number]
type HorseMetricTone = 'default' | 'urgent' | 'steady'

export function AnalysisPageLabHorseTab({
  horse,
  stableId,
  analysis,
}: {
  horse: LabHorse
  stableId: DashboardLabData['stable']['_id']
  analysis: LabHorseDeepDive
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-3 xl:items-start">
      <HorseWellbeingSummaryPanel
        horse={horse}
        analysis={analysis}
        className="xl:col-span-3"
      />
      <HorseHealthMedicationPanel analysis={analysis} className="xl:col-span-2" />
      <HorseProgressPanel analysis={analysis} />
      <HorseNutritionPanel analysis={analysis} />
      <HorseCarePlanPanel
        analysis={analysis}
        stableId={stableId}
        className="xl:col-span-2"
      />
      <HorseDocumentationPanel analysis={analysis} stableId={stableId} />
    </div>
  )
}

function HorseAnalysisPanel({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={dashboardSectionClassName(
        'soft',
        cn('grid min-w-0 gap-5', className),
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1">
          <h2 className="text-2xl font-semibold leading-tight tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="max-w-2xl text-base leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action}
      </div>

      <div className="min-w-0">{children}</div>
    </section>
  )
}

function HorseAnalysisList({
  children,
  itemCount,
  visibleItemLimit,
  estimatedItemHeightRem,
  className,
}: {
  children: ReactNode
  itemCount: number
  visibleItemLimit: number
  estimatedItemHeightRem?: number
  className?: string
}) {
  return (
    <ScrollableList
      itemCount={itemCount}
      visibleItemLimit={visibleItemLimit}
      estimatedItemHeightRem={estimatedItemHeightRem}
      className={cn('min-h-0 pb-2', className)}
    >
      {children}
    </ScrollableList>
  )
}

function HorseWellbeingSummaryPanel({
  horse,
  analysis,
  className,
}: {
  horse: LabHorse
  analysis: LabHorseDeepDive
  className?: string
}) {
  const latestSignal = analysis.recentSignals[0]
  const metrics = [
    {
      label: 'Active health',
      value: `${analysis.summary.activeIssueCount}`,
      detail:
        analysis.summary.highIssueCount > 0
          ? formatCount(analysis.summary.highIssueCount, 'high-severity issue')
          : 'No high-severity active issue',
      tone: analysis.summary.highIssueCount > 0 ? 'urgent' : 'steady',
    },
    {
      label: 'Medication',
      value: `${analysis.summary.activeMedicationCount}`,
      detail: 'Active medication records',
      tone: analysis.summary.activeMedicationCount > 0 ? 'urgent' : 'default',
    },
    {
      label: 'Reminders',
      value: `${analysis.summary.overdueReminderCount}`,
      detail: 'Overdue horse-specific reminders',
      tone: analysis.summary.overdueReminderCount > 0 ? 'urgent' : 'steady',
    },
    {
      label: 'Upcoming care',
      value: `${analysis.summary.upcomingEventCount}`,
      detail: 'Planned events in the next 30 days',
      tone: 'default',
    },
  ] as const satisfies ReadonlyArray<{
    label: string
    value: string
    detail: string
    tone: HorseMetricTone
  }>

  return (
    <HorseAnalysisPanel
      title={horse.name}
      description="Horse-specific health, progress, and wellbeing signals. Stable-level comparisons stay in the stable tab; this view follows one horse in detail."
      action={<Badge variant="outline">{formatCount(analysis.summary.signalCount, 'record')}</Badge>}
      className={className}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <HorseMetricCard key={metric.label} metric={metric} />
          ))}
        </div>

        <div
          className={dashboardItemCardClassName({
            chrome: 'soft',
            className: 'grid content-start gap-2',
          })}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold">Latest signal</span>
            {latestSignal ? (
              <Badge variant={latestSignal.urgent ? 'destructive' : 'secondary'}>
                {timelineSignalKindLabels[latestSignal.kind]}
              </Badge>
            ) : null}
          </div>
          {latestSignal ? (
            <HorseSignalRow signal={latestSignal} compact />
          ) : (
            <p className={dashboardEmptyClassName('soft')}>
              No horse-specific health, medication, nutrition, weight, or reminder
              records yet.
            </p>
          )}
        </div>
      </div>
    </HorseAnalysisPanel>
  )
}

function HorseMetricCard({
  metric,
}: {
  metric: {
    label: string
    value: string
    detail: string
    tone: HorseMetricTone
  }
}) {
  return (
    <div
      className={dashboardItemCardClassName({
        chrome: 'soft',
        density: 'compact',
        className: cn(
          'grid gap-2 p-4',
          metric.tone === 'urgent' && 'border-destructive/35 bg-destructive/5',
        ),
      })}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {metric.label}
      </span>
      <span
        className={cn(
          'text-3xl font-semibold leading-none tracking-tight',
          metric.tone === 'urgent' && 'text-destructive',
        )}
      >
        {metric.value}
      </span>
      <span className="text-sm leading-5 text-muted-foreground">{metric.detail}</span>
    </div>
  )
}

function HorseHealthMedicationPanel({
  analysis,
  className,
}: {
  analysis: LabHorseDeepDive
  className?: string
}) {
  const recordCount = analysis.healthSignals.length + analysis.medicationSignals.length

  return (
    <HorseAnalysisPanel
      title="Health & medication"
      description="Recent horse-specific health records and medication starts, separated from stable-wide workload views."
      action={<Badge variant="outline">{formatCount(recordCount, 'record')}</Badge>}
      className={className}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
        <HorseHealthOverview analysis={analysis} />
        <div className="grid gap-4 lg:grid-cols-2">
          <HorseSignalGroup
            title="Health records"
            signals={analysis.healthSignals}
            emptyLabel="No health records for this horse yet."
          />
          <HorseSignalGroup
            title="Medication records"
            signals={analysis.medicationSignals}
            emptyLabel="No medication records for this horse yet."
          />
        </div>
      </div>
    </HorseAnalysisPanel>
  )
}

function HorseHealthOverview({ analysis }: { analysis: LabHorseDeepDive }) {
  const frequency = analysis.healthFrequency

  return (
    <div
      className={dashboardItemCardClassName({
        chrome: 'soft',
        className: 'grid content-start gap-3',
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">Health overview</span>
        <Badge
          variant={analysis.summary.activeIssueCount > 0 ? 'destructive' : 'secondary'}
        >
          {formatCount(analysis.summary.activeIssueCount, 'active issue')}
        </Badge>
      </div>
      {frequency ? (
        <div className="grid gap-2 text-sm leading-5 text-muted-foreground">
          <div className="flex items-center justify-between gap-3">
            <span>Total records</span>
            <span className="font-medium text-foreground">{frequency.totalCount}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Resolved</span>
            <span className="font-medium text-foreground">
              {frequency.resolvedCount}
            </span>
          </div>
          {frequency.latestIssueTitle ? (
            <p className="pt-2 text-foreground">Latest: {frequency.latestIssueTitle}</p>
          ) : null}
          {frequency.latestNotedAt ? (
            <p>Noted {formatTimestampDate(frequency.latestNotedAt)}</p>
          ) : null}
        </div>
      ) : (
        <p className={dashboardEmptyClassName('soft')}>
          No health issue frequency data for this horse yet.
        </p>
      )}
    </div>
  )
}

function HorseProgressPanel({ analysis }: { analysis: LabHorseDeepDive }) {
  const hasRecords = Boolean(analysis.weightTrend) || analysis.weightSignals.length > 0

  return (
    <HorseAnalysisPanel
      title="Weight & condition"
      description="Weight recordings and body condition changes belong in the horse tab, not the stable summary."
      action={
        analysis.weightTrend ? (
          <Badge variant="outline">
            {analysis.weightTrend.latestWeight} {analysis.weightTrend.unit}
          </Badge>
        ) : undefined
      }
    >
      {!hasRecords ? (
        <p className={dashboardEmptyClassName('soft')}>
          No weight or body condition records for this horse yet.
        </p>
      ) : (
        <div className="grid gap-4">
          {analysis.weightTrend ? (
            <HorseWeightTrendCard trend={analysis.weightTrend} />
          ) : null}
          <HorseSignalGroup
            title="Recent weight records"
            signals={analysis.weightSignals}
            emptyLabel="No recent weight records in the timeline."
          />
        </div>
      )}
    </HorseAnalysisPanel>
  )
}

function HorseWeightTrendCard({ trend }: { trend: LabHorseWeightTrend }) {
  return (
    <div
      className={dashboardItemCardClassName({
        chrome: 'soft',
        className: 'grid gap-3',
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">Latest recording</span>
        <Badge variant="secondary">
          {trend.latestWeight} {trend.unit}
        </Badge>
      </div>
      <p className="text-sm leading-5 text-muted-foreground">
        Measured {formatTimestampDate(trend.measuredAt)}
      </p>
      {trend.weightChange !== undefined ? (
        <p className="text-sm leading-5">
          Weight change: {formatSignedNumber(trend.weightChange)} {trend.unit}
        </p>
      ) : null}
      {trend.latestBodyConditionScore !== undefined ? (
        <p className="text-sm leading-5 text-muted-foreground">
          Body condition {trend.latestBodyConditionScore}
          {trend.bodyConditionChange !== undefined
            ? ` (${formatSignedNumber(trend.bodyConditionChange)})`
            : ''}
        </p>
      ) : null}
    </div>
  )
}

function HorseNutritionPanel({ analysis }: { analysis: LabHorseDeepDive }) {
  const signalCount =
    analysis.nutritionSignals.length + analysis.nutritionTimelineSignals.length

  return (
    <HorseAnalysisPanel
      title="Nutrition signals"
      description="Nutrition changes linked to this horse's weight or health records."
      action={<Badge variant="outline">{formatCount(signalCount, 'signal')}</Badge>}
    >
      {signalCount === 0 ? (
        <p className={dashboardEmptyClassName('soft')}>
          No nutrition changes near this horse's health or weight records yet.
        </p>
      ) : (
        <div className="grid gap-4">
          {analysis.nutritionSignals.length > 0 ? (
            <HorseAnalysisList
              itemCount={analysis.nutritionSignals.length}
              visibleItemLimit={4}
              estimatedItemHeightRem={6.5}
            >
              {analysis.nutritionSignals.map((signal) => (
                <HorseNutritionSignalRow key={signal.id} signal={signal} />
              ))}
            </HorseAnalysisList>
          ) : null}
          <HorseSignalGroup
            title="Recent nutrition records"
            signals={analysis.nutritionTimelineSignals}
            emptyLabel="No recent nutrition records in the timeline."
          />
        </div>
      )}
    </HorseAnalysisPanel>
  )
}

function HorseNutritionSignalRow({
  signal,
}: {
  signal: LabHorseNutritionSignal
}) {
  return (
    <div
      className={dashboardItemCardClassName({
        chrome: 'soft',
        className: 'grid gap-2',
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{signal.summary}</span>
        <Badge variant="outline">{formatTimestampDate(signal.changedAt)}</Badge>
      </div>
      <p className="text-sm leading-5 text-muted-foreground">
        {formatCount(signal.nearbyWeightCount, 'nearby weight record')} ·{' '}
        {formatCount(signal.nearbyHealthIssueCount, 'nearby health issue')}
      </p>
    </div>
  )
}

function HorseCarePlanPanel({
  analysis,
  stableId,
  className,
}: {
  analysis: LabHorseDeepDive
  stableId: DashboardLabData['stable']['_id']
  className?: string
}) {
  const itemCount =
    analysis.dueReminders.length +
    analysis.upcomingEvents.length +
    analysis.careCadence.length

  return (
    <HorseAnalysisPanel
      title="Care plan"
      description="Horse-specific reminders, upcoming appointments, and cadence checks."
      action={<Badge variant="outline">{formatCount(itemCount, 'item')}</Badge>}
      className={className}
    >
      {itemCount === 0 ? (
        <p className={dashboardEmptyClassName('soft')}>
          No due reminders, upcoming events, or cadence checks for this horse.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <HorseReminderGroup reminders={analysis.dueReminders} />
          <HorseUpcomingEventGroup
            events={analysis.upcomingEvents}
            stableId={stableId}
          />
          <HorseCadenceGroup items={analysis.careCadence} />
        </div>
      )}
    </HorseAnalysisPanel>
  )
}

function HorseReminderGroup({ reminders }: { reminders: Array<HorseReminder> }) {
  return (
    <div className="grid content-start gap-3">
      <h3 className="font-semibold">Due reminders</h3>
      {reminders.length === 0 ? (
        <p className={dashboardEmptyClassName('soft')}>No due reminders.</p>
      ) : (
        <HorseAnalysisList
          itemCount={reminders.length}
          visibleItemLimit={4}
          estimatedItemHeightRem={5.75}
        >
          {reminders.map((reminder) => (
            <HorseReminderRow key={reminder.id} reminder={reminder} />
          ))}
        </HorseAnalysisList>
      )}
    </div>
  )
}

function HorseUpcomingEventGroup({
  events,
  stableId,
}: {
  events: Array<HorseEvent>
  stableId: DashboardLabData['stable']['_id']
}) {
  return (
    <div className="grid content-start gap-3">
      <h3 className="font-semibold">Upcoming events</h3>
      {events.length === 0 ? (
        <p className={dashboardEmptyClassName('soft')}>No upcoming events.</p>
      ) : (
        <HorseAnalysisList
          itemCount={events.length}
          visibleItemLimit={4}
          estimatedItemHeightRem={5.75}
        >
          {events.map((event) => (
            <HorseEventRow key={event._id} event={event} stableId={stableId} />
          ))}
        </HorseAnalysisList>
      )}
    </div>
  )
}

function HorseCadenceGroup({ items }: { items: Array<LabHorseCareCadence> }) {
  return (
    <div className="grid content-start gap-3">
      <h3 className="font-semibold">Care cadence</h3>
      {items.length === 0 ? (
        <p className={dashboardEmptyClassName('soft')}>No cadence data yet.</p>
      ) : (
        <HorseAnalysisList
          itemCount={items.length}
          visibleItemLimit={4}
          estimatedItemHeightRem={5.75}
        >
          {items.map((item) => (
            <HorseCadenceRow key={`${item.horseId}:${item.type}`} item={item} />
          ))}
        </HorseAnalysisList>
      )}
    </div>
  )
}

function HorseDocumentationPanel({
  analysis,
  stableId,
}: {
  analysis: LabHorseDeepDive
  stableId: DashboardLabData['stable']['_id']
}) {
  const gapCount =
    analysis.completionNotesNeeded.length + analysis.horseOutcomeNotesNeeded.length

  return (
    <HorseAnalysisPanel
      title="Documentation gaps"
      description="Completed care for this horse that still needs notes."
      action={
        <Badge variant={gapCount > 0 ? 'destructive' : 'secondary'}>
          {formatCount(gapCount, 'gap')}
        </Badge>
      }
    >
      {gapCount === 0 ? (
        <p className={dashboardEmptyClassName('soft')}>
          No missing completion notes for this horse.
        </p>
      ) : (
        <div className="grid gap-4">
          <HorseDocumentationEventGroup
            events={analysis.completionNotesNeeded}
            stableId={stableId}
          />
          <HorseOutcomeGapGroup
            outcomes={analysis.horseOutcomeNotesNeeded}
            stableId={stableId}
          />
        </div>
      )}
    </HorseAnalysisPanel>
  )
}

function HorseDocumentationEventGroup({
  events,
  stableId,
}: {
  events: Array<HorseEvent>
  stableId: DashboardLabData['stable']['_id']
}) {
  if (events.length === 0) return null

  return (
    <div className="grid gap-3">
      <h3 className="font-semibold">Event notes</h3>
      <HorseAnalysisList
        itemCount={events.length}
        visibleItemLimit={4}
        estimatedItemHeightRem={5.75}
      >
        {events.map((event) => (
          <HorseEventRow
            key={event._id}
            event={event}
            stableId={stableId}
            tone="documentation"
          />
        ))}
      </HorseAnalysisList>
    </div>
  )
}

function HorseOutcomeGapGroup({
  outcomes,
  stableId,
}: {
  outcomes: Array<LabHorseOutcomeGap>
  stableId: DashboardLabData['stable']['_id']
}) {
  if (outcomes.length === 0) return null

  return (
    <div className="grid gap-3">
      <h3 className="font-semibold">Horse outcome notes</h3>
      <HorseAnalysisList
        itemCount={outcomes.length}
        visibleItemLimit={4}
        estimatedItemHeightRem={5.25}
      >
        {outcomes.map((outcome) => (
          <HorseOutcomeGapRow
            key={outcome.id}
            outcome={outcome}
            stableId={stableId}
          />
        ))}
      </HorseAnalysisList>
    </div>
  )
}

function HorseSignalGroup({
  title,
  signals,
  emptyLabel,
}: {
  title: string
  signals: Array<LabTimelineSignal>
  emptyLabel: string
}) {
  return (
    <div className="grid content-start gap-3">
      <h3 className="font-semibold">{title}</h3>
      {signals.length === 0 ? (
        <p className={dashboardEmptyClassName('soft')}>{emptyLabel}</p>
      ) : (
        <HorseAnalysisList
          itemCount={signals.length}
          visibleItemLimit={4}
          estimatedItemHeightRem={5.5}
        >
          {signals.map((signal) => (
            <HorseSignalRow key={`${signal.kind}:${signal.id}`} signal={signal} />
          ))}
        </HorseAnalysisList>
      )}
    </div>
  )
}

function HorseSignalRow({
  signal,
  compact,
}: {
  signal: LabTimelineSignal
  compact?: boolean
}) {
  return (
    <div
      className={dashboardItemCardClassName({
        chrome: 'soft',
        density: compact ? 'compact' : undefined,
        className: 'grid gap-2',
      })}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: timelineSignalKindAccentColors[signal.kind] }}
        />
        <span className="truncate font-semibold">{signal.title}</span>
        {signal.urgent ? (
          <span className="shrink-0 rounded-full bg-destructive/10 px-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-destructive">
            Urgent
          </span>
        ) : null}
      </div>
      <p className="truncate text-sm leading-5 text-muted-foreground">
        {getHorseSignalDetail(signal)}
      </p>
    </div>
  )
}

function HorseReminderRow({ reminder }: { reminder: HorseReminder }) {
  return (
    <div
      className={dashboardItemCardClassName({
        chrome: 'soft',
        className: 'grid gap-2',
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{reminder.title}</span>
        <Badge variant={reminder.overdue ? 'destructive' : 'outline'}>
          {careReminderCategoryLabels[reminder.category]}
        </Badge>
      </div>
      <p className="text-sm leading-5 text-muted-foreground">
        Due {formatEventDate(reminder.dueDate)}
      </p>
      {reminder.priority ? (
        <p className="text-sm leading-5">
          {careReminderPriorityLabels[reminder.priority]} priority
        </p>
      ) : null}
    </div>
  )
}

function HorseEventRow({
  event,
  stableId,
  tone = 'upcoming',
}: {
  event: HorseEvent
  stableId: DashboardLabData['stable']['_id']
  tone?: 'upcoming' | 'documentation'
}) {
  const status = event.status ?? 'planned'

  return (
    <Link
      to="/stables/$stableId/events/$eventId"
      params={{ stableId, eventId: event._id }}
      className={dashboardItemCardClassName({
        chrome: 'soft',
        className: 'grid gap-2 transition-colors hover:bg-background/80',
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{event.title}</span>
        <Badge variant={tone === 'documentation' ? 'destructive' : 'outline'}>
          {eventTypeLabels[event.type]}
        </Badge>
      </div>
      <p className="text-sm leading-5 text-muted-foreground">
        {formatEventDateRange(event.date, event.endDate)} at {event.time}
      </p>
      <p className="text-sm leading-5">{eventStatusLabels[status]}</p>
    </Link>
  )
}

function HorseCadenceRow({ item }: { item: LabHorseCareCadence }) {
  return (
    <div
      className={dashboardItemCardClassName({
        chrome: 'soft',
        className: 'grid gap-2',
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{eventTypeLabels[item.type]}</span>
        <Badge variant={item.overdue ? 'destructive' : 'outline'}>
          Every {item.expectedDays} days
        </Badge>
      </div>
      {item.daysSinceLast !== undefined ? (
        <p className="text-sm leading-5 text-muted-foreground">
          Last completed {item.daysSinceLast} days ago.
        </p>
      ) : null}
      {item.daysUntilNext !== undefined ? (
        <p className="text-sm leading-5">
          Next planned in {item.daysUntilNext} days.
        </p>
      ) : null}
    </div>
  )
}

function HorseOutcomeGapRow({
  outcome,
  stableId,
}: {
  outcome: LabHorseOutcomeGap
  stableId: DashboardLabData['stable']['_id']
}) {
  return (
    <Link
      to="/stables/$stableId/events/$eventId"
      params={{ stableId, eventId: outcome.eventId }}
      className={dashboardItemCardClassName({
        chrome: 'soft',
        className: 'grid gap-2 transition-colors hover:bg-background/80',
      })}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">{outcome.eventTitle}</span>
        <Badge variant="destructive">Outcome note</Badge>
      </div>
      <p className="text-sm leading-5 text-muted-foreground">
        {formatEventDate(outcome.eventDate)}
      </p>
    </Link>
  )
}

function getHorseSignalDetail(signal: LabTimelineSignal) {
  return [
    timelineSignalKindLabels[signal.kind],
    formatEventDate(signal.date),
    signal.detail,
  ]
    .filter((detail): detail is string => Boolean(detail))
    .join(' · ')
}

function formatTimestampDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp))
}

function formatSignedNumber(value: number) {
  const rounded = Math.round(value * 10) / 10

  return rounded > 0 ? `+${rounded}` : `${rounded}`
}

function formatCount(count: number, singular: string) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`
}
