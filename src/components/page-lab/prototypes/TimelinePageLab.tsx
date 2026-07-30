import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  EventStatusBadge,
  EventTypeBadge,
} from '#/components/events/EventBadges'
import { formatEventDateTime } from '#/components/events/eventDisplay'
import { ActivityTimelineListEntry } from '#/components/timeline/ActivityTimeline'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'

export function TimelinePageLab({ data }: { data: DashboardLabData }) {
  const horse = data.horses[0]
  const horseEvents = data.events.filter((event) =>
    horse ? event.horseIds.includes(horse._id) : false,
  )

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Horse timeline"
        description={`Care history for ${horse?.name ?? 'this horse'}.`}
        actions={<Button variant="outline">Back to horse</Button>}
      />

      <DashboardSectionCard
        size="panel"
        contentGap="comfortable"
      >
        <div>
          <ActivityTimelineListEntry
            accent="warning"
            title="Phenylbutazone"
            meta={
              <>
                <span>Started 8 Jul 2026</span>
                <span>Dr. Halley Morse</span>
              </>
            }
            description="Short course following the lameness assessment."
            badges={
              <>
                <Badge variant="warning">Medication</Badge>
                <Badge variant="outline">Active</Badge>
              </>
            }
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
                  {event.providerName && <span>{event.providerName}</span>}
                </>
              }
              description={event.description ?? event.notesAfterCompletion}
              badges={
                <>
                  <EventTypeBadge type={event.type} />
                  <EventStatusBadge status={event.status ?? 'planned'} />
                </>
              }
            />
          ))}

          <ActivityTimelineListEntry
            accent="muted"
            title="548 kg"
            meta={<span>Measured 28 Jun 2026</span>}
            description="Weight steady after the spring feed transition."
            badges={
              <>
                <Badge variant="secondary">Weight</Badge>
                <Badge variant="outline">BCS 5/9</Badge>
              </>
            }
          />
        </div>
      </DashboardSectionCard>
    </DashboardPage>
  )
}
