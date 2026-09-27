import { formatEventDateRange } from '#/components/events/eventDisplay'
import { EventRow } from '#/components/events/EventRow'
import type {
  DashboardCommandChrome,
  DashboardCommandScheduleEvent,
} from './dashboardTypes'
import type { DashboardItemAccent } from '#/components/dashboard/DashboardItemCard'

type EventLinkCardProps = {
  event: DashboardCommandScheduleEvent
  density?: 'comfortable' | 'compact'
  showDate?: boolean
  dayKey?: string
  chrome?: DashboardCommandChrome
  className?: string
  accent?: DashboardItemAccent
}

export function EventLinkCard({
  event,
  density = 'comfortable',
  showDate = true,
  dayKey,
  chrome = 'flat',
  className,
  accent = 'none',
}: EventLinkCardProps) {
  return (
    <EventRow
      event={event}
      leadingLabel={dayKey && event.date < dayKey ? 'Continues' : undefined}
      supplementalMeta={
        event.endDate && event.endDate !== event.date
          ? [formatEventDateRange(event.date, event.endDate)]
          : []
      }
      density={density}
      chrome={chrome}
      accent={accent}
      className={className}
      variant={showDate ? 'agenda' : 'contextual'}
    />
  )
}
