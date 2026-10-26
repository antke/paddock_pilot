import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { WarningCircleIcon } from '@phosphor-icons/react'
import { ConfirmedCheck } from '#/components/motion/StateFeedback'
import { useAppMotion } from '#/components/motion/appMotion'
import { Spinner } from './spinner'

/** Reserves the longest label so an acknowledgement never moves nearby actions. */
export function ActionFeedback({
  label,
  pendingLabel,
  confirmedLabel,
  pending = false,
  confirmed = false,
  failed = false,
  failedLabel,
  icon,
}: {
  label: string
  pendingLabel: string
  confirmedLabel?: string
  pending?: boolean
  confirmed?: boolean
  failed?: boolean
  failedLabel?: string
  icon?: ReactNode
}) {
  const { duration, spatial } = useAppMotion()
  const phase = pending
    ? 'pending'
    : failed
      ? 'failed'
      : confirmed && confirmedLabel
        ? 'confirmed'
        : 'idle'
  const content =
    'col-start-1 row-start-1 inline-flex min-w-0 items-center justify-center gap-2'
  const state = (slot: typeof phase) => ({
    opacity: phase === slot ? 1 : 0,
    y: spatial && phase !== slot ? 4 : 0,
  })
  return (
    <span
      data-slot="action-feedback"
      data-phase={phase}
      className="inline-grid min-w-0"
    >
      <motion.span
        initial={false}
        animate={state('idle')}
        transition={{ duration }}
        className={content}
        aria-hidden={phase !== 'idle'}
      >
        {icon}
        {label}
      </motion.span>
      <motion.span
        initial={false}
        animate={state('pending')}
        transition={{ duration }}
        className={content}
        aria-hidden={phase !== 'pending'}
      >
        {pending ? (
          <Spinner aria-hidden="true" />
        ) : (
          <span className="size-4 shrink-0" />
        )}
        {pendingLabel}
      </motion.span>
      {confirmedLabel && (
        <motion.span
          initial={false}
          animate={state('confirmed')}
          transition={{ duration }}
          className={content}
          aria-hidden={phase !== 'confirmed'}
        >
          {phase === 'confirmed' ? (
            <ConfirmedCheck />
          ) : (
            <span className="size-5 shrink-0" />
          )}
          {confirmedLabel}
        </motion.span>
      )}
      {(failedLabel || failed) && (
        <motion.span
          initial={false}
          animate={state('failed')}
          transition={{ duration }}
          className={content}
          aria-hidden={phase !== 'failed'}
        >
          <WarningCircleIcon aria-hidden="true" className="size-4 shrink-0" />
          {failedLabel ?? label}
        </motion.span>
      )}
    </span>
  )
}
