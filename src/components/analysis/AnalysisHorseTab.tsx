import { useT, useLocale } from '#/i18n/LocaleProvider'
import type { Locale } from 'shared/i18n/locale'
import { localeInstances } from '#/i18n/resources'
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
import { formatDecimal } from '#/lib/numberDisplay'
import { formatMetaText } from '#/lib/textDisplay'
import { cn } from '#/lib/utils'
import type { ComponentProps, ReactNode } from 'react'
import type { LabTimelineSignal } from './analysisCentreData'
import type {
  LabHorseCareCadence,
  LabHorseDeepDive,
  LabHorseNutritionSignal,
  LabHorseOutcomeGap,
  LabHorseWeightTrend,
} from './analysisHorseData'
import { timelineSignalKindAccentColors } from './analysisTimelineSignalMeta'

type LabHorse = DashboardLabData['horses'][number]
type HorseEvent = LabHorseDeepDive['upcomingEvents'][number]
type HorseReminder = LabHorseDeepDive['dueReminders'][number]
type HorseMetricTone = 'default' | 'urgent' | 'steady'

export function AnalysisHorseTab({
  horse,
  stableId,
  analysis,
  comparison,
}: {
  comparison?: ReactNode
  horse: LabHorse
  stableId: DashboardLabData['stable']['_id']
  analysis: LabHorseDeepDive
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-3 xl:items-start">
      {comparison}
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
  ariaLabel,
  children,
  itemCount,
  visibleItemLimit,
  estimatedItemHeightRem,
  className,
}: {
  ariaLabel: string
  children: ReactNode
  itemCount: number
  visibleItemLimit: number
  estimatedItemHeightRem?: number
  className?: string
}) {
  return (
    <ScrollableList
      ariaLabel={ariaLabel}
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
  const t = useT()

  const latestSignal = analysis.recentSignals[0]
  const metrics = [
    {
      label: t('analysisViews.activeHealth'),
      value: `${analysis.summary.activeIssueCount}`,
      detail:
        analysis.summary.highIssueCount > 0
          ? t('analysisViews.highIssueCount', {
              count: analysis.summary.highIssueCount,
            })
          : t('analysisViews.noHighHealth'),
      tone: analysis.summary.highIssueCount > 0 ? 'urgent' : 'steady',
    },
    {
      label: t('analysisViews.medication'),
      value: `${analysis.summary.activeMedicationCount}`,
      detail: t('analysisViews.activeMedication'),
      tone: analysis.summary.activeMedicationCount > 0 ? 'urgent' : 'default',
    },
    {
      label: t('analysisViews.reminders'),
      value: `${analysis.summary.overdueReminderCount}`,
      detail: t('analysisViews.overdueHorseReminders'),
      tone: analysis.summary.overdueReminderCount > 0 ? 'urgent' : 'steady',
    },
    {
      label: t('analysisViews.upcomingCare'),
      value: `${analysis.summary.upcomingEventCount}`,
      detail: t('analysisViews.plannedMonth'),
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
      description={t('analysisViews.horseHelp')}
      action={
        <Badge variant="outline">
          {t('analysisViews.recordCount', {
            count: analysis.summary.signalCount,
          })}
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

        <DashboardItemCard chrome="flat" className="grid content-start gap-2">
          <DashboardInlineHeader
            title={t('analysisViews.latestSignal')}
            aside={
              latestSignal ? (
                <Badge
                  variant={latestSignal.urgent ? 'destructive' : 'secondary'}
                >
                  {t(`analysisViews.${latestSignal.kind}`)}
                </Badge>
              ) : null
            }
            titleWeight="semibold"
          />
          {latestSignal ? (
            <HorseSignalRow signal={latestSignal} compact />
          ) : (
            <DashboardEmptyState chrome="soft">
              {t('analysisViews.noHorseRecords')}
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
  const t = useT()

  const recordCount =
    analysis.healthSignals.length + analysis.medicationSignals.length

  return (
    <HorseAnalysisPanel
      title={t('analysisViews.healthMedication')}
      description={t('analysisViews.healthMedicationHelp')}
      action={
        <Badge variant="outline">
          {t('analysisViews.recordCount', { count: recordCount })}
        </Badge>
      }
      className={className}
      span={span}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
        <HorseHealthOverview analysis={analysis} />
        <div className="grid gap-4 lg:grid-cols-2">
          <HorseSignalGroup
            title={t('analysisViews.healthRecords')}
            signals={analysis.healthSignals}
            emptyLabel={t('analysisViews.noHealth')}
          />
          <HorseSignalGroup
            title={t('analysisViews.medicationRecords')}
            signals={analysis.medicationSignals}
            emptyLabel={t('analysisViews.noMedication')}
          />
        </div>
      </div>
    </HorseAnalysisPanel>
  )
}

function HorseHealthOverview({ analysis }: { analysis: LabHorseDeepDive }) {
  const t = useT()
  const { locale } = useLocale()

  const frequency = analysis.healthFrequency

  return (
    <DashboardItemCard chrome="flat" className="grid content-start gap-3">
      <DashboardInlineHeader
        title={t('analysisViews.healthOverview')}
        aside={
          <Badge
            variant={
              analysis.summary.activeIssueCount > 0
                ? 'destructive'
                : 'secondary'
            }
          >
            {t('analysisViews.activeIssueCount', {
              count: analysis.summary.activeIssueCount,
            })}
          </Badge>
        }
        titleWeight="semibold"
      />
      {frequency ? (
        <DetailKeyValueList>
          <DetailKeyValueRow
            label={t('analysisViews.totalRecords')}
            value={frequency.totalCount}
          />
          <DetailKeyValueRow
            label={t('analysisViews.resolved')}
            value={frequency.resolvedCount}
          />
          {frequency.latestIssueTitle ? (
            <p className="pt-2 text-foreground">
              {t('analysisViews.latest', { title: frequency.latestIssueTitle })}
            </p>
          ) : null}
          {frequency.latestNotedAt ? (
            <p>
              {t('analysisViews.noted', {
                date: formatMediumTimestampDate(
                  frequency.latestNotedAt,
                  locale,
                ),
              })}
            </p>
          ) : null}
        </DetailKeyValueList>
      ) : (
        <DashboardEmptyState chrome="soft">
          {t('analysisViews.noHealthFrequency')}
        </DashboardEmptyState>
      )}
    </DashboardItemCard>
  )
}

function HorseProgressPanel({ analysis }: { analysis: LabHorseDeepDive }) {
  const t = useT()
  const { locale } = useLocale()

  const hasRecords =
    Boolean(analysis.weightTrend) || analysis.weightSignals.length > 0

  return (
    <HorseAnalysisPanel
      title={t('analysisViews.weightCondition')}
      description={t('analysisViews.weightHelp')}
      action={
        analysis.weightTrend ? (
          <Badge variant="outline">
            {formatDecimal(analysis.weightTrend.latestWeight, locale)}{' '}
            {analysis.weightTrend.unit}
          </Badge>
        ) : undefined
      }
    >
      {!hasRecords ? (
        <DashboardEmptyState chrome="soft">
          {t('analysisViews.noWeight')}
        </DashboardEmptyState>
      ) : (
        <DashboardLayoutStack gap="compact">
          {analysis.weightTrend ? (
            <HorseWeightTrendCard trend={analysis.weightTrend} />
          ) : null}
          <HorseSignalGroup
            title={t('analysisViews.recentWeight')}
            signals={analysis.weightSignals}
            emptyLabel={t('analysisViews.noRecentWeight')}
          />
        </DashboardLayoutStack>
      )}
    </HorseAnalysisPanel>
  )
}

function HorseWeightTrendCard({ trend }: { trend: LabHorseWeightTrend }) {
  const t = useT()
  const { locale } = useLocale()

  return (
    <DashboardItemCard chrome="flat" className="grid gap-3">
      <DashboardInlineHeader
        title={t('analysisViews.latestRecording')}
        aside={
          <Badge variant="secondary">
            {formatDecimal(trend.latestWeight, locale)} {trend.unit}
          </Badge>
        }
        titleWeight="semibold"
      />
      <DashboardItemBodyText tone="muted">
        {t('analysisViews.measured', {
          date: formatMediumTimestampDate(trend.measuredAt, locale),
        })}
      </DashboardItemBodyText>
      {trend.weightChange !== undefined ? (
        <DashboardItemBodyText>
          {t('analysisViews.weightChange', {
            amount: formatSignedNumber(trend.weightChange, locale),
            unit: trend.unit,
          })}
        </DashboardItemBodyText>
      ) : null}
      {trend.latestBodyConditionScore !== undefined ? (
        <DashboardItemBodyText tone="muted">
          {t('analysisViews.bodyCondition', {
            score: formatDecimal(trend.latestBodyConditionScore, locale),
            change:
              trend.bodyConditionChange !== undefined
                ? ` (${formatSignedNumber(trend.bodyConditionChange, locale)})`
                : '',
          })}
        </DashboardItemBodyText>
      ) : null}
    </DashboardItemCard>
  )
}

function HorseNutritionPanel({ analysis }: { analysis: LabHorseDeepDive }) {
  const t = useT()

  const signalCount =
    analysis.nutritionSignals.length + analysis.nutritionTimelineSignals.length

  return (
    <HorseAnalysisPanel
      title={t('analysisViews.nutritionSignals')}
      description={t('analysisViews.nutritionHelp')}
      action={
        <Badge variant="outline">
          {t('analysisViews.signalCount', { count: signalCount })}
        </Badge>
      }
    >
      {signalCount === 0 ? (
        <DashboardEmptyState chrome="soft">
          {t('analysisViews.noNutrition')}
        </DashboardEmptyState>
      ) : (
        <DashboardLayoutStack gap="compact">
          {analysis.nutritionSignals.length > 0 ? (
            <HorseAnalysisList
              ariaLabel={t('analysisViews.nutritionCorrelations')}
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
            title={t('analysisViews.recentNutrition')}
            signals={analysis.nutritionTimelineSignals}
            emptyLabel={t('analysisViews.noRecentNutrition')}
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
  const t = useT()
  const { locale } = useLocale()

  return (
    <DashboardItemCard chrome="flat" className="grid gap-2">
      <DashboardInlineHeader
        title={signal.summary}
        aside={
          <Badge variant="outline">
            {formatMediumTimestampDate(signal.changedAt, locale)}
          </Badge>
        }
        titleWeight="semibold"
      />
      <DashboardItemBodyText tone="muted">
        {t('analysisViews.nearbyWeightCount', {
          count: signal.nearbyWeightCount,
        })}{' '}
        ·{' '}
        {t('analysisViews.nearbyHealthCount', {
          count: signal.nearbyHealthIssueCount,
        })}
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
  const t = useT()

  const itemCount =
    analysis.dueReminders.length +
    analysis.upcomingEvents.length +
    analysis.careCadence.length

  return (
    <HorseAnalysisPanel
      title={t('analysisViews.carePlan')}
      description={t('analysisViews.carePlanHelp')}
      action={
        <DashboardValueBadge>
          {t('analysisViews.itemCount', { count: itemCount })}
        </DashboardValueBadge>
      }
      className={className}
      span={span}
    >
      {itemCount === 0 ? (
        <DashboardEmptyState chrome="soft">
          {t('analysisViews.noCarePlan')}
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
  const t = useT()

  return (
    <DashboardSubsection
      title={t('analysisViews.dueReminders')}
      titleWeight="semibold"
      className="content-start"
    >
      {reminders.length === 0 ? (
        <DashboardEmptyState chrome="soft">
          {t('analysisViews.noDueReminders')}
        </DashboardEmptyState>
      ) : (
        <HorseAnalysisList
          ariaLabel={t('analysisViews.dueHorseReminders')}
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
  const t = useT()

  return (
    <DashboardSubsection
      title={t('analysisViews.upcomingEvents')}
      titleWeight="semibold"
      className="content-start"
    >
      {events.length === 0 ? (
        <DashboardEmptyState chrome="soft">
          {t('analysisViews.noUpcoming')}
        </DashboardEmptyState>
      ) : (
        <HorseAnalysisList
          ariaLabel={t('analysisViews.upcomingHorseEvents')}
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
  const t = useT()

  return (
    <DashboardSubsection
      title={t('analysisViews.careCadence')}
      titleWeight="semibold"
      className="content-start"
    >
      {items.length === 0 ? (
        <DashboardEmptyState chrome="soft">
          {t('analysisViews.noCadence')}
        </DashboardEmptyState>
      ) : (
        <HorseAnalysisList
          ariaLabel={t('analysisViews.horseCadence')}
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
  const t = useT()

  const gapCount =
    analysis.completionNotesNeeded.length +
    analysis.horseOutcomeNotesNeeded.length

  return (
    <HorseAnalysisPanel
      title={t('analysisViews.documentationGaps')}
      description={t('analysisViews.documentationHelp')}
      action={
        <Badge variant={gapCount > 0 ? 'destructive' : 'secondary'}>
          {t('analysisViews.gapCount', { count: gapCount })}
        </Badge>
      }
    >
      {gapCount === 0 ? (
        <DashboardEmptyState chrome="soft">
          {t('analysisViews.noMissingNotes')}
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
  const t = useT()

  if (events.length === 0) return null

  return (
    <DashboardSubsection
      title={t('analysisViews.eventNotes')}
      titleWeight="semibold"
    >
      <HorseAnalysisList
        ariaLabel={t('analysisViews.eventsMissingNotes')}
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
  const t = useT()

  if (outcomes.length === 0) return null

  return (
    <DashboardSubsection
      title={t('analysisViews.horseOutcomeNotes')}
      titleWeight="semibold"
    >
      <HorseAnalysisList
        ariaLabel={t('analysisViews.horseOutcomeNotes')}
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
          ariaLabel={title}
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
  const t = useT()
  const { locale } = useLocale()

  return (
    <DashboardItemCard
      chrome="flat"
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
        <span className="min-w-0 break-words font-semibold">
          {signal.title}
        </span>
        {signal.urgent ? (
          <Badge variant="destructive">{t('analysisViews.urgent')}</Badge>
        ) : null}
      </div>
      <DashboardItemBodyText tone="muted" className="break-words">
        {getHorseSignalDetail(signal, locale)}
      </DashboardItemBodyText>
    </DashboardItemCard>
  )
}

function HorseReminderRow({ reminder }: { reminder: HorseReminder }) {
  const t = useT()
  const { locale } = useLocale()

  return (
    <DashboardItemCard chrome="flat" className="grid gap-2">
      <DashboardInlineHeader title={reminder.title} titleWeight="semibold" />
      <DashboardItemBodyText tone="muted">
        {t('analysisViews.due', {
          date: formatEventDate(reminder.dueDate, locale),
        })}{' '}
        · {t(`careLabels.category.${reminder.category}`)}
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
  const t = useT()

  return (
    <EventRow
      event={event}
      stableId={stableId}
      chrome="soft"
      supplementalBadges={
        tone === 'documentation' ? (
          <Badge variant="destructive">{t('analysisViews.notesNeeded')}</Badge>
        ) : undefined
      }
      variant="summary"
    />
  )
}

function HorseCadenceRow({ item }: { item: LabHorseCareCadence }) {
  const t = useT()

  return (
    <DashboardItemCard chrome="flat" className="grid gap-2">
      <DashboardInlineHeader
        title={t(`events.types.${item.type}`)}
        aside={
          item.overdue ? (
            <Badge variant="destructive">{t('analysisViews.overdue')}</Badge>
          ) : undefined
        }
        titleWeight="semibold"
      />
      <DashboardItemBodyText tone="muted">
        {t('analysisViews.expectedEvery', { count: item.expectedDays })}
      </DashboardItemBodyText>
      {item.daysSinceLast !== undefined ? (
        <DashboardItemBodyText tone="muted">
          {t('analysisViews.completedAgo', { count: item.daysSinceLast })}
        </DashboardItemBodyText>
      ) : null}
      {item.daysUntilNext !== undefined ? (
        <DashboardItemBodyText>
          {t('analysisViews.plannedIn', { count: item.daysUntilNext })}
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
  const t = useT()
  const { locale } = useLocale()

  return (
    <DashboardItemLinkCard
      to="/stables/$stableId/events/$eventId"
      params={{ stableId, eventId: outcome.eventId }}
      chrome="soft"
      className="grid gap-2"
    >
      <DashboardInlineHeader
        title={outcome.eventTitle}
        aside={
          <Badge variant="destructive">{t('analysisViews.outcomeNote')}</Badge>
        }
        titleWeight="semibold"
      />
      <DashboardItemBodyText tone="muted">
        {formatEventDate(outcome.eventDate, locale)}
      </DashboardItemBodyText>
    </DashboardItemLinkCard>
  )
}

function getHorseSignalDetail(signal: LabTimelineSignal, locale: Locale) {
  const t = localeInstances[locale].t
  return formatMetaText([
    t(`analysisViews.${signal.kind}`),
    formatEventDate(signal.date, locale),
    signal.detail,
  ])
}

function formatSignedNumber(value: number, locale: Locale) {
  const rounded = Math.round(value * 10) / 10

  return rounded > 0
    ? `+${formatDecimal(rounded, locale)}`
    : formatDecimal(rounded, locale)
}
