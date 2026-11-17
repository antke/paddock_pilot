import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

/** Fit normal month rows to their actual available space without scaling text. */
export function useCalendarDensity(weeks: number, period: string) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(130)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => {
      // Document position stays stable while scrolling. Very short screens retain
      // the readable floor and normal page scrolling, never per-cell scrollbars.
      // The floor fits two two-line entries (or one above an overflow action).
      const top = element.getBoundingClientRect().top + window.scrollY
      // Reserve only the weekday row (~36px) and the collapsed legend with its gap (~64px) plus a
      // small margin, so rows grow into the space instead of leaving a strip under the last week.
      const available = window.innerHeight - Math.min(top, 280) - 120
      setHeight(Math.max(130, Math.min(160, Math.floor(available / weeks))))
    }
    measure()
    window.addEventListener('resize', measure)
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(measure)
    observer?.observe(element)
    return () => {
      window.removeEventListener('resize', measure)
      observer?.disconnect()
    }
  }, [weeks, period])
  return {
    ref,
    style: { '--calendar-row-height': `${height}px` } as CSSProperties,
  }
}
