import type { ReactNode } from 'react'

import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { DashboardItemLinkCard } from '#/components/dashboard/DashboardItemCard'
import type { DashboardItemAccent } from '#/components/dashboard/DashboardItemCard'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { formatCountLabel } from '#/lib/numberDisplay'
import { cn } from '#/lib/utils'
import type {
  EventRecurrence,
  EventStatus,
  EventType,
} from 'shared/events/eventSchema'
import { EventStatusBadge, EventTypeBadge } from './EventBadges'
import { EventDateBadge } from './EventDateBadge'
import { formatEventDateTime, formatRecurrence } from './eventDisplay'

export type EventRowVariant = 'agenda' | 'contextual' | 'compact' | 'summary'

export type EventRowDensity = 'comfortable' | 'compact'

export type EventRowEvent = {
  _id: string
  stableId: string
  title: string
  date: string
  endDate?: string
  time: string
  type: EventType
  status?: EventStatus
  location?: string
  recurrence?: EventRecurrence
}

type EventRowProps = {
  event: EventRowEvent
  accent?: DashboardItemAccent
  chrome?: DashboardChrome
  className?: string
  density?: EventRowDensity
  horseCount?: number
  selected?: boolean
  showLocation?: boolean
  showRecurrence?: boolean
  showStatus?: boolean
  stableId?: string
  supplementalBadges?: ReactNode
  supplementalMeta?: Array<string | null | undefined>
  variant?: EventRowVariant
}

const variantDensity = {
  agenda: 'comfortable',
  contextual: 'comfortable',
  compact: 'compact',
  summary: 'compact',
} satisfies Record<EventRowVariant, EventRowDensity>

export function EventRow({
  event,
  accent = 'none',
  chrome = 'soft',
  className,
  density,
  horseCount,
  selected = false,
  showLocation = true,
  showRecurrence = true,
  showStatus = true,
  stableId = event.stableId,
  supplementalBadges,
  supplementalMeta = [],
  variant = 'agenda',
}: EventRowProps) {
  const resolvedDensity = density ?? variantDensity[variant]

  return (
    <DashboardItemLinkCard
      to="/stables/$stableId/events/$eventId"
      params={{ stableId, eventId: event._id }}
      accent={accent}
      chrome={chrome}
      density={resolvedDensity}
      selected={selected}
      aria-current={selected ? 'page' : undefined}
      className={cn(
        'active:bg-primary/10 motion-reduce:transition-none',
        chrome === 'soft' && 'border border-transparent',
        className,
      )}
    >
      <EventRowContent
        event={event}
        density={resolvedDensity}
        horseCount={horseCount}
        showLocation={showLocation}
        showRecurrence={showRecurrence}
        showStatus={showStatus}
        supplementalBadges={supplementalBadges}
        supplementalMeta={supplementalMeta}
        variant={variant}
      />
    </DashboardItemLinkCard>
  )
}

function EventRowContent({
  event,
  density,
  horseCount,
  showLocation,
  showRecurrence,
  showStatus,
  supplementalBadges,
  supplementalMeta,
  variant,
}: {
  event: EventRowEvent
  density: EventRowDensity
  horseCount?: number
  showLocation: boolean
  showRecurrence: boolean
  showStatus: boolean
  supplementalBadges?: ReactNode
  supplementalMeta: Array<string | null | undefined>
  variant: EventRowVariant
}) {
  const leading = getLeading(event, variant, density)
  const metaItems = getMetaItems({
    event,
    horseCount,
    showLocation,
    showRecurrence,
    supplementalMeta,
    variant,
  })

  return (
    <div
      data-slot="event-row-content"
      className={cn(
        'grid min-w-0 items-center gap-3',
        leading && 'grid-cols-[auto_minmax(0,1fr)]',
      )}
    >
      {leading}

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <span className="line-clamp-2 min-w-0 basis-40 flex-1 text-sm font-semibold leading-5 transition-colors group-hover/open:text-primary sm:line-clamp-1 motion-reduce:transition-none">
            {event.title}
          </span>

          <DashboardBadgeList align="end" gap="compact" className="shrink-0">
            <EventTypeBadge type={event.type} />
            {showStatus && (
              <EventStatusBadge status={event.status ?? 'planned'} />
            )}
            {supplementalBadges}
          </DashboardBadgeList>
        </div>

        {metaItems.length > 0 && (
          <DashboardMetaList
            className="mt-1"
            gap="compact"
            separator="dot"
            size={density === 'compact' ? 'xs' : 'sm'}
          >
            {metaItems.map((item, index) => (
              <span key={`${index}-${item}`} className="whitespace-nowrap">
                {item}
              </span>
            ))}
          </DashboardMetaList>
        )}
      </div>
    </div>
  )
}

function getLeading(
  event: EventRowEvent,
  variant: EventRowVariant,
  density: EventRowDensity,
): ReactNode {
  if (variant === 'agenda') {
    return <EventDateBadge date={event.date} time={event.time} />
  }

  if (variant === 'contextual') {
    return (
      <span
        data-slot="event-time-badge"
        className={cn(
          'app-row grid shrink-0 place-items-center rounded-control font-semibold text-primary',
          density === 'compact'
            ? 'min-w-12 px-2 py-1 text-xs'
            : 'min-w-16 px-2 py-3 text-sm',
        )}
      >
        {event.time}
      </span>
    )
  }

  return null
}

function getMetaItems({
  event,
  horseCount,
  showLocation,
  showRecurrence,
  supplementalMeta,
  variant,
}: {
  event: EventRowEvent
  horseCount?: number
  showLocation: boolean
  showRecurrence: boolean
  supplementalMeta: Array<string | null | undefined>
  variant: EventRowVariant
}) {
  const recurrenceSummary = showRecurrence
    ? formatRecurrence(event.recurrence)
    : null

  return [
    variant === 'compact' || variant === 'summary'
      ? formatEventDateTime(event.date, event.time, event.endDate)
      : null,
    horseCount === undefined ? null : formatCountLabel(horseCount, 'horse'),
    showLocation ? event.location : null,
    recurrenceSummary,
    ...supplementalMeta,
  ].filter((item): item is string => Boolean(item))
}
