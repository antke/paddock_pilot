import { cn } from '#/lib/utils'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

type ScrollableListProps = {
  ariaLabel?: string
  children: ReactNode
  itemCount: number
  visibleItemLimit?: number
  estimatedItemHeightRem?: number
  fillParent?: boolean
  className?: string
}

function ScrollableList({
  children,
  ariaLabel = 'Scrollable list',
  itemCount,
  visibleItemLimit = 5,
  estimatedItemHeightRem = 4.25,
  fillParent = false,
  className,
}: ScrollableListProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
  })
  const shouldConstrain = itemCount > visibleItemLimit
  const usesViewportConstraint = fillParent || shouldConstrain

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport || !usesViewportConstraint) {
      setScrollState((current) => {
        if (!current.canScrollUp && !current.canScrollDown) return current
        return { canScrollUp: false, canScrollDown: false }
      })
      return
    }

    const nextState = {
      canScrollUp: viewport.scrollTop > 1,
      canScrollDown:
        viewport.scrollTop + viewport.clientHeight < viewport.scrollHeight - 1,
    }

    setScrollState((current) => {
      if (
        current.canScrollUp === nextState.canScrollUp &&
        current.canScrollDown === nextState.canScrollDown
      ) {
        return current
      }

      return nextState
    })
  }, [usesViewportConstraint])

  useEffect(() => {
    updateScrollState()
  }, [children, updateScrollState])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(updateScrollState)
    observer.observe(viewport)
    if (viewport.firstElementChild) observer.observe(viewport.firstElementChild)
    return () => observer.disconnect()
  }, [updateScrollState])

  return (
    <div
      data-slot="scrollable-list"
      className={cn(
        'relative min-h-0',
        fillParent && 'h-full',
        usesViewportConstraint && 'overflow-hidden rounded-row',
      )}
    >
      <div
        data-slot="scrollable-list-viewport"
        ref={viewportRef}
        role={usesViewportConstraint ? 'region' : undefined}
        aria-label={usesViewportConstraint ? ariaLabel : undefined}
        tabIndex={usesViewportConstraint ? 0 : undefined}
        onScroll={updateScrollState}
        className={cn(
          'app-record-list grid content-start gap-1',
          fillParent && 'h-full min-h-0',
          usesViewportConstraint &&
            'overflow-y-auto outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/25 [scrollbar-width:thin]',
          className,
        )}
        style={
          shouldConstrain && !fillParent
            ? { maxHeight: `${visibleItemLimit * estimatedItemHeightRem}rem` }
            : undefined
        }
      >
        {children}
      </div>

      {scrollState.canScrollUp && (
        <div
          data-slot="scrollable-list-top-fade"
          className="pointer-events-none absolute inset-x-0 top-0 h-8 rounded-t-row bg-gradient-to-b from-foreground/10 to-transparent"
        />
      )}
      {scrollState.canScrollDown && (
        <div
          data-slot="scrollable-list-bottom-fade"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-8 rounded-b-row bg-gradient-to-t from-foreground/10 to-transparent"
        />
      )}
    </div>
  )
}

export { ScrollableList }
export type { ScrollableListProps }
