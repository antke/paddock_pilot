import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'
import { Link } from '@tanstack/react-router'
import { eventStatusLabels, eventTypeLabels } from 'shared/events/eventSchema'
import type { DashboardLabEvent } from '../dashboardLabTypes'
import { DashboardItemCardContent, dashboardItemCardClassName } from './DashboardItemCard'

type EventLinkCardProps = {
  event: DashboardLabEvent
  density?: 'comfortable' | 'compact'
  showDate?: boolean
  className?: string
}

export function EventLinkCard({
  event,
  density = 'comfortable',
  showDate = true,
  className,
}: EventLinkCardProps) {
  const compact = density === 'compact'
  const locationMeta = event.location ? event.location : undefined
  const dateMeta = showDate ? event.date : undefined
  const scheduleMeta = [dateMeta, locationMeta].filter(Boolean).join(' · ')

  return (
    <Link
      to="/stables/$stableId/events/$eventId"
      params={{ stableId: event.stableId, eventId: event._id }}
      className={dashboardItemCardClassName({ density, interactive: true, className })}
    >
      <DashboardItemCardContent
        title={event.title}
        density={density}
        leading={
          <span
            className={cn(
              'grid place-items-center rounded-md bg-primary/8 font-semibold text-primary',
              compact ? 'min-w-12 px-2 py-1 text-xs' : 'min-w-16 px-2 py-3 text-sm',
            )}
          >
            {event.time}
          </span>
        }
        meta={
          <>
            {!compact && <Badge variant="secondary">{eventTypeLabels[event.type]}</Badge>}
            {!compact && <Badge variant="outline">{eventStatusLabels[event.status]}</Badge>}
            {scheduleMeta && <span className="line-clamp-1">{scheduleMeta}</span>}
          </>
        }
      />
    </Link>
  )
}
