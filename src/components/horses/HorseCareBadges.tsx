import { useT } from '#/i18n/LocaleProvider'
import { Badge } from '#/components/ui/badge'
import { attentionLevelBadgeVariant } from '#/components/dashboard/semanticBadgeVariants'
import { CheckIcon, ClockIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { ComponentProps } from 'react'
import type {
  HealthIssueSeverity,
  HealthIssueStatus,
} from 'shared/horses/healthIssueSchema'
import type { MedicationRecordStatus } from 'shared/horses/medicationRecordSchema'

type CareBadgeProps = Omit<
  ComponentProps<typeof Badge>,
  'children' | 'size' | 'variant'
>

const healthIssueStatusVariant = {
  active: 'info',
  resolved: 'success',
} satisfies Record<
  HealthIssueStatus,
  NonNullable<ComponentProps<typeof Badge>['variant']>
>

const healthIssueStatusIcon = {
  active: ClockIcon,
  resolved: CheckIcon,
} satisfies Record<HealthIssueStatus, Icon>

const medicationRecordStatusVariant = {
  active: 'info',
  completed: 'success',
} satisfies Record<
  MedicationRecordStatus,
  NonNullable<ComponentProps<typeof Badge>['variant']>
>

const healthIssueKindVariant = {
  active: 'info',
  resolved: 'secondary',
} satisfies Record<
  HealthIssueStatus,
  NonNullable<ComponentProps<typeof Badge>['variant']>
>

const medicationKindVariant = {
  active: 'default',
  completed: 'secondary',
} satisfies Record<
  MedicationRecordStatus,
  NonNullable<ComponentProps<typeof Badge>['variant']>
>

export function HealthIssueSeverityBadge({
  severity,
  ...props
}: CareBadgeProps & {
  severity: HealthIssueSeverity
}) {
  const t = useT()
  return (
    <Badge variant={attentionLevelBadgeVariant[severity]} {...props}>
      {t(`careLabels.severity.${severity}`)}
    </Badge>
  )
}

export function HealthIssueStatusBadge({
  status,
  ...props
}: CareBadgeProps & {
  status: HealthIssueStatus
}) {
  const t = useT()
  const StatusIcon = healthIssueStatusIcon[status]

  return (
    <Badge variant={healthIssueStatusVariant[status]} {...props}>
      <StatusIcon aria-hidden="true" className="size-3" weight="bold" />
      {t(`careLabels.healthStatus.${status}`)}
    </Badge>
  )
}

export function MedicationRecordStatusBadge({
  status,
  ...props
}: CareBadgeProps & {
  status: MedicationRecordStatus
}) {
  const t = useT()
  return (
    <Badge variant={medicationRecordStatusVariant[status]} {...props}>
      {t(`careLabels.medicationStatus.${status}`)}
    </Badge>
  )
}

export function HealthIssueKindBadge({
  status,
  ...props
}: CareBadgeProps & {
  status: HealthIssueStatus
}) {
  const t = useT()
  return (
    <Badge variant={healthIssueKindVariant[status]} {...props}>
      {t('careLabels.healthIssue')}
    </Badge>
  )
}

export function MedicationRecordKindBadge({
  status,
  ...props
}: CareBadgeProps & {
  status: MedicationRecordStatus
}) {
  const t = useT()
  return (
    <Badge variant={medicationKindVariant[status]} {...props}>
      {t('careLabels.medication')}
    </Badge>
  )
}

export function WeightRecordKindBadge(props: CareBadgeProps) {
  const t = useT()
  return (
    <Badge variant="secondary" {...props}>
      {t('careLabels.weight')}
    </Badge>
  )
}

export function NutritionLogKindBadge(props: CareBadgeProps) {
  const t = useT()
  return (
    <Badge variant="secondary" {...props}>
      {t('careLabels.nutritionChange')}
    </Badge>
  )
}

export function HorseHighIssueCountBadge({
  count,
  ...props
}: CareBadgeProps & {
  count: number
}) {
  const t = useT()
  return (
    <Badge variant="destructive" {...props}>
      {t('careLabels.highCount', { count })}
    </Badge>
  )
}

export function HorseOverdueReminderCountBadge({
  count,
  ...props
}: CareBadgeProps & {
  count: number
}) {
  const t = useT()
  return (
    <Badge variant="warning" {...props}>
      {t('careLabels.overdueCount', { count })}
    </Badge>
  )
}
