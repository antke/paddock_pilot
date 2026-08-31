import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  EventKindBadge,
  EventStatusBadge,
} from '#/components/events/EventBadges'
import { formatEventDateTime } from '#/components/events/eventDisplay'
import { ActivityTimelineListEntry } from '#/components/timeline/ActivityTimeline'
import { Badge } from '#/components/ui/badge'
import { eventTypeLabels } from 'shared/events/eventSchema'

export function TimelinePageLab({ data }: { data: DashboardLabData }) {
  const horse = data.horses[0]
  const horseEvents = data.events.filter((event) =>
    horse ? event.horseIds.includes(horse._id) : false,
  )

  return (
    <DashboardSectionCard
      title="Timeline"
      description={`A chronological care history for ${horse?.name ?? 'this horse'}.`}
      size="panel"
      contentGap="comfortable"
    >
      <DashboardItemList gap="compact">
        <ActivityTimelineListEntry
          accent="warning"
          title="Phenylbutazone"
          meta={
            <>
              <span>Started 8 Jul 2026</span>
              <span>1 sachet</span>
              <span>Twice daily</span>
              <span>Dr. Halley Morse</span>
            </>
          }
          description="Short course following the lameness assessment."
          badges={<Badge variant="warning">Medication</Badge>}
        />

        {horseEvents.map((event) => (
          <ActivityTimelineListEntry
            key={event._id}
            accent={event.status === 'completed' ? 'muted' : 'primary'}
            title={event.title}
            meta={
              <>
                <span>
                  {formatEventDateTime(event.date, event.time, event.endDate)}
                </span>
                <span>{eventTypeLabels[event.type]}</span>
                {event.providerName && <span>{event.providerName}</span>}
              </>
            }
            description={event.description ?? event.notesAfterCompletion}
            badges={
              <>
                <EventKindBadge />
                {event.status && event.status !== 'planned' && (
                  <EventStatusBadge status={event.status} />
                )}
              </>
            }
          />
        ))}

        <ActivityTimelineListEntry
          accent="muted"
          title="548 kg"
          meta={
            <>
              <span>Measured 28 Jun 2026</span>
              <span>BCS 5/9</span>
            </>
          }
          description="Weight steady after the spring feed transition."
          badges={<Badge variant="secondary">Weight</Badge>}
        />
      </DashboardItemList>
    </DashboardSectionCard>
  )
}
