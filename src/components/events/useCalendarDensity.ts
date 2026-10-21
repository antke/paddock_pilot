import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

/** Fit normal month rows to their actual available space without scaling text. */
export function useCalendarDensity(weeks: number, period: string) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(120)
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => {
      // Document position stays stable while scrolling. Very short screens retain
      // the readable floor and normal page scrolling, never per-cell scrollbars.
      const top = element.getBoundingClientRect().top + window.scrollY
      const available = window.innerHeight - Math.min(top, 280) - 64
      setHeight(Math.max(108, Math.min(160, Math.floor(available / weeks))))
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
