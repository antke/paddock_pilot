import { useLocale, useT } from '#/i18n/LocaleProvider'
import { Badge } from '#/components/ui/badge'
import { attentionLevelBadgeVariant } from '#/components/dashboard/semanticBadgeVariants'
import { CheckIcon, ClockIcon, WarningIcon, XIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '#/lib/utils'
import type {
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

export function CareReminderPriorityBadge({
  priority,
  ...props
}: CareReminderBadgeProps & {
  priority: CareReminderPriority
}) {
  const t = useT()
  return (
    <Badge variant={attentionLevelBadgeVariant[priority]} {...props}>
      {t(`careLabels.priority.${priority}`)}
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
  const { locale } = useLocale()
  const StatusIcon = overdue ? WarningIcon : careReminderStatusIcon[status]

  return (
    <Badge
      variant={overdue ? 'destructive' : careReminderStatusVariant[status]}
      {...props}
    >
      <StatusIcon aria-hidden="true" className="size-3" weight="bold" />
      {getCareReminderStateLabel({ status, overdue }, locale)}
    </Badge>
  )
}

/** Due line that carries the overdue state itself, so rows need no separate Overdue badge. */
export function CareReminderDueText({
  dueDate,
  overdue,
  className,
  children,
}: {
  dueDate: string
  overdue: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <time
      dateTime={dueDate}
      className={cn(
        overdue &&
          'inline-flex items-center gap-1 font-semibold text-destructive',
        className,
      )}
    >
      {overdue && (
        <WarningIcon aria-hidden="true" className="size-3.5" weight="bold" />
      )}
      {children}
    </time>
  )
}
