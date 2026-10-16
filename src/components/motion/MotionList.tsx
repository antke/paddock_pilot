import { forwardRef, useLayoutEffect, useRef } from 'react'
import type { Key, ReactNode } from 'react'
import { AnimatePresence, motion, useIsPresent } from 'motion/react'
import { journalMotion, useAppMotion } from './appMotion'
import { MotionNotice } from './MotionNotice'
import { cn } from '#/lib/utils'

/** Replaces existing div list/listitem markup. No table, link or arbitrary child wrapping. */
export function MotionList<T>({
  items,
  getKey,
  renderItem,
  className,
  empty,
  focusTarget,
}: {
  items: ReadonlyArray<T>
  getKey: (item: T) => Key
  renderItem: (item: T) => ReactNode
  className?: string
  empty?: ReactNode
  focusTarget?: () => HTMLElement | null
}) {
  const { enabled, spatial } = useAppMotion()
  const list = useRef<HTMLDivElement>(null)
  // No stagger or per-frame layout measurements for large collections.
  const bounded = enabled && items.length <= 40
  const identity = JSON.stringify(items.map(getKey))
  return (
    <div
      ref={list}
      role={items.length ? 'list' : undefined}
      tabIndex={-1}
      data-slot="motion-list"
      className={cn(
        'app-record-list relative grid min-w-0 gap-1 outline-none',
        className,
      )}
    >
      {!enabled ? (
        items.map((item) => (
          <div key={getKey(item)} role="listitem" className="min-w-0">
            {renderItem(item)}
          </div>
        ))
      ) : (
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((item) => (
            <MotionListItem
              key={getKey(item)}
              spatial={spatial && bounded}
              enabled={bounded}
              identity={identity}
              focusTarget={() => focusTarget?.() ?? list.current}
            >
              {renderItem(item)}
            </MotionListItem>
          ))}
        </AnimatePresence>
      )}
      <MotionNotice
        show={items.length === 0 && Boolean(empty)}
        className="col-span-full"
      >
        {empty}
      </MotionNotice>
    </div>
  )
}

const MotionListItem = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode
    enabled: boolean
    spatial: boolean
    identity: string
    focusTarget: () => HTMLElement | null
  }
>(function MotionListItemRender(
  { children, enabled, spatial, identity, focusTarget },
  forwardedRef,
) {
  const present = useIsPresent()
  const element = useRef<HTMLDivElement | null>(null)
  const hadFocus = useRef(false)
  useLayoutEffect(() => {
    if (!present && hadFocus.current) {
      const active = document.activeElement
      if (active === document.body || element.current?.contains(active)) {
        focusTarget()?.focus({ preventScroll: true })
      }
    }
  }, [present, focusTarget])
  return (
    <motion.div
      ref={(node) => {
        element.current = node
        if (typeof forwardedRef === 'function') forwardedRef(node)
        else if (forwardedRef) forwardedRef.current = node
      }}
      role="listitem"
      className="min-w-0"
      data-exiting={!present || undefined}
      inert={!present}
      aria-hidden={!present || undefined}
      onFocusCapture={() => {
        hadFocus.current = true
      }}
      onBlurCapture={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          hadFocus.current = false
      }}
      layout={spatial ? 'position' : false}
      layoutDependency={identity}
      initial={enabled ? { opacity: 0.65 } : false}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: enabled ? journalMotion.exit : 0 },
      }}
      transition={{ layout: journalMotion.spring }}
      style={!present ? { pointerEvents: 'none' } : undefined}
    >
      {children}
    </motion.div>
  )
})
