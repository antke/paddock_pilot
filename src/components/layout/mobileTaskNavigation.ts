import { useRouter } from '@tanstack/react-router'
import { smallScreenQuery } from '#/lib/useSmallScreen'

type TaskOrigin = { href: string; index: number; scrollY: number }

declare module '@tanstack/react-router' {
  interface HistoryState {
    taskOrigin?: TaskOrigin
  }
}

export function isLocalTaskOrigin(value: unknown): value is TaskOrigin {
  if (!value || typeof value !== 'object') return false
  const origin = value as TaskOrigin
  return (
    typeof origin.href === 'string' &&
    (origin.href === '/' ||
      /^\/(stables|horses|events|training)(\/|\?|$)/.test(origin.href)) &&
    !origin.href.includes('\\') &&
    Number.isInteger(origin.index) &&
    origin.index >= 0 &&
    Number.isFinite(origin.scrollY) &&
    origin.scrollY >= 0
  )
}

/** Capture when the link is followed, including current filters and history position. */
export function useTaskOriginState() {
  const router = useRouter({ warn: false })
  return () => ({
    taskOrigin: router
      ? {
          href: router.state.location.href,
          index: router.state.location.state.__TSR_index ?? 0,
          scrollY: typeof window === 'undefined' ? 0 : window.scrollY,
        }
      : undefined,
  })
}

export function useMobileTaskReturn(fallback: string) {
  const router = useRouter({ warn: false })
  return (cancel = false) => {
    if (!router || !window.matchMedia?.(smallScreenQuery).matches) return false
    const location = router.state.location
    const origin = location.state.taskOrigin
    if (isLocalTaskOrigin(origin)) {
      if (location.state.__TSR_index === origin.index + 1) {
        router.history.back()
      } else {
        return router
          .navigate({ href: origin.href, replace: true })
          .then(() => {
            window.scrollTo({ top: origin.scrollY })
          })
      }
      return true
    }
    if (cancel) {
      return router.navigate({ href: fallback, replace: true })
    }
    return false
  }
}
