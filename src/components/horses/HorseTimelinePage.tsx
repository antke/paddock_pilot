import { formatEventDate } from '#/components/events/eventDisplay'
import {
  dashboardEmptyClassName,
  dashboardHeroClassName,
} from '#/components/dashboard/dashboardChrome'
import { Badge } from '#/components/ui/badge'
import { buttonVariants } from '#/components/ui/button'
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
import { eventStatusLabels, eventTypeLabels } from 'shared/events/eventSchema'
import type { HealthIssueSeverity } from 'shared/horses/healthIssueSchema'
import type { MedicationRecordStatus } from 'shared/horses/medicationRecordSchema'

type HorseTimeline = FunctionReturnType<typeof api.horseTimeline.listForHorse>
type TimelineEntry = HorseTimeline['entries'][number]

type HorseTimelinePageProps = {
  stableId: string
  horseId: string
}

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const severityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} satisfies Record<HealthIssueSeverity, string>

const medicationStatusLabels = {
  active: 'Active',
  completed: 'Completed',
} satisfies Record<MedicationRecordStatus, string>

const formatTimestamp = (timestamp: number) =>
  dateTimeFormatter.format(new Date(timestamp))

const timelineEntryClassName = 'grid gap-2 rounded-row bg-background/55 p-5'

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
    <div className="grid gap-6">
      <header className={dashboardHeroClassName('cards')}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold">Horse timeline</h1>
            <p className="text-sm text-muted-foreground">
              {timeline.horse
                ? `Care history for ${timeline.horse.name}.`
                : 'Care history for this horse.'}
            </p>
          </div>

          <Link
            to="/stables/$stableId/horses/$horseId"
            params={{ stableId, horseId }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Back to horse
          </Link>
        </div>
      </header>

      <Card className="bg-card/80">
        <CardHeader>
          <CardTitle>Care timeline</CardTitle>
          <CardDescription>
            Events, health issues, medication, nutrition changes, and weight
            records in one chronological view.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {timeline.entries.length === 0 ? (
            <p className={dashboardEmptyClassName('cards')}>
              No timeline entries are available for this horse yet.
            </p>
          ) : (
            timeline.entries.map((entry) => (
              <TimelineEntryCard
                key={`${entry.kind}-${entry.id}`}
                entry={entry}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
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
    <div className={timelineEntryClassName}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Event</Badge>
        <Badge variant="outline">{eventTypeLabels[entry.eventType]}</Badge>
        <Badge variant="outline">{eventStatusLabels[entry.status]}</Badge>
      </div>
      <div className="grid gap-1">
        <h2 className="font-medium">{entry.title}</h2>
        <p className="text-sm text-muted-foreground">
          {formatEventDate(entry.date)} at {entry.time}
          {entry.providerName ? ` · ${entry.providerName}` : ''}
        </p>
      </div>
      {entry.description && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {entry.description}
        </p>
      )}
      {entry.notesAfterCompletion && (
        <p className="whitespace-pre-wrap text-sm">
          {entry.notesAfterCompletion}
        </p>
      )}
      {entry.requestedServiceNotes && (
        <TimelineNote
          title="Requested for this horse"
          value={entry.requestedServiceNotes}
        />
      )}
      {entry.horseCompletionNotes && (
        <TimelineNote
          title="Horse outcome"
          value={entry.horseCompletionNotes}
        />
      )}
      {entry.costShare !== undefined && (
        <p className="text-sm text-muted-foreground">
          Cost share: {entry.costShare}
        </p>
      )}
    </div>
  )
}

function TimelineNote({ title, value }: { title: string; value: string }) {
  return (
    <div className="grid gap-1 text-sm">
      <span className="text-muted-foreground">{title}</span>
      <p className="whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function HealthIssueTimelineEntry({
  entry,
}: {
  entry: Extract<TimelineEntry, { kind: 'healthIssue' }>
}) {
  return (
    <div className={timelineEntryClassName}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={entry.status === 'active' ? 'destructive' : 'secondary'}
        >
          Health issue
        </Badge>
        {entry.severity && (
          <Badge variant="outline">{severityLabels[entry.severity]}</Badge>
        )}
        <Badge variant="outline">{entry.status}</Badge>
      </div>
      <div className="grid gap-1">
        <h2 className="font-medium">{entry.title}</h2>
        <p className="text-sm text-muted-foreground">
          Noted {formatTimestamp(entry.occurredAt)}
          {entry.resolvedAt
            ? ` · Resolved ${formatTimestamp(entry.resolvedAt)}`
            : ''}
        </p>
      </div>
      {entry.description && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {entry.description}
        </p>
      )}
    </div>
  )
}

function WeightTimelineEntry({
  entry,
}: {
  entry: Extract<TimelineEntry, { kind: 'weightRecord' }>
}) {
  return (
    <div className={timelineEntryClassName}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Weight</Badge>
        {entry.bodyConditionScore !== undefined && (
          <Badge variant="outline">BCS {entry.bodyConditionScore}/9</Badge>
        )}
      </div>
      <div className="grid gap-1">
        <h2 className="font-medium">
          {entry.weight} {entry.unit}
        </h2>
        <p className="text-sm text-muted-foreground">
          Measured {formatTimestamp(entry.occurredAt)}
        </p>
      </div>
      {entry.notes && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {entry.notes}
        </p>
      )}
    </div>
  )
}

