import { useMemo } from 'react'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { formatEventDateTime } from '#/components/events/eventDisplay'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  DetailListBlock,
  DetailListGrid,
  DetailTextBlock,
} from '#/components/dashboard/DetailBlocks'
import {
  DashboardItemBodyText,
  DashboardItemList,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  EventKindBadge,
  EventStatusBadge,
} from '#/components/events/EventBadges'
import { ActivityTimelineListEntry } from '#/components/timeline/ActivityTimeline'
import { TrainingStatusBadge } from '#/components/training/TrainingBadges'
import {
  formatMediumDateKey,
  formatMediumTimestampDate,
} from '#/lib/dateDisplay'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import {
  HealthIssueKindBadge,
  HealthIssueSeverityBadge,
  HealthIssueStatusBadge,
  MedicationRecordKindBadge,
  MedicationRecordStatusBadge,
  NutritionLogKindBadge,
  WeightRecordKindBadge,
} from './HorseCareBadges'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { ListFilterControls } from '#/components/list-filtering/ListFilterControls'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { formatCurrencyAmount, formatDecimal } from '#/lib/numberDisplay'
import { createHorseTimelineFilterConfig } from './horseTimelineFilters'

export type HorseTimeline = FunctionReturnType<
  typeof api.horseTimeline.listForHorse
>
export type TimelineEntry = HorseTimeline['entries'][number]

type HorseTimelinePageProps = {
  stableId: string
  horseId: string
}

export function HorseTimelinePage({ horseId }: HorseTimelinePageProps) {
  const { data: timeline } = useSuspenseQuery(
    convexQuery(api.horseTimeline.listForHorse, {
      horseId: horseId as Id<'horses'>,
    }),
  )

  return <HorseTimelineView key={horseId} timeline={timeline} />
}

export function HorseTimelineView({ timeline }: { timeline: HorseTimeline }) {
  const t = useT()
  const { locale } = useLocale()

  const horseTimelineFilterConfig = useMemo(
    () => createHorseTimelineFilterConfig(locale),
    [locale],
  )
  const filtering = useListFiltering({
    items: timeline.entries,
    config: horseTimelineFilterConfig,
  })
  if (!timeline.horse)
    return (
      <RouteEntityNotFoundAlert
        entity="horse"
        description={t('horseHistory.careHistoryGone')}
      />
    )
  const entries = [...filtering.items].sort(
    (a, b) => b.occurredAt - a.occurredAt,
  )
  return (
    <DashboardSectionCard
      title={t('horseHistory.timeline')}
      description={
        timeline.horse
          ? t('horseHistory.timelineHelp', { name: timeline.horse.name })
          : t('horseHistory.timelineGenericHelp')
      }
      size="panel"
      contentGap="comfortable"
    >
      {timeline.entries.length > 0 && (
        <ListFilterControls
          config={horseTimelineFilterConfig}
          filtering={filtering}
        />
      )}
      {entries.length === 0 ? (
        <DashboardEmptyState
          title={
            filtering.isFiltering
              ? t('horseHistory.noMatches')
              : t('horseHistory.timelineEmpty')
          }
        >
          {filtering.isFiltering
            ? t('horseHistory.clearFilters')
            : t('horseHistory.timelineEmptyHelp')}
        </DashboardEmptyState>
      ) : (
        <DashboardItemList gap="compact">
          {entries.map((entry) => (
            <TimelineEntryCard
              key={`${entry.kind}-${entry.id}`}
              entry={entry}
            />
          ))}
        </DashboardItemList>
      )}
    </DashboardSectionCard>
  )
}

function TimelineEntryCard({ entry }: { entry: TimelineEntry }) {
  if (entry.kind === 'event') {
    return <EventTimelineEntry entry={entry} />
  }

  if (entry.kind === 'healthIssue') {
    return <HealthIssueTimelineEntry entry={entry} />
  }

  if (entry.kind === 'medicationRecord') {
    return <MedicationTimelineEntry entry={entry} />
  }

  if (entry.kind === 'nutritionLog') {
    return <NutritionTimelineEntry entry={entry} />
  }

  return <WeightTimelineEntry entry={entry} />
}

function EventTimelineEntry({
  entry,
}: {
  entry: Extract<TimelineEntry, { kind: 'event' }>
}) {
  const t = useT()
  const { locale } = useLocale()
  const training = 'trainingRecord' in entry ? entry.trainingRecord : undefined

  return (
    <ActivityTimelineListEntry
      accent={entry.status === 'completed' ? 'muted' : 'primary'}
      badges={
        <>
          <EventKindBadge />
          {training ? (
            <TrainingStatusBadge status={training.status} />
          ) : (
            entry.status !== 'planned' && (
              <EventStatusBadge status={entry.status} />
            )
          )}
        </>
      }
      title={entry.title}
      meta={
        <>
          <span>
            {formatEventDateTime(entry.date, entry.time, entry.endDate, locale)}
          </span>
          <span>{t(`events.types.${entry.eventType}`)}</span>
          {entry.providerName && <span>{entry.providerName}</span>}
        </>
      }
      description={training ? training.focus : entry.description}
    >
      {entry.notesAfterCompletion && (
        <DashboardItemBodyText>
          {entry.notesAfterCompletion}
        </DashboardItemBodyText>
      )}
      {entry.requestedServiceNotes && (
        <DetailTextBlock label={t('horseHistory.requested')}>
          {entry.requestedServiceNotes}
        </DetailTextBlock>
      )}
      {training?.nextFocus ? (
        <DetailTextBlock label={t('training.nextFocus')}>
          {training.nextFocus}
        </DetailTextBlock>
      ) : (
        !training &&
        entry.horseCompletionNotes && (
          <DetailTextBlock label={t('horseHistory.outcome')}>
            {entry.horseCompletionNotes}
          </DetailTextBlock>
        )
      )}
      {entry.costShare !== undefined && (
        <DashboardMetaList>
          <span>
            {t('horseHistory.costShare', {
              amount: formatCurrencyAmount(entry.costShare, locale),
            })}
          </span>
        </DashboardMetaList>
      )}
    </ActivityTimelineListEntry>
  )
}

