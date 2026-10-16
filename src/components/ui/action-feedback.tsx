import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { ConfirmedCheck } from '#/components/motion/StateFeedback'
import { useAppMotion } from '#/components/motion/appMotion'
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
  const { duration } = useAppMotion()
  const phase = pending
    ? 'pending'
    : confirmed && confirmedLabel
      ? 'confirmed'
      : 'idle'
  const content = () =>
    cn(
      'col-start-1 row-start-1 inline-flex min-w-0 items-center justify-center gap-2',
    )
  return (
    <span data-slot="action-feedback" className="inline-grid min-w-0">
      <motion.span
        initial={false}
        animate={{ opacity: phase === 'idle' ? 1 : 0 }}
        transition={{ duration }}
        className={content()}
        aria-hidden={phase !== 'idle'}
      >
        {icon}
        {label}
      </motion.span>
      <motion.span
        initial={false}
        animate={{ opacity: phase === 'pending' ? 1 : 0 }}
        transition={{ duration }}
        className={content()}
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
          animate={{ opacity: phase === 'confirmed' ? 1 : 0 }}
          transition={{ duration }}
          className={content()}
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
    </span>
  )
}