function MedicationTimelineEntry({
  entry,
}: {
  entry: Extract<TimelineEntry, { kind: 'medicationRecord' }>
}) {
  return (
    <div className={timelineEntryClassName}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={entry.status === 'active' ? 'default' : 'secondary'}>
          Medication
        </Badge>
        <Badge variant="outline">{medicationStatusLabels[entry.status]}</Badge>
        <Badge variant="outline">{entry.dosage}</Badge>
        {entry.frequency && <Badge variant="outline">{entry.frequency}</Badge>}
      </div>
      <div className="grid gap-1">
        <h2 className="font-medium">{entry.medicationName}</h2>
        <p className="text-sm text-muted-foreground">
          Started {entry.startDate}
          {entry.endDate ? ` · Ended ${entry.endDate}` : ''}
          {entry.prescribedBy ? ` · ${entry.prescribedBy}` : ''}
        </p>
      </div>
      {entry.reason && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {entry.reason}
        </p>
      )}
      {entry.notes && (
        <p className="whitespace-pre-wrap text-sm">{entry.notes}</p>
      )}
    </div>
  )
}

function NutritionTimelineEntry({
  entry,
}: {
  entry: Extract<TimelineEntry, { kind: 'nutritionLog' }>
}) {
  return (
    <div className={timelineEntryClassName}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Nutrition change</Badge>
        <Badge variant="outline">{formatTimestamp(entry.occurredAt)}</Badge>
      </div>
      <div className="grid gap-1">
        <h2 className="font-medium">{entry.summary}</h2>
        {entry.notes && (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {entry.notes}
          </p>
        )}
      </div>
      {entry.feedingRoutineSnapshot && (
        <p className="whitespace-pre-wrap text-sm">
          {entry.feedingRoutineSnapshot}
        </p>
      )}
      {Boolean(
        entry.recommendedSnapshot?.length || entry.avoidSnapshot?.length,
      ) && (
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          {Boolean(entry.recommendedSnapshot?.length) && (
            <TimelineList
              title="Recommended"
              items={entry.recommendedSnapshot ?? []}
            />
          )}
          {Boolean(entry.avoidSnapshot?.length) && (
            <TimelineList title="Avoid" items={entry.avoidSnapshot ?? []} />
          )}
        </div>
      )}
    </div>
  )
}

function TimelineList({
  title,
  items,
}: {
  title: string
  items: Array<string>
}) {
  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground">{title}</span>
      <ul className="list-inside list-disc">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