function HealthIssueTimelineEntry({
  entry,
}: {
  entry: Extract<TimelineEntry, { kind: 'healthIssue' }>
}) {
  const t = useT()
  const { locale } = useLocale()

  return (
    <ActivityTimelineListEntry
      accent={
        entry.status === 'resolved'
          ? 'muted'
          : entry.severity === 'high'
            ? 'danger'
            : entry.severity === 'medium'
              ? 'warning'
              : 'primary'
      }
      badges={
        <>
          <HealthIssueKindBadge status={entry.status} />
          {entry.severity === 'high' && (
            <HealthIssueSeverityBadge severity={entry.severity} />
          )}
          {entry.status === 'resolved' && (
            <HealthIssueStatusBadge status={entry.status} />
          )}
        </>
      }
      title={entry.title}
      meta={
        <>
          <span>
            {t('careRecords.notedAt', {
              date: formatMediumTimestampDate(entry.occurredAt, locale),
            })}
          </span>
          {entry.severity && entry.severity !== 'high' && (
            <span>{t(`careLabels.severity.${entry.severity}`)}</span>
          )}
          {entry.resolvedAt && (
            <span>
              {t('careRecords.resolvedAt', {
                date: formatMediumTimestampDate(entry.resolvedAt, locale),
              })}
            </span>
          )}
        </>
      }
      description={entry.description}
    />
  )
}

function WeightTimelineEntry({
  entry,
}: {
  entry: Extract<TimelineEntry, { kind: 'weightRecord' }>
}) {
  const t = useT()
  const { locale } = useLocale()

  return (
    <ActivityTimelineListEntry
      accent="muted"
      badges={<WeightRecordKindBadge />}
      title={`${formatDecimal(entry.weight, locale)} ${entry.unit}`}
      meta={
        <>
          <span>
            {t('careRecords.measuredAt', {
              date: formatMediumTimestampDate(entry.occurredAt, locale),
            })}
          </span>
          {entry.bodyConditionScore !== undefined && (
            <span>BCS {formatDecimal(entry.bodyConditionScore, locale)}/9</span>
          )}
        </>
      }
      description={entry.notes}
    />
  )
}

function MedicationTimelineEntry({
  entry,
}: {
  entry: Extract<TimelineEntry, { kind: 'medicationRecord' }>
}) {
  const t = useT()
  const { locale } = useLocale()

  return (
    <ActivityTimelineListEntry
      accent={entry.status === 'active' ? 'warning' : 'muted'}
      badges={
        <>
          <MedicationRecordKindBadge status={entry.status} />
          {entry.status === 'completed' && (
            <MedicationRecordStatusBadge status={entry.status} />
          )}
        </>
      }
      title={entry.medicationName}
      meta={
        <>
          <span>
            {t('careRecords.startedAt', {
              date: formatMediumDateKey(entry.startDate, locale),
            })}
          </span>
          <span>{entry.dosage}</span>
          {entry.frequency && <span>{entry.frequency}</span>}
          {entry.endDate && (
            <span>
              {t('careRecords.endedAt', {
                date: formatMediumDateKey(entry.endDate, locale),
              })}
            </span>
          )}
          {entry.prescribedBy && <span>{entry.prescribedBy}</span>}
        </>
      }
      description={entry.reason}
    >
      {entry.notes && (
        <DashboardItemBodyText>{entry.notes}</DashboardItemBodyText>
      )}
    </ActivityTimelineListEntry>
  )
}

function NutritionTimelineEntry({
  entry,
}: {
  entry: Extract<TimelineEntry, { kind: 'nutritionLog' }>
}) {
  const t = useT()
  const { locale } = useLocale()

  return (
    <ActivityTimelineListEntry
      accent="primary"
      badges={<NutritionLogKindBadge />}
      title={entry.summary}
      meta={
        <span>
          {t('careRecords.loggedAt', {
            date: formatMediumTimestampDate(entry.occurredAt, locale),
          })}
        </span>
      }
      description={entry.notes}
    >
      {entry.feedingRoutineSnapshot && (
        <DashboardItemBodyText>
          {entry.feedingRoutineSnapshot}
        </DashboardItemBodyText>
      )}
      {Boolean(
        entry.recommendedSnapshot?.length || entry.avoidSnapshot?.length,
      ) && (
        <DetailListGrid>
          {Boolean(entry.recommendedSnapshot?.length) && (
            <DetailListBlock
              label={t('horseHistory.recommended')}
              items={entry.recommendedSnapshot ?? []}
            />
          )}
          {Boolean(entry.avoidSnapshot?.length) && (
            <DetailListBlock
              label={t('horseHistory.avoid')}
              items={entry.avoidSnapshot ?? []}
            />
          )}
        </DetailListGrid>
      )}
    </ActivityTimelineListEntry>
  )
}
