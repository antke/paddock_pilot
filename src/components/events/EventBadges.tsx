import { Badge } from '#/components/ui/badge'
import type { Doc } from 'convex/_generated/dataModel'
import type { ComponentProps } from 'react'
import { eventStatusLabels } from 'shared/events/eventSchema'
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

export function EventKindBadge(props: EventBadgeProps) {
  return (
    <Badge variant="secondary" {...props}>
      Event
    </Badge>
  )
}
