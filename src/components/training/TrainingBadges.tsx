import { useT } from '#/i18n/LocaleProvider'
import {
  CheckCircleIcon,
  ClockIcon,
  QuestionIcon,
  ProhibitIcon,
} from '@phosphor-icons/react'
import type {
  TrainingActivity,
  TrainingDisplayStatus,
} from 'shared/training/trainingSchema'

const activityColors: Record<TrainingActivity, string> = {
  flatwork: 'var(--chart-1)',
  jumping: 'var(--chart-2)',
  groundwork: 'var(--chart-3)',
  hacking: 'var(--chart-4)',
  lunging: 'var(--chart-5)',
  other: 'var(--muted-foreground)',
}
export function TrainingActivityDot({
  activity,
}: {
  activity: TrainingActivity
}) {
  return (
    <span
      aria-hidden="true"
      className="size-2 shrink-0 rounded-full"
      style={{ backgroundColor: activityColors[activity] }}
    />
  )
}

export function TrainingActivityTag({
  activity,
}: {
  activity: TrainingActivity
}) {
  const t = useT()
  const color = activityColors[activity]
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-control px-2 py-0.5 text-xs font-medium leading-5 text-foreground [overflow-wrap:anywhere]"
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 18%, var(--card))`,
      }}
    >
      <TrainingActivityDot activity={activity} />
      {t(`training.activities.${activity}`)}
    </span>
  )
}
export function TrainingStatusBadge({
  status,
  iconOnly = false,
}: {
  status: TrainingDisplayStatus
  iconOnly?: boolean
}) {
  const t = useT()
  const Icon =
    status === 'completed'
      ? CheckCircleIcon
      : status === 'planned'
        ? ClockIcon
        : status === 'unconfirmed'
          ? QuestionIcon
          : ProhibitIcon
  return (
    <span className="inline-flex min-w-0 items-start gap-1.5 text-xs font-medium leading-5">
      <Icon
        aria-hidden="true"
        weight={status === 'completed' ? 'fill' : 'regular'}
        className="size-5 shrink-0"
      />
      <span className={iconOnly ? 'sr-only' : undefined}>
        {t(`training.status.${status}`)}
      </span>
    </span>
  )
}
