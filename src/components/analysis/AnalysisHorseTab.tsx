import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { DashboardMetric } from '#/components/dashboard/DashboardMetric'
import { DashboardValueBadge } from '#/components/dashboard/DashboardBadges'
import {
  DashboardItemCard,
  DashboardItemBodyText,
  DashboardItemLinkCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardSubsection } from '#/components/dashboard/DashboardSectionCard'
import {
  DetailKeyValueList,
  DetailKeyValueRow,
} from '#/components/dashboard/DetailBlocks'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { formatEventDate } from '#/components/events/eventDisplay'
import { EventRow } from '#/components/events/EventRow'
import { CareReminderPriorityBadge } from '#/components/reminders/CareReminderBadges'
import { Badge } from '#/components/ui/badge'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { formatMediumTimestampDate } from '#/lib/dateDisplay'
import { formatCountLabel } from '#/lib/numberDisplay'
import { formatMetaText } from '#/lib/textDisplay'
import { cn } from '#/lib/utils'
import type { ComponentProps, ReactNode } from 'react'
import { eventTypeLabels } from 'shared/events/eventSchema'
import { careReminderCategoryLabels } from 'shared/reminders/careReminderSchema'
import type { LabTimelineSignal } from './analysisCentreData'
import type {
  LabHorseCareCadence,
  LabHorseDeepDive,
  LabHorseNutritionSignal,
  LabHorseOutcomeGap,
  LabHorseWeightTrend,
} from './analysisHorseData'
import {
  timelineSignalKindAccentColors,
  timelineSignalKindLabels,
} from './analysisTimelineSignalMeta'

type LabHorse = DashboardLabData['horses'][number]
type HorseEvent = LabHorseDeepDive['upcomingEvents'][number]
type HorseReminder = LabHorseDeepDive['dueReminders'][number]
type HorseMetricTone = 'default' | 'urgent' | 'steady'

export function AnalysisHorseTab({
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
        span="xl3"
      />
      <HorseHealthMedicationPanel analysis={analysis} span="xl2" />
      <HorseProgressPanel analysis={analysis} />
      <HorseNutritionPanel analysis={analysis} />
      <HorseCarePlanPanel analysis={analysis} stableId={stableId} span="xl2" />
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
  span,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  span?: ComponentProps<typeof DashboardSection>['span']
}) {
  return (
    <DashboardSection
      chrome="cards"
      className={cn('min-w-0 gap-5', className)}
      span={span}
      title={title}
      description={description}
      actions={action}
      headerClassName="gap-3"
      descriptionWidth="narrow"
      size="panel"
    >
      <div className="min-w-0">{children}</div>
    </DashboardSection>
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
  span,
}: {
  horse: LabHorse
  analysis: LabHorseDeepDive
  className?: string
  span?: ComponentProps<typeof DashboardSection>['span']
}) {
  const latestSignal = analysis.recentSignals[0]
  const metrics = [
    {
      label: 'Active health',
      value: `${analysis.summary.activeIssueCount}`,
      detail:
        analysis.summary.highIssueCount > 0
          ? formatCountLabel(
              analysis.summary.highIssueCount,
              'high-severity issue',
            )
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
      action={
        <Badge variant="outline">
          {formatCountLabel(analysis.summary.signalCount, 'record')}
        </Badge>
      }
      className={className}
      span={span}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <HorseMetricCard key={metric.label} metric={metric} />
          ))}
        </div>

        <DashboardItemCard chrome="soft" className="grid content-start gap-2">
          <DashboardInlineHeader
            title="Latest signal"
            aside={
              latestSignal ? (
                <Badge
                  variant={latestSignal.urgent ? 'destructive' : 'secondary'}
                >
                  {timelineSignalKindLabels[latestSignal.kind]}
                </Badge>
              ) : null
            }
            titleWeight="semibold"
          />
          {latestSignal ? (
            <HorseSignalRow signal={latestSignal} compact />
          ) : (
            <DashboardEmptyState chrome="soft">
              No horse-specific health, medication, nutrition, weight, or
              reminder records yet.
            </DashboardEmptyState>
          )}
        </DashboardItemCard>
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
    <DashboardMetric
      chrome="soft"
      title={metric.label}
      value={metric.value}
      className={cn(
        metric.tone === 'urgent' && 'border-destructive/35 bg-destructive/5',
      )}
      valueClassName={cn(metric.tone === 'urgent' && 'text-destructive')}
    >
      {metric.detail}
    </DashboardMetric>
  )
}

