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
import { eventTypeLabels } from 'shared/events/eventSchema'
import {
  careReminderCategoryLabels,
  careReminderPriorityLabels,
} from 'shared/reminders/careReminderSchema'
import { formatEventDate } from '#/components/events/eventDisplay'

type StableAnalysis = FunctionReturnType<typeof api.stableAnalysis.getForStable>
type UnlockedAnalysis = Extract<StableAnalysis, { hasAccess: true }>
type UpcomingEvent = UnlockedAnalysis['upcomingEvents'][number]
type HorseAttentionItem = UnlockedAnalysis['horsesNeedingAttention'][number]
type HorseOutcomeItem = UnlockedAnalysis['horseOutcomeNotesNeeded'][number]
type WeightTrendItem = UnlockedAnalysis['weightTrends'][number]
type HealthIssueFrequencyItem = UnlockedAnalysis['healthIssueFrequency'][number]
type CareCadenceItem = UnlockedAnalysis['careCadence'][number]
type NutritionSignalItem = UnlockedAnalysis['nutritionSignals'][number]
type UpcomingReminderItem = UnlockedAnalysis['upcomingReminders'][number]

type StableAnalysisPageProps = {
  stableId: string
}

export function StableAnalysisPage({ stableId }: StableAnalysisPageProps) {
  const { data: analysis } = useSuspenseQuery(
    convexQuery(api.stableAnalysis.getForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )

  if (!analysis.hasAccess) {
    return <LockedAnalysis stableName={analysis.stable.name} stableId={stableId} />
  }

  return <UnlockedAnalysisPage analysis={analysis} stableId={stableId} />
}

function LockedAnalysis({
  stableName,
  stableId,
}: {
  stableName: string
  stableId: string
}) {
  return (
    <div className="grid gap-6">
      <AnalysisHeader stableName={stableName} stableId={stableId} />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Analysis Centre is a Personal Pro feature</CardTitle>
            <Badge variant="secondary">Premium</Badge>
          </div>
          <CardDescription>
            Upgrade to spot care gaps, health trends, missing follow-up notes,
            and upcoming service load across the stable.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link to="/pricing" className={buttonVariants()}>
            View plans
          </Link>
          <Link
            to="/stables/$stableId"
            params={{ stableId }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Back to stable
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

function UnlockedAnalysisPage({
  analysis,
  stableId,
}: {
  analysis: UnlockedAnalysis
  stableId: string
}) {
  return (
    <div className="grid gap-8">
      <AnalysisHeader stableName={analysis.stable.name} stableId={stableId} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active health issues"
          value={`${analysis.summary.activeHealthIssueCount}`}
          description={`${analysis.summary.resolvedHealthIssueCount} resolved records`}
        />
        <MetricCard
          title="Active medication"
          value={`${analysis.summary.activeMedicationCount}`}
          description={`${analysis.summary.completedMedicationCount} completed courses`}
        />
        <MetricCard
          title="Weight tracking"
          value={`${analysis.summary.horsesWithWeightRecordsCount}/${analysis.summary.horseCount}`}
          description={`${analysis.summary.weightRecordCount} weight and body condition records`}
        />
        <MetricCard
          title="Care coverage"
          value={`${analysis.summary.horseOutcomeCoveragePercent}%`}
          description={`${analysis.summary.eventNoteCoveragePercent}% event notes · ${analysis.summary.overdueCareCadenceCount} overdue cadence warnings`}
        />
        <MetricCard
          title="Pending reminders"
          value={`${analysis.summary.pendingReminderCount}`}
          description={`${analysis.summary.overdueReminderCount} overdue reminders`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
        <HorseAttentionCard horses={analysis.horsesNeedingAttention} />
        <EventMixCard eventTypeCounts={analysis.eventTypeCounts} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <WeightTrendCard trends={analysis.weightTrends} />
        <CareCadenceCard items={analysis.careCadence} />
        <HealthIssueFrequencyCard items={analysis.healthIssueFrequency} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        <NutritionSignalCard signals={analysis.nutritionSignals} />
        <CompletionCoverageCard coverage={analysis.completionCoverage} />
      </div>

      <ReminderInsightCard
        upcomingReminders={analysis.upcomingReminders}
        categoryCounts={analysis.reminderCategoryCounts}
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <EventListCard
          title="Next 30 days"
          description="Planned service load coming up."
          events={analysis.upcomingEvents}
          emptyLabel="No planned events in the next 30 days."
        />
        <EventListCard
          title="Missing completion notes"
          description="Completed events that still need aftercare notes."
          events={analysis.completionNotesNeeded}
          emptyLabel="All completed events have notes."
        />
        <HorseOutcomeListCard
          title="Missing horse outcomes"
          description="Completed shared visits needing per-horse notes."
          outcomes={analysis.horseOutcomeNotesNeeded}
          emptyLabel="Per-horse outcomes are filled in."
        />
        <EventListCard
          title="Missing provider details"
          description="Events without a named provider or phone number."
          events={analysis.providerDetailsMissing}
          emptyLabel="Provider details are filled in."
        />
      </div>
    </div>
  )
}

function HorseOutcomeListCard({
  title,
  description,
  outcomes,
  emptyLabel,
}: {
  title: string
  description: string
  outcomes: Array<HorseOutcomeItem>
  emptyLabel: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {outcomes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          outcomes.map((outcome) => (
            <div key={outcome.id} className="grid gap-1 border p-3">
              <span className="font-medium">{outcome.eventTitle}</span>
              <p className="text-sm text-muted-foreground">
                {outcome.horseName} · {formatEventDate(outcome.eventDate)}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function ReminderInsightCard({
  upcomingReminders,
  categoryCounts,
}: {
  upcomingReminders: Array<UpcomingReminderItem>
  categoryCounts: UnlockedAnalysis['reminderCategoryCounts']
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reminder load</CardTitle>
        <CardDescription>
          Upcoming due tasks and active reminder categories across the stable.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.6fr)]">
        <div className="grid gap-3">
          {upcomingReminders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming pending reminders.</p>
          ) : (
            upcomingReminders.map((reminder) => (
              <div key={reminder.id} className="grid gap-1 border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{reminder.title}</span>
                  <Badge variant="outline">
                    {careReminderCategoryLabels[reminder.category]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Due {formatEventDate(reminder.dueDate)}
                  {reminder.horseName ? ` · ${reminder.horseName}` : ''}
                </p>
                {reminder.priority && (
                  <p className="text-sm">
                    {careReminderPriorityLabels[reminder.priority]} priority
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        <div className="grid content-start gap-3">
          {categoryCounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reminder categories yet.</p>
          ) : (
            categoryCounts.map((item) => (
              <div key={item.category} className="flex items-center justify-between gap-4">
                <span>{careReminderCategoryLabels[item.category]}</span>
                <Badge variant="secondary">{item.count}</Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function WeightTrendCard({ trends }: { trends: Array<WeightTrendItem> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight and body condition trends</CardTitle>
        <CardDescription>Latest measurements compared with the previous matching unit.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {trends.length === 0 ? (
          <p className="text-sm text-muted-foreground">No weight records yet.</p>
        ) : (
          trends.map((trend) => (
            <div key={trend.horseId} className="grid gap-2 border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{trend.horseName}</span>
                <Badge variant="outline">
                  {trend.latestWeight} {trend.unit}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Latest: {formatTimestampDate(trend.measuredAt)}
              </p>
              {trend.weightChange !== undefined && (
                <p className="text-sm">
                  Weight change: {formatSignedNumber(trend.weightChange)} {trend.unit}
                </p>
              )}
              {trend.latestBodyConditionScore !== undefined && (
                <p className="text-sm text-muted-foreground">
                  BCS {trend.latestBodyConditionScore}
                  {trend.bodyConditionChange !== undefined
                    ? ` (${formatSignedNumber(trend.bodyConditionChange)})`
                    : ''}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function CareCadenceCard({ items }: { items: Array<CareCadenceItem> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Care cadence</CardTitle>
        <CardDescription>Simple cadence checks by horse and service type.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No care cadence data yet.</p>
        ) : (
          items.map((item) => (
            <div key={`${item.horseId}-${item.type}`} className="grid gap-2 border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{item.horseName}</span>
                <Badge variant={item.overdue ? 'destructive' : 'outline'}>
                  {eventTypeLabels[item.type]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Expected about every {item.expectedDays} days.
              </p>
              {item.daysSinceLast !== undefined && (
                <p className="text-sm">Last completed {item.daysSinceLast} days ago.</p>
              )}
              {item.daysUntilNext !== undefined && (
                <p className="text-sm">Next planned in {item.daysUntilNext} days.</p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function HealthIssueFrequencyCard({
  items,
}: {
  items: Array<HealthIssueFrequencyItem>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health issue frequency</CardTitle>
        <CardDescription>Horses with the most recorded health notes.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No health issues recorded yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.horseId} className="grid gap-2 border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{item.horseName}</span>
                <Badge variant={item.activeCount > 0 ? 'destructive' : 'outline'}>
                  {item.totalCount} total
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {item.activeCount} active · {item.resolvedCount} resolved
              </p>
              {item.latestIssueTitle && (
                <p className="text-sm">Latest: {item.latestIssueTitle}</p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function NutritionSignalCard({ signals }: { signals: Array<NutritionSignalItem> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition change signals</CardTitle>
        <CardDescription>
          Nutrition logs within 14 days of weight records or health issues.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {signals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No nearby nutrition, weight, or health changes found.
          </p>
        ) : (
          signals.map((signal) => (
            <div key={signal.id} className="grid gap-2 border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{signal.horseName}</span>
                <Badge variant="outline">{formatTimestampDate(signal.changedAt)}</Badge>
              </div>
              <p className="text-sm">{signal.summary}</p>
              <p className="text-sm text-muted-foreground">
                {signal.nearbyWeightCount} nearby weight record
                {signal.nearbyWeightCount === 1 ? '' : 's'} ·{' '}
                {signal.nearbyHealthIssueCount} nearby health issue
                {signal.nearbyHealthIssueCount === 1 ? '' : 's'}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function CompletionCoverageCard({
  coverage,
}: {
  coverage: UnlockedAnalysis['completionCoverage']
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Completion-note coverage</CardTitle>
        <CardDescription>How consistently completed care is documented.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <CoverageRow
          label="Event notes"
          percent={coverage.eventNoteCoveragePercent}
          detail={`${coverage.eventsWithNotesCount}/${coverage.completedEventCount} completed events`}
        />
        <CoverageRow
          label="Horse outcomes"
          percent={coverage.horseOutcomeCoveragePercent}
          detail={`${coverage.horseOutcomesWithNotesCount}/${coverage.completedHorseOutcomeCount} completed horse outcomes`}
        />
      </CardContent>
    </Card>
  )
}

function CoverageRow({
  label,
  percent,
  detail,
}: {
  label: string
  percent: number
  detail: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border p-3">
      <div className="grid gap-1">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{detail}</span>
      </div>
      <Badge variant={percent < 75 ? 'destructive' : 'secondary'}>{percent}%</Badge>
    </div>
  )
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

function AnalysisHeader({
  stableName,
  stableId,
}: {
  stableName: string
  stableId: string
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-semibold">Analysis Centre</h1>
          <Badge variant="secondary">Personal Pro</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Premium care overview for {stableName}.
        </p>
      </div>

      <Link
        to="/stables/$stableId"
        params={{ stableId }}
        className={buttonVariants({ variant: 'outline' })}
      >
        Back to stable
      </Link>
    </header>
  )
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function HorseAttentionCard({ horses }: { horses: Array<HorseAttentionItem> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horses needing attention</CardTitle>
        <CardDescription>
          Active health issues and incomplete practical care records.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {horses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active health issues or profile gaps found.
          </p>
        ) : (
          horses.map((horse) => (
            <div key={horse.horseId} className="grid gap-2 border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{horse.horseName}</span>
                {horse.activeIssueCount > 0 && (
                  <Badge variant="destructive">
                    {horse.activeIssueCount} active issue
                    {horse.activeIssueCount === 1 ? '' : 's'}
                  </Badge>
                )}
                {horse.activeMedicationCount > 0 && (
                  <Badge variant="secondary">
                    {horse.activeMedicationCount} active medication
                  </Badge>
                )}
              </div>
              {horse.missingProfileFields.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Missing {horse.missingProfileFields.join(', ')}.
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function EventMixCard({
  eventTypeCounts,
}: {
  eventTypeCounts: UnlockedAnalysis['eventTypeCounts']
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Care event mix</CardTitle>
        <CardDescription>Most common scheduled work by type.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {eventTypeCounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events recorded yet.</p>
        ) : (
          eventTypeCounts.map((item) => (
            <div key={item.type} className="flex items-center justify-between gap-4">
              <span>{eventTypeLabels[item.type]}</span>
              <Badge variant="outline">{item.count}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function EventListCard({
  title,
  description,
  events,
  emptyLabel,
}: {
  title: string
  description: string
  events: Array<UpcomingEvent>
  emptyLabel: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          events.map((event) => (
            <div key={event._id} className="grid gap-1 border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{event.title}</span>
                <Badge variant="outline">{eventTypeLabels[event.type]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatEventDate(event.date)} at {event.time}
              </p>
              {(event.providerName || event.providerPhone) && (
                <p className="text-sm">
                  {[event.providerName, event.providerPhone]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
