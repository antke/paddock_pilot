import { Badge } from '#/components/ui/badge'
import { attentionLevelBadgeVariant } from '#/components/dashboard/semanticBadgeVariants'
import { formatCountLabel } from '#/lib/numberDisplay'
import { CheckIcon, ClockIcon } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { ComponentProps } from 'react'
import type {
  HealthIssueSeverity,
  HealthIssueStatus,
} from 'shared/horses/healthIssueSchema'
import type { MedicationRecordStatus } from 'shared/horses/medicationRecordSchema'
import {
  horseHealthIssueSeverityLabels,
  horseHealthIssueStatusLabels,
  horseMedicationStatusLabels,
} from './horseCareLabels'

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
  active: 'destructive',
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
  return (
    <Badge variant={attentionLevelBadgeVariant[severity]} {...props}>
      {horseHealthIssueSeverityLabels[severity]}
    </Badge>
  )
}

export function HealthIssueStatusBadge({
  status,
  ...props
}: CareBadgeProps & {
  status: HealthIssueStatus
}) {
  const StatusIcon = healthIssueStatusIcon[status]

  return (
    <Badge variant={healthIssueStatusVariant[status]} {...props}>
      <StatusIcon className="size-3" weight="bold" />
      {horseHealthIssueStatusLabels[status]}
    </Badge>
  )
}

export function MedicationRecordStatusBadge({
  status,
  ...props
}: CareBadgeProps & {
  status: MedicationRecordStatus
}) {
  return (
    <Badge variant={medicationRecordStatusVariant[status]} {...props}>
      {horseMedicationStatusLabels[status]}
    </Badge>
  )
}

export function HealthIssueKindBadge({
  status,
  ...props
}: CareBadgeProps & {
  status: HealthIssueStatus
}) {
  return (
    <Badge variant={healthIssueKindVariant[status]} {...props}>
      Health issue
    </Badge>
  )
}

export function MedicationRecordKindBadge({
  status,
  ...props
}: CareBadgeProps & {
  status: MedicationRecordStatus
}) {
  return (
    <Badge variant={medicationKindVariant[status]} {...props}>
      Medication
    </Badge>
  )
}

export function WeightRecordKindBadge(props: CareBadgeProps) {
  return (
    <Badge variant="secondary" {...props}>
      Weight
    </Badge>
  )
}

export function BodyConditionScoreBadge({
  score,
  ...props
}: CareBadgeProps & {
  score: number
}) {
  return (
    <Badge variant="outline" {...props}>
      BCS {score}/9
    </Badge>
  )
}

export function NutritionLogKindBadge(props: CareBadgeProps) {
  return (
    <Badge variant="secondary" {...props}>
      Nutrition change
    </Badge>
  )
}

export function NutritionLogDateBadge({
  dateLabel,
  ...props
}: CareBadgeProps & {
  dateLabel: string
}) {
  return (
    <Badge variant="outline" {...props}>
      {dateLabel}
    </Badge>
  )
}

export function MedicationDosageBadge({
  dosage,
  variant = 'outline',
  ...props
}: CareBadgeProps & {
  dosage: string
  variant?: ComponentProps<typeof Badge>['variant']
}) {
  return (
    <Badge variant={variant} {...props}>
      {dosage}
    </Badge>
  )
}

export function MedicationFrequencyBadge({
  frequency,
  ...props
}: CareBadgeProps & {
  frequency: string
}) {
  return (
    <Badge variant="outline" {...props}>
      {frequency}
    </Badge>
  )
}

export function HorseHighIssueCountBadge({
  count,
  ...props
}: CareBadgeProps & {
  count: number
}) {
  return (
    <Badge variant="destructive" {...props}>
      {count} high
    </Badge>
  )
}

export function HorseActiveIssueCountBadge({
  count,
  ...props
}: CareBadgeProps & {
  count: number
}) {
  return (
    <Badge variant="destructive" {...props}>
      {formatCountLabel(count, 'active issue')}
    </Badge>
  )
}

export function HorseOverdueReminderCountBadge({
  count,
  ...props
}: CareBadgeProps & {
  count: number
}) {
  return (
    <Badge variant="warning" {...props}>
      {count} overdue
    </Badge>
  )
}

export function HorseActiveMedicationCountBadge({
  count,
  ...props
}: CareBadgeProps & {
  count: number
}) {
  return (
    <Badge variant="secondary" {...props}>
      {count} medication
    </Badge>
  )
}
