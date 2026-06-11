import { cn } from '#/lib/utils'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

type ScrollableListProps = {
  children: ReactNode
  itemCount: number
  visibleItemLimit?: number
  estimatedItemHeightRem?: number
  className?: string
}

function ScrollableList({
  children,
  itemCount,
  visibleItemLimit = 5,
  estimatedItemHeightRem = 4.25,
  className,
}: ScrollableListProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState({
    canScrollUp: false,
    canScrollDown: false,
  })
  const shouldConstrain = itemCount > visibleItemLimit

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current
    if (!viewport || !shouldConstrain) {
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
  }, [shouldConstrain])

  useEffect(() => {
    updateScrollState()
  }, [children, updateScrollState])

  return (
    <div
      className={cn(
        'relative',
        shouldConstrain && 'overflow-hidden rounded-row',
      )}
    >
      <div
        ref={viewportRef}
        onScroll={updateScrollState}
        className={cn(
          'grid gap-2',
          shouldConstrain &&
            'overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          className,
        )}
        style={
          shouldConstrain
            ? { maxHeight: `${visibleItemLimit * estimatedItemHeightRem}rem` }
            : undefined
        }
      >
        {children}
      </div>

      {scrollState.canScrollUp && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-8 rounded-t-row bg-gradient-to-b from-foreground/10 to-transparent" />
      )}
      {scrollState.canScrollDown && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 rounded-b-row bg-gradient-to-t from-foreground/10 to-transparent" />
      )}
    </div>
  )
}

export { ScrollableList }
export type { ScrollableListProps }
