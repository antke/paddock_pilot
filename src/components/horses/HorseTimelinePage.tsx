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
import {
  formatMediumDateKey,
  formatMediumTimestampDate,
} from '#/lib/dateDisplay'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import { eventTypeLabels } from 'shared/events/eventSchema'
import {
  HealthIssueKindBadge,
  HealthIssueSeverityBadge,
  HealthIssueStatusBadge,
  MedicationRecordKindBadge,
  MedicationRecordStatusBadge,
  NutritionLogKindBadge,
  WeightRecordKindBadge,
} from './HorseCareBadges'
import { horseHealthIssueSeverityLabels } from './horseCareLabels'

type HorseTimeline = FunctionReturnType<typeof api.horseTimeline.listForHorse>
type TimelineEntry = HorseTimeline['entries'][number]

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

  return (
    <DashboardSectionCard
      title="Timeline"
      description={
        timeline.horse
          ? `A chronological care history for ${timeline.horse.name}.`
          : 'A chronological care history for this horse.'
      }
      size="panel"
      contentGap="comfortable"
    >
      {timeline.entries.length === 0 ? (
        <DashboardEmptyState chrome="soft" title="No timeline entries yet">
          Events and care records will appear here as the yard adds them.
        </DashboardEmptyState>
      ) : (
        <DashboardItemList gap="compact">
          {timeline.entries.map((entry) => (
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
  return (
    <ActivityTimelineListEntry
      accent={entry.status === 'completed' ? 'muted' : 'primary'}
      badges={
        <>
          <EventKindBadge />
          {entry.status !== 'planned' && (
            <EventStatusBadge status={entry.status} />
          )}
        </>
      }
      title={entry.title}
      meta={
        <>
          <span>
            {formatEventDateTime(entry.date, entry.time, entry.endDate)}
          </span>
          <span>{eventTypeLabels[entry.eventType]}</span>
          {entry.providerName && <span>{entry.providerName}</span>}
        </>
      }
      description={entry.description}
    >
      {entry.notesAfterCompletion && (
        <DashboardItemBodyText>
          {entry.notesAfterCompletion}
        </DashboardItemBodyText>
      )}
      {entry.requestedServiceNotes && (
        <DetailTextBlock label="Requested for this horse">
          {entry.requestedServiceNotes}
        </DetailTextBlock>
      )}
      {entry.horseCompletionNotes && (
        <DetailTextBlock label="Horse outcome">
          {entry.horseCompletionNotes}
        </DetailTextBlock>
      )}
      {entry.costShare !== undefined && (
        <DashboardMetaList>
          <span>Cost share: {entry.costShare}</span>
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
          <span>Noted {formatMediumTimestampDate(entry.occurredAt)}</span>
          {entry.severity && entry.severity !== 'high' && (
            <span>{horseHealthIssueSeverityLabels[entry.severity]}</span>
          )}
          {entry.resolvedAt && (
            <span>Resolved {formatMediumTimestampDate(entry.resolvedAt)}</span>
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
  return (
    <ActivityTimelineListEntry
      accent="muted"
      badges={<WeightRecordKindBadge />}
      title={`${entry.weight} ${entry.unit}`}
      meta={
        <>
          <span>Measured {formatMediumTimestampDate(entry.occurredAt)}</span>
          {entry.bodyConditionScore !== undefined && (
            <span>BCS {entry.bodyConditionScore}/9</span>
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
          <span>Started {formatMediumDateKey(entry.startDate)}</span>
          <span>{entry.dosage}</span>
          {entry.frequency && <span>{entry.frequency}</span>}
          {entry.endDate && (
            <span>Ended {formatMediumDateKey(entry.endDate)}</span>
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
  return (
    <ActivityTimelineListEntry
      accent="primary"
      badges={<NutritionLogKindBadge />}
      title={entry.summary}
      meta={<span>Logged {formatMediumTimestampDate(entry.occurredAt)}</span>}
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
              label="Recommended"
              items={entry.recommendedSnapshot ?? []}
            />
          )}
          {Boolean(entry.avoidSnapshot?.length) && (
            <DetailListBlock label="Avoid" items={entry.avoidSnapshot ?? []} />
          )}
        </DetailListGrid>
      )}
    </ActivityTimelineListEntry>
  )
}