function HorseHealthMedicationPanel({
  analysis,
  className,
  span,
}: {
  analysis: LabHorseDeepDive
  className?: string
  span?: ComponentProps<typeof DashboardSection>['span']
}) {
  const recordCount =
    analysis.healthSignals.length + analysis.medicationSignals.length

  return (
    <HorseAnalysisPanel
      title="Health & medication"
      description="Recent horse-specific health records and medication starts, separated from stable-wide workload views."
      action={
        <Badge variant="outline">
          {formatCountLabel(recordCount, 'record')}
        </Badge>
      }
      className={className}
      span={span}
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
    <DashboardItemCard chrome="soft" className="grid content-start gap-3">
      <DashboardInlineHeader
        title="Health overview"
        aside={
          <Badge
            variant={
              analysis.summary.activeIssueCount > 0
                ? 'destructive'
                : 'secondary'
            }
          >
            {formatCountLabel(
              analysis.summary.activeIssueCount,
              'active issue',
            )}
          </Badge>
        }
        titleWeight="semibold"
      />
      {frequency ? (
        <DetailKeyValueList>
          <DetailKeyValueRow
            label="Total records"
            value={frequency.totalCount}
          />
          <DetailKeyValueRow label="Resolved" value={frequency.resolvedCount} />
          {frequency.latestIssueTitle ? (
            <p className="pt-2 text-foreground">
              Latest: {frequency.latestIssueTitle}
            </p>
          ) : null}
          {frequency.latestNotedAt ? (
            <p>Noted {formatMediumTimestampDate(frequency.latestNotedAt)}</p>
          ) : null}
        </DetailKeyValueList>
      ) : (
        <DashboardEmptyState chrome="soft">
          No health issue frequency data for this horse yet.
        </DashboardEmptyState>
      )}
    </DashboardItemCard>
  )
}

function HorseProgressPanel({ analysis }: { analysis: LabHorseDeepDive }) {
  const hasRecords =
    Boolean(analysis.weightTrend) || analysis.weightSignals.length > 0

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
        <DashboardEmptyState chrome="soft">
          No weight or body condition records for this horse yet.
        </DashboardEmptyState>
      ) : (
        <DashboardLayoutStack gap="compact">
          {analysis.weightTrend ? (
            <HorseWeightTrendCard trend={analysis.weightTrend} />
          ) : null}
          <HorseSignalGroup
            title="Recent weight records"
            signals={analysis.weightSignals}
            emptyLabel="No recent weight records in the timeline."
          />
        </DashboardLayoutStack>
      )}
    </HorseAnalysisPanel>
  )
}

function HorseWeightTrendCard({ trend }: { trend: LabHorseWeightTrend }) {
  return (
    <DashboardItemCard chrome="soft" className="grid gap-3">
      <DashboardInlineHeader
        title="Latest recording"
        aside={
          <Badge variant="secondary">
            {trend.latestWeight} {trend.unit}
          </Badge>
        }
        titleWeight="semibold"
      />
      <DashboardItemBodyText tone="muted">
        Measured {formatMediumTimestampDate(trend.measuredAt)}
      </DashboardItemBodyText>
      {trend.weightChange !== undefined ? (
        <DashboardItemBodyText>
          Weight change: {formatSignedNumber(trend.weightChange)} {trend.unit}
        </DashboardItemBodyText>
      ) : null}
      {trend.latestBodyConditionScore !== undefined ? (
        <DashboardItemBodyText tone="muted">
          Body condition {trend.latestBodyConditionScore}
          {trend.bodyConditionChange !== undefined
            ? ` (${formatSignedNumber(trend.bodyConditionChange)})`
            : ''}
        </DashboardItemBodyText>
      ) : null}
    </DashboardItemCard>
  )
}

