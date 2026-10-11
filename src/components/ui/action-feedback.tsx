import type { ReactNode } from 'react'
import { CheckIcon } from '@phosphor-icons/react'
import { Spinner } from './spinner'
import { cn } from '#/lib/utils'

/** Reserves the longest label so an acknowledgement never moves nearby actions. */
export function ActionFeedback({
  label,
  pendingLabel,
  confirmedLabel,
  pending = false,
  confirmed = false,
  icon,
}: {
  label: string
  pendingLabel: string
  confirmedLabel?: string
  pending?: boolean
  confirmed?: boolean
  icon?: ReactNode
}) {
  const phase = pending
    ? 'pending'
    : confirmed && confirmedLabel
      ? 'confirmed'
      : 'idle'
  const content = (active: boolean) =>
    cn(
      'col-start-1 row-start-1 inline-flex min-w-0 items-center justify-center gap-2',
      !active && 'invisible',
    )
  return (
    <span data-slot="action-feedback" className="inline-grid min-w-0">
      <span
        className={content(phase === 'idle')}
        aria-hidden={phase !== 'idle'}
      >
        {icon}
        {label}
      </span>
      <span
        className={content(phase === 'pending')}
        aria-hidden={phase !== 'pending'}
      >
        {pending ? (
          <Spinner aria-hidden="true" />
        ) : (
          <span className="size-4 shrink-0" />
        )}
        {pendingLabel}
      </span>
      {confirmedLabel && (
        <span
          className={content(phase === 'confirmed')}
          aria-hidden={phase !== 'confirmed'}
        >
          <CheckIcon
            weight="bold"
            aria-hidden="true"
            className={cn(
              'size-4',
              phase === 'confirmed' && 'app-success-feedback',
            )}
          />
          {confirmedLabel}
        </span>
      )}
    </span>
  )
}
