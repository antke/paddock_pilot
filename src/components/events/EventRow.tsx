import { useLocale } from '#/i18n/LocaleProvider'
import { localeInstances } from '#/i18n/resources'
import type { Locale } from 'shared/i18n/locale'
import type { ReactNode } from 'react'

import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { DashboardItemLinkCard } from '#/components/dashboard/DashboardItemCard'
import type { DashboardItemAccent } from '#/components/dashboard/DashboardItemCard'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { cn } from '#/lib/utils'
import type {
  EventRecurrence,
  EventStatus,
  EventType,
} from 'shared/events/eventSchema'
import { EventStatusBadge } from './EventBadges'
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
  leadingLabel?: string
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
  leadingLabel,
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
      to={
        event.type === 'training'
          ? '/stables/$stableId/training/$eventId'
          : '/stables/$stableId/events/$eventId'
      }
      params={{ stableId, eventId: event._id }}
      accent={accent}
      chrome={chrome}
      density={resolvedDensity}
      selected={selected}
      aria-current={selected ? 'page' : undefined}
      className={cn(
        'active:bg-primary/10 motion-reduce:transition-none',
        className,
      )}
    >
      <EventRowContent
        event={event}
        density={resolvedDensity}
        horseCount={horseCount}
        leadingLabel={leadingLabel}
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
  leadingLabel,
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
  leadingLabel?: string
  showLocation: boolean
  showRecurrence: boolean
  showStatus: boolean
  supplementalBadges?: ReactNode
  supplementalMeta: Array<string | null | undefined>
  variant: EventRowVariant
}) {
  const { locale } = useLocale()
  const leading = getLeading(event, variant, density, leadingLabel)
  const metaItems = getMetaItems({
    locale,
    event,
    horseCount,
    showLocation,
    showRecurrence,
    supplementalMeta,
    variant,
  })
  const statusBadge =
    showStatus && event.status && event.status !== 'planned' ? (
      <EventStatusBadge status={event.status} />
    ) : null

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
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <span
            className={cn(
              'line-clamp-2 min-w-0 font-semibold transition-colors group-hover/open:text-primary motion-reduce:transition-none',
              density === 'compact'
                ? 'text-sm leading-5'
                : 'text-base leading-6',
            )}
          >
            {event.title}
          </span>

          {(statusBadge || supplementalBadges) && (
            <DashboardBadgeList
              align="end"
              gap="compact"
              className="shrink-0 justify-self-end"
            >
              {statusBadge}
              {supplementalBadges}
            </DashboardBadgeList>
          )}
        </div>

        {metaItems.length > 0 && (
          <DashboardMetaList
            className="mt-1"
            gap="compact"
            separator="dot"
            size={density === 'compact' ? 'xs' : 'sm'}
          >
            {metaItems.map((item, index) => (
              <span
                key={`${index}-${item}`}
                className="max-w-full [overflow-wrap:anywhere]"
              >
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
  leadingLabel?: string,
): ReactNode {
  if (variant === 'agenda') {
    return (
      <EventDateBadge
        date={event.date}
        time={event.time}
        variant={density === 'comfortable' ? 'rail' : 'compact'}
      />
    )
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
        {leadingLabel ?? event.time}
      </span>
    )
  }

  return null
}

function getMetaItems({
  locale,
  event,
  horseCount,
  showLocation,
  showRecurrence,
  supplementalMeta,
  variant,
}: {
  locale: Locale
  event: EventRowEvent
  horseCount?: number
  showLocation: boolean
  showRecurrence: boolean
  supplementalMeta: Array<string | null | undefined>
  variant: EventRowVariant
}) {
  const recurrenceSummary = showRecurrence
    ? formatRecurrence(event.recurrence, locale)
    : null

  return [
    localeInstances[locale].t(`events.types.${event.type}`),
    variant === 'compact' || variant === 'summary'
      ? formatEventDateTime(event.date, event.time, event.endDate, locale)
      : null,
    horseCount === undefined
      ? null
      : localeInstances[locale].t('calendar.horses', { count: horseCount }),
    showLocation ? event.location : null,
    recurrenceSummary,
    ...supplementalMeta,
  ].filter((item): item is string => Boolean(item))
}
