import { useEffect, useRef } from 'react'
import { useAnimate } from 'motion/react'
import { journalMotion, useAppMotion } from './appMotion'

/** Changes animate in place: no stale outgoing content, remounts or lost keyboard focus. */
export function useChangeMotion<T extends HTMLElement>(
  value: string | number | undefined,
  directional = false,
) {
  const [scope, animate] = useAnimate<T>()
  const { enabled, spatial } = useAppMotion()
  const previous = useRef(value)
  useEffect(() => {
    const old = previous.current
    previous.current = value
    if (
      old === value ||
      old === undefined ||
      value === undefined ||
      !enabled ||
      !scope.current
    )
      return
    const direction = value > old ? 1 : -1
    const node = scope.current
    // Responsive calendars keep both device layouts mounted. Animate only the visible one.
    if (node.getClientRects().length === 0) return
    const animation = animate(
      node,
      {
        opacity: [0.7, 1],
        x:
          directional && spatial
            ? [direction * journalMotion.distance, 0]
            : [0, 0],
      },
      { duration: journalMotion.state, ease: journalMotion.ease },
    )
    return () => {
      animation.stop()
      node.style.removeProperty('opacity')
      node.style.removeProperty('transform')
    }
  }, [value, enabled, spatial, directional, scope, animate])
  return scope
}
