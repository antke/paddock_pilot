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
  const dateBadge = getDateBadgeParts(date)

  return (
    <time
      data-slot="event-date-badge"
      dateTime={time ? `${date}T${time}` : date}
      aria-label={`${formatMediumDateKey(date)}${time ? ` at ${time}` : ''}`}
      className={cn(
        'grid shrink-0 justify-items-center text-center',
        variant === 'compact' && 'app-row min-w-14 rounded-control px-2 py-1',
        variant === 'rail' && 'app-row min-w-16 rounded-control px-3 py-2',
        variant === 'hero' && 'app-row size-24 content-center gap-1 p-3',
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
          'font-semibold leading-none',
          variant === 'hero' ? 'text-3xl tracking-normal' : 'text-lg',
        )}
      >
        {dateBadge.day}
      </span>
      {time && (
        <TextLabel
          size="xs"
          weight={variant === 'hero' ? 'semibold' : 'medium'}
          tracking="none"
          className={cn(
            'mt-1 leading-none',
            variant === 'hero' && 'mt-0 whitespace-nowrap',
          )}
        >
          {time}
        </TextLabel>
      )}
    </time>
  )
}
