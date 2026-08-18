import { Badge } from '#/components/ui/badge'
import { formatCurrencyAmount } from '#/lib/numberDisplay'
import type { Doc } from 'convex/_generated/dataModel'
import type { ComponentProps } from 'react'
import { eventStatusLabels, eventTypeLabels } from 'shared/events/eventSchema'
import type { EventStatus, EventType } from 'shared/events/eventSchema'

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

const eventHorseStatusLabels = {
  confirmed: 'Confirmed',
  invited: 'Invited',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
} satisfies Record<EventHorseStatus, string>

const eventHorseStatusVariant = {
  confirmed: 'outline',
  invited: 'secondary',
  declined: 'neutral',
  withdrawn: 'neutral',
} satisfies Record<
  EventHorseStatus,
  NonNullable<ComponentProps<typeof Badge>['variant']>
>

export function EventTypeBadge({
  type,
  ...props
}: EventBadgeProps & {
  type: EventType
}) {
  return (
    <Badge variant="outline" {...props}>
      {eventTypeLabels[type]}
    </Badge>
  )
}

export function EventStatusBadge({
  status,
  ...props
}: EventBadgeProps & {
  status: EventStatus
}) {
  return (
    <Badge variant={eventStatusVariant[status]} {...props}>
      {eventStatusLabels[status]}
    </Badge>
  )
}

export function EventHorseStatusBadge({
  status = 'confirmed',
  ...props
}: EventBadgeProps & {
  status?: Doc<'eventsHorses'>['status']
}) {
  return (
    <Badge variant={eventHorseStatusVariant[status]} {...props}>
      {eventHorseStatusLabels[status]}
    </Badge>
  )
}

export function EventCostShareBadge({
  costShare,
  ...props
}: EventBadgeProps & {
  costShare: number
}) {
  return (
    <Badge variant="secondary" {...props}>
      Cost {formatCurrencyAmount(costShare)}
    </Badge>
  )
}

export function EventKindBadge(props: EventBadgeProps) {
  return (
    <Badge variant="secondary" {...props}>
      Event
    </Badge>
  )
}

export function EventRecurringBadge(props: EventBadgeProps) {
  return (
    <Badge variant="secondary" {...props}>
      Recurring
    </Badge>
  )
}

export function EventRepeatsBadge(props: EventBadgeProps) {
  return (
    <Badge variant="secondary" {...props}>
      Repeats
    </Badge>
  )
}
