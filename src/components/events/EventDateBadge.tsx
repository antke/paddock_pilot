import { isAllDay } from 'shared/events/eventTime'
import { formatEventDateTime, formatEventTime } from './eventDisplay'
import { useLocale } from '#/i18n/LocaleProvider'
import { cn } from '#/lib/utils'
import { formatMediumDateKey, getDateBadgeParts } from '#/lib/dateDisplay'
import { TextLabel } from '#/components/ui/text-label'

type EventDateBadgeVariant = 'compact' | 'rail' | 'hero'

type EventDateBadgeProps = {
  date: string
  time?: string
  variant?: EventDateBadgeVariant
  className?: string
}

export { getDateBadgeParts as getEventDateBadgeParts } from '#/lib/dateDisplay'

export function EventDateBadge({
  date,
  time,
  variant = 'compact',
  className,
}: EventDateBadgeProps) {
  const { locale } = useLocale()
  const dateBadge = getDateBadgeParts(date, locale)

  return (
    <time
      data-slot="event-date-badge"
      dateTime={time && !isAllDay(time) ? `${date}T${time}` : date}
      aria-label={
        time
          ? formatEventDateTime(date, time, undefined, locale)
          : formatMediumDateKey(date, locale)
      }
      className={cn(
        'grid shrink-0 content-center justify-items-center gap-1 text-center',
        variant === 'compact' &&
          'app-row size-14 gap-0.5 rounded-control px-1 py-0.5',
        variant === 'rail' && 'app-row size-16 rounded-control px-2 py-1',
        variant === 'hero' && 'app-row size-24 p-3',
        isAllDay(time) && variant !== 'hero' && 'min-w-20',
        className,
      )}
    >
      <TextLabel
        size="xs"
        weight={variant === 'hero' ? 'semibold' : 'medium'}
        tracking={variant === 'hero' ? 'tight' : 'none'}
        className="whitespace-nowrap leading-none"
      >
        {dateBadge.month}
      </TextLabel>
      <span
        className={cn(
          'font-semibold',
          variant === 'hero' ? 'text-3xl/none tracking-normal' : 'text-lg/none',
        )}
      >
        {dateBadge.day}
      </span>
      {time && (
        <TextLabel
          size="xs"
          weight={variant === 'hero' ? 'semibold' : 'medium'}
          tracking="none"
          className="whitespace-nowrap leading-none"
        >
          {formatEventTime(time, locale)}
        </TextLabel>
      )}
    </time>
  )
}
