import { Badge } from '#/components/ui/badge'
import { attentionLevelBadgeVariant } from '#/components/dashboard/semanticBadgeVariants'
import { CheckIcon, ClockIcon, WarningIcon, XIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { ComponentProps } from 'react'
import {
  careReminderCategoryLabels,
  careReminderPriorityLabels,
} from 'shared/reminders/careReminderSchema'
import type {
  CareReminderCategory,
  CareReminderPriority,
  CareReminderStatus,
} from 'shared/reminders/careReminderSchema'
import { getCareReminderStateLabel } from './careReminderDisplay'

type CareReminderBadgeProps = Omit<
  ComponentProps<typeof Badge>,
  'children' | 'size' | 'variant'
>

const careReminderStatusVariant = {
  pending: 'info',
  completed: 'success',
  dismissed: 'neutral',
} satisfies Record<
  CareReminderStatus,
  NonNullable<ComponentProps<typeof Badge>['variant']>
>

const careReminderStatusIcon = {
  pending: ClockIcon,
  completed: CheckIcon,
  dismissed: XIcon,
} satisfies Record<CareReminderStatus, Icon>

export function CareReminderCategoryBadge({
  category,
  ...props
}: CareReminderBadgeProps & {
  category: CareReminderCategory
}) {
  return (
    <Badge variant="neutral" {...props}>
      {careReminderCategoryLabels[category]}
    </Badge>
  )
}

export function CareReminderPriorityBadge({
  priority,
  ...props
}: CareReminderBadgeProps & {
  priority: CareReminderPriority
}) {
  return (
    <Badge variant={attentionLevelBadgeVariant[priority]} {...props}>
      {careReminderPriorityLabels[priority]}
    </Badge>
  )
}

export function CareReminderStatusBadge({
  status,
  overdue,
  ...props
}: CareReminderBadgeProps & {
  status: CareReminderStatus
  overdue: boolean
}) {
  const StatusIcon = overdue ? WarningIcon : careReminderStatusIcon[status]

  return (
    <Badge
      variant={overdue ? 'destructive' : careReminderStatusVariant[status]}
      {...props}
    >
      <StatusIcon className="size-3" weight="bold" />
      {getCareReminderStateLabel({ status, overdue })}
    </Badge>
  )
}
