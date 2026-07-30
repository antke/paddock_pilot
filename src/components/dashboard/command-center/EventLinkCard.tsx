import { EventRow } from '#/components/events/EventRow'
import type {
  DashboardCommandChrome,
  DashboardCommandEvent,
} from './dashboardTypes'
import type { DashboardItemAccent } from '#/components/dashboard/DashboardItemCard'

type EventLinkCardProps = {
  event: DashboardCommandEvent
  density?: 'comfortable' | 'compact'
  showDate?: boolean
  chrome?: DashboardCommandChrome
  className?: string
  accent?: DashboardItemAccent
}

export function EventLinkCard({
  event,
  density = 'comfortable',
  showDate = true,
  chrome = 'cards',
  className,
  accent = 'none',
}: EventLinkCardProps) {
  return (
    <EventRow
      event={event}
      density={density}
      chrome={chrome}
      accent={accent}
      className={className}
      variant={showDate ? 'agenda' : 'contextual'}
    />
  )
}
