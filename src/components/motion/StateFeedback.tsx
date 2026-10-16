import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, useAnimate } from 'motion/react'
import { journalMotion, useAppMotion } from './appMotion'

/** Animate the existing node, never duplicate live text or remount interactive contents. */
export function StateFeedback({
  value,
  children,
  className,
}: {
  value: string | number
  children: ReactNode
  className?: string
}) {
  const { enabled, spatial } = useAppMotion()
  const [scope, animate] = useAnimate<HTMLSpanElement>()
  const previous = useRef(value)
  useEffect(() => {
    if (previous.current === value) return
    previous.current = value
    if (!enabled || !scope.current) return
    const node = scope.current
    const animation = animate(
      node,
      { opacity: [0.65, 1], y: spatial ? [2, 0] : [0, 0] },
      { duration: journalMotion.state, ease: journalMotion.ease },
    )
    return () => {
      animation.stop()
      node.style.removeProperty('opacity')
      node.style.removeProperty('transform')
    }
  }, [value, enabled, spatial, animate, scope])
  return (
    <span
      ref={scope}
      className={['inline-block', className].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  )
}

/** Journal check: only callers with an acknowledged local action should mount this. */
export function ConfirmedCheck({ final = false }: { final?: boolean }) {
  const { spatial, duration } = useAppMotion()
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      initial={false}
      animate={{ scale: spatial ? [0.85, 1.06, 1] : 1 }}
      transition={{ duration: spatial ? journalMotion.confirmation : duration }}
    >
      {final && (
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ pathLength: spatial ? 0 : 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: journalMotion.confirmation }}
        />
      )}
      <motion.path
        d="m6.5 12 3.5 3.5 7.5-7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: spatial ? 0 : 1 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: journalMotion.confirmation,
          ease: journalMotion.ease,
        }}
      />
    </motion.svg>
  )
}
