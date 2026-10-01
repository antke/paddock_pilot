import { useT } from '#/i18n/LocaleProvider'
import { Badge } from '#/components/ui/badge'
import type { Doc } from 'convex/_generated/dataModel'
import type { ComponentProps } from 'react'
import type { EventStatus } from 'shared/events/eventSchema'

type EventBadgeProps = Omit<ComponentProps<typeof Badge>, 'children' | 'size'>
type EventHorseStatus = NonNullable<Doc<'eventsHorses'>['status']>

const eventStatusVariant = {
  planned: 'secondary',
  completed: 'success',
  cancelled: 'neutral',
} satisfies Record<
  EventStatus,
  NonNullable<ComponentProps<typeof Badge>['variant']>
>

const eventHorseStatusVariant = {
  confirmed: 'outline',
  invited: 'secondary',
  declined: 'neutral',
  withdrawn: 'neutral',
} satisfies Record<
  EventHorseStatus,
  NonNullable<ComponentProps<typeof Badge>['variant']>
>

export function EventStatusBadge({
  status,
  ...props
}: EventBadgeProps & {
  status: EventStatus
}) {
  const t = useT()
  return (
    <Badge variant={eventStatusVariant[status]} {...props}>
      {t(`calendar.${status}`)}
    </Badge>
  )
}

export function EventHorseStatusBadge({
  status = 'confirmed',
  ...props
}: EventBadgeProps & {
  status?: Doc<'eventsHorses'>['status']
}) {
  const t = useT()
  return (
    <Badge variant={eventHorseStatusVariant[status]} {...props}>
      {t(`calendar.${status}`)}
    </Badge>
  )
}

export function EventKindBadge(props: EventBadgeProps) {
  const t = useT()
  return (
    <Badge variant="secondary" {...props}>
      {t('calendar.event')}
    </Badge>
  )
}
