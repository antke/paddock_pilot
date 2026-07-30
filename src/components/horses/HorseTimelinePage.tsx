import { formatEventDateTime } from '#/components/events/eventDisplay'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import {
  DetailListBlock,
  DetailListGrid,
  DetailTextBlock,
} from '#/components/dashboard/DetailBlocks'
import { DashboardItemBodyText } from '#/components/dashboard/DashboardItemCard'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  EventKindBadge,
  EventStatusBadge,
  EventTypeBadge,
} from '#/components/events/EventBadges'
import { ButtonLink } from '#/components/ui/button'
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
import {
  BodyConditionScoreBadge,
  HealthIssueKindBadge,
  HealthIssueSeverityBadge,
  HealthIssueStatusBadge,
  MedicationDosageBadge,
  MedicationFrequencyBadge,
  MedicationRecordKindBadge,
  MedicationRecordStatusBadge,
  NutritionLogDateBadge,
  NutritionLogKindBadge,
  WeightRecordKindBadge,
} from './HorseCareBadges'

type HorseTimeline = FunctionReturnType<typeof api.horseTimeline.listForHorse>
type TimelineEntry = HorseTimeline['entries'][number]

type HorseTimelinePageProps = {
  stableId: string
  horseId: string
}

export function HorseTimelinePage({
  stableId,
  horseId,
}: HorseTimelinePageProps) {
  const { data: timeline } = useSuspenseQuery(
    convexQuery(api.horseTimeline.listForHorse, {
      horseId: horseId as Id<'horses'>,
    }),
  )

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Horse timeline"
        description={
          timeline.horse
            ? `Care history for ${timeline.horse.name}.`
            : 'Care history for this horse.'
        }
        actions={
          <ButtonLink
            to="/stables/$stableId/horses/$horseId"
            params={{ stableId, horseId }}
            variant="outline"
          >
            Back to horse
          </ButtonLink>
        }
      />

      <DashboardSectionCard
        size="panel"
        contentGap="comfortable"
      >
        {timeline.entries.length === 0 ? (
          <DashboardEmptyState chrome="cards">
            No timeline entries are available for this horse yet.
          </DashboardEmptyState>
        ) : (
          <div>
            {timeline.entries.map((entry) => (
              <TimelineEntryCard
                key={`${entry.kind}-${entry.id}`}
                entry={entry}
              />
            ))}
          </div>
        )}
      </DashboardSectionCard>
    </DashboardPage>
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
          <EventTypeBadge type={entry.eventType} />
          <EventStatusBadge status={entry.status} />
        </>
      }
      title={entry.title}
      meta={
        <>
          <span>
            {formatEventDateTime(entry.date, entry.time, entry.endDate)}
          </span>
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
          {entry.severity && (
            <HealthIssueSeverityBadge severity={entry.severity} />
          )}
          <HealthIssueStatusBadge status={entry.status} />
        </>
      }
      title={entry.title}
      meta={
        <>
          <span>Noted {formatMediumTimestampDate(entry.occurredAt)}</span>
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
      badges={
        <>
          <WeightRecordKindBadge />
          {entry.bodyConditionScore !== undefined && (
            <BodyConditionScoreBadge score={entry.bodyConditionScore} />
          )}
        </>
      }
      title={`${entry.weight} ${entry.unit}`}
      meta={<span>Measured {formatMediumTimestampDate(entry.occurredAt)}</span>}
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
          <MedicationRecordStatusBadge status={entry.status} />
          <MedicationDosageBadge dosage={entry.dosage} />
          {entry.frequency && (
            <MedicationFrequencyBadge frequency={entry.frequency} />
          )}
        </>
      }
      title={entry.medicationName}
      meta={
        <>
          <span>Started {formatMediumDateKey(entry.startDate)}</span>
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
      badges={
        <>
          <NutritionLogKindBadge />
          <NutritionLogDateBadge
            dateLabel={formatMediumTimestampDate(entry.occurredAt)}
          />
        </>
      }
      title={entry.summary}
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