function HorseNutritionPanel({ analysis }: { analysis: LabHorseDeepDive }) {
  const signalCount =
    analysis.nutritionSignals.length + analysis.nutritionTimelineSignals.length

  return (
    <HorseAnalysisPanel
      title="Nutrition signals"
      description="Nutrition changes linked to this horse's weight or health records."
      action={
        <Badge variant="outline">
          {formatCountLabel(signalCount, 'signal')}
        </Badge>
      }
    >
      {signalCount === 0 ? (
        <DashboardEmptyState chrome="soft">
          No nutrition changes near this horse's health or weight records yet.
        </DashboardEmptyState>
      ) : (
        <DashboardLayoutStack gap="compact">
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
        </DashboardLayoutStack>
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
    <DashboardItemCard chrome="soft" className="grid gap-2">
      <DashboardInlineHeader
        title={signal.summary}
        aside={
          <Badge variant="outline">
            {formatMediumTimestampDate(signal.changedAt)}
          </Badge>
        }
        titleWeight="semibold"
      />
      <DashboardItemBodyText tone="muted">
        {formatCountLabel(signal.nearbyWeightCount, 'nearby weight record')} ·{' '}
        {formatCountLabel(signal.nearbyHealthIssueCount, 'nearby health issue')}
      </DashboardItemBodyText>
    </DashboardItemCard>
  )
}

function HorseCarePlanPanel({
  analysis,
  stableId,
  className,
  span,
}: {
  analysis: LabHorseDeepDive
  stableId: DashboardLabData['stable']['_id']
  className?: string
  span?: ComponentProps<typeof DashboardSection>['span']
}) {
  const itemCount =
    analysis.dueReminders.length +
    analysis.upcomingEvents.length +
    analysis.careCadence.length

  return (
    <HorseAnalysisPanel
      title="Care plan"
      description="Horse-specific reminders, upcoming appointments, and cadence checks."
      action={
        <DashboardValueBadge>
          {formatCountLabel(itemCount, 'item')}
        </DashboardValueBadge>
      }
      className={className}
      span={span}
    >
      {itemCount === 0 ? (
        <DashboardEmptyState chrome="soft">
          No due reminders, upcoming events, or cadence checks for this horse.
        </DashboardEmptyState>
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

function HorseReminderGroup({
  reminders,
}: {
  reminders: Array<HorseReminder>
}) {
  return (
    <DashboardSubsection
      title="Due reminders"
      titleWeight="semibold"
      className="content-start"
    >
      {reminders.length === 0 ? (
        <DashboardEmptyState chrome="soft">
          No due reminders.
        </DashboardEmptyState>
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
    </DashboardSubsection>
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
    <DashboardSubsection
      title="Upcoming events"
      titleWeight="semibold"
      className="content-start"
    >
      {events.length === 0 ? (
        <DashboardEmptyState chrome="soft">
          No upcoming events.
        </DashboardEmptyState>
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
    </DashboardSubsection>
  )
}

function HorseCadenceGroup({ items }: { items: Array<LabHorseCareCadence> }) {
  return (
    <DashboardSubsection
      title="Care cadence"
      titleWeight="semibold"
      className="content-start"
    >
      {items.length === 0 ? (
        <DashboardEmptyState chrome="soft">
          No cadence data yet.
        </DashboardEmptyState>
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
    </DashboardSubsection>
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
    analysis.completionNotesNeeded.length +
    analysis.horseOutcomeNotesNeeded.length

  return (
    <HorseAnalysisPanel
      title="Documentation gaps"
      description="Completed care for this horse that still needs notes."
      action={
        <Badge variant={gapCount > 0 ? 'destructive' : 'secondary'}>
          {formatCountLabel(gapCount, 'gap')}
        </Badge>
      }
    >
      {gapCount === 0 ? (
        <DashboardEmptyState chrome="soft">
          No missing completion notes for this horse.
        </DashboardEmptyState>
      ) : (
        <DashboardLayoutStack gap="compact">
          <HorseDocumentationEventGroup
            events={analysis.completionNotesNeeded}
            stableId={stableId}
          />
          <HorseOutcomeGapGroup
            outcomes={analysis.horseOutcomeNotesNeeded}
            stableId={stableId}
          />
        </DashboardLayoutStack>
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
    <DashboardSubsection title="Event notes" titleWeight="semibold">
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
    </DashboardSubsection>
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
    <DashboardSubsection title="Horse outcome notes" titleWeight="semibold">
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
    </DashboardSubsection>
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
    <DashboardSubsection
      title={title}
      titleWeight="semibold"
      className="content-start"
    >
      {signals.length === 0 ? (
        <DashboardEmptyState chrome="soft">{emptyLabel}</DashboardEmptyState>
      ) : (
        <HorseAnalysisList
          itemCount={signals.length}
          visibleItemLimit={4}
          estimatedItemHeightRem={5.5}
        >
          {signals.map((signal) => (
            <HorseSignalRow
              key={`${signal.kind}:${signal.id}`}
              signal={signal}
            />
          ))}
        </HorseAnalysisList>
      )}
    </DashboardSubsection>
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
    <DashboardItemCard
      chrome="soft"
      density={compact ? 'compact' : undefined}
      className="grid gap-2"
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            backgroundColor: timelineSignalKindAccentColors[signal.kind],
          }}
        />
        <span className="truncate font-semibold">{signal.title}</span>
        {signal.urgent ? <Badge variant="destructive">Urgent</Badge> : null}
      </div>
      <DashboardItemBodyText tone="muted" className="truncate">
        {getHorseSignalDetail(signal)}
      </DashboardItemBodyText>
    </DashboardItemCard>
  )
}

function HorseReminderRow({ reminder }: { reminder: HorseReminder }) {
  return (
    <DashboardItemCard chrome="soft" className="grid gap-2">
      <DashboardInlineHeader title={reminder.title} titleWeight="semibold" />
      <DashboardItemBodyText tone="muted">
        Due {formatEventDate(reminder.dueDate)} ·{' '}
        {careReminderCategoryLabels[reminder.category]}
      </DashboardItemBodyText>
      {reminder.priority === 'high' ? (
        <CareReminderPriorityBadge priority={reminder.priority} />
      ) : null}
    </DashboardItemCard>
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
  return (
    <EventRow
      event={event}
      stableId={stableId}
      chrome="soft"
      supplementalBadges={
        tone === 'documentation' ? (
          <Badge variant="destructive">Notes needed</Badge>
        ) : undefined
      }
      variant="summary"
    />
  )
}

function HorseCadenceRow({ item }: { item: LabHorseCareCadence }) {
  return (
    <DashboardItemCard chrome="soft" className="grid gap-2">
      <DashboardInlineHeader
        title={eventTypeLabels[item.type]}
        aside={
          item.overdue ? (
            <Badge variant="destructive">Overdue</Badge>
          ) : undefined
        }
        titleWeight="semibold"
      />
      <DashboardItemBodyText tone="muted">
        Expected every {item.expectedDays} days.
      </DashboardItemBodyText>
      {item.daysSinceLast !== undefined ? (
        <DashboardItemBodyText tone="muted">
          Last completed {item.daysSinceLast} days ago.
        </DashboardItemBodyText>
      ) : null}
      {item.daysUntilNext !== undefined ? (
        <DashboardItemBodyText>
          Next planned in {item.daysUntilNext} days.
        </DashboardItemBodyText>
      ) : null}
    </DashboardItemCard>
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
    <DashboardItemLinkCard
      to="/stables/$stableId/events/$eventId"
      params={{ stableId, eventId: outcome.eventId }}
      chrome="soft"
      className="grid gap-2"
    >
      <DashboardInlineHeader
        title={outcome.eventTitle}
        aside={<Badge variant="destructive">Outcome note</Badge>}
        titleWeight="semibold"
      />
      <DashboardItemBodyText tone="muted">
        {formatEventDate(outcome.eventDate)}
      </DashboardItemBodyText>
    </DashboardItemLinkCard>
  )
}

function getHorseSignalDetail(signal: LabTimelineSignal) {
  return formatMetaText([
    timelineSignalKindLabels[signal.kind],
    formatEventDate(signal.date),
    signal.detail,
  ])
}

function formatSignedNumber(value: number) {
  const rounded = Math.round(value * 10) / 10

  return rounded > 0 ? `+${rounded}` : `${rounded}`
}
