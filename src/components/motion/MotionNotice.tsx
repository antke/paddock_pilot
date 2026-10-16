import type { ReactNode } from 'react'
import { useState } from 'react'
import { AnimatePresence, motion, useIsPresent } from 'motion/react'
import { journalMotion, useAppMotion } from './appMotion'

/** Removes hidden notices from accessibility/input immediately; retains only their visual exit. */
export function MotionNotice({
  show,
  children,
  className,
}: {
  show: boolean
  children: ReactNode
  className?: string
}) {
  const { enabled } = useAppMotion()
  if (!enabled) return show ? children : null
  return (
    <AnimatePresence initial={false}>
      {show && (
        <Notice key="notice" className={className}>
          {children}
        </Notice>
      )}
    </AnimatePresence>
  )
}
function Notice({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const present = useIsPresent()
  const { spatial } = useAppMotion()
  const [settled, setSettled] = useState(true)
  return (
    <motion.div
      className={className}
      inert={!present}
      aria-hidden={!present || undefined}
      initial={{ opacity: 0.7, height: spatial ? 0 : 'auto' }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{
        opacity: 0,
        height: spatial ? 0 : 'auto',
        transition: { duration: journalMotion.exit },
      }}
      transition={{
        duration: journalMotion.disclosure,
        ease: journalMotion.ease,
      }}
      onAnimationStart={() => setSettled(false)}
      onAnimationComplete={() => setSettled(true)}
      style={{
        overflow: present && settled ? 'visible' : 'clip',
        pointerEvents: present ? undefined : 'none',
      }}
    >
      {children}
    </motion.div>
  )
}
