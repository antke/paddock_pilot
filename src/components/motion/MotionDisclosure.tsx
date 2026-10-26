import { useLayoutEffect, useRef, useState } from 'react'
import type { ComponentProps } from 'react'
import { motion } from 'motion/react'
import { journalMotion, useAppMotion } from './appMotion'

/** Mounted fields keep drafts. Normal block measurement avoids nested-grid WebKit sizing bugs. */
type DisclosureProps = Omit<
  ComponentProps<'div'>,
  'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'
> & {
  open: boolean
}

export function MotionDisclosure(props: DisclosureProps) {
  const { enabled } = useAppMotion()
  if (!enabled) {
    const { open, children, ...rest } = props
    return (
      <div
        {...rest}
        hidden={!open}
        inert={!open}
        aria-hidden={!open}
        data-slot="motion-disclosure"
      >
        {children}
      </div>
    )
  }
  return <MeasuredDisclosure {...props} />
}

function MeasuredDisclosure({ open, children, ...props }: DisclosureProps) {
  const { enabled, spatial } = useAppMotion()
  const content = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()
  const [settledOpen, setSettledOpen] = useState(open)
  useLayoutEffect(() => {
    const node = content.current
    if (!node || !enabled || typeof ResizeObserver === 'undefined') return
    const measure = () => setHeight(node.getBoundingClientRect().height)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [enabled])
  useLayoutEffect(() => {
    setSettledOpen(false)
  }, [open, height])
  return (
    <motion.div
      {...props}
      data-slot="motion-disclosure"
      hidden={!enabled && !open}
      inert={!open}
      aria-hidden={!open}
      initial={false}
      animate={{ height: open ? (enabled ? (height ?? 'auto') : 'auto') : 0 }}
      transition={{
        duration: spatial
          ? open
            ? journalMotion.disclosure
            : journalMotion.exit
          : 0,
        ease: journalMotion.ease,
      }}
      onAnimationComplete={() => setSettledOpen(open)}
      style={{
        ...props.style,
        overflow: open && (settledOpen || !spatial) ? 'visible' : 'clip',
      }}
    >
      <motion.div
        ref={content}
        className="flow-root min-w-0"
        initial={false}
        animate={{ opacity: open ? 1 : 0, y: !open && spatial ? 4 : 0 }}
        transition={{
          duration: open ? journalMotion.state : journalMotion.exit,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
