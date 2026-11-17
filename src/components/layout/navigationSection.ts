import { useEffect, useSyncExternalStore } from 'react'

/**
 * Personal training sessions share `/events/…` URLs with ordinary events, so the
 * path alone selects Events. A page that knows it shows training claims the
 * Training item for as long as it is mounted.
 */
export type NavigationSection = 'training'

let claimed: NavigationSection | undefined
const listeners = new Set<() => void>()

function setClaimed(section: NavigationSection | undefined) {
  claimed = section
  listeners.forEach((listener) => listener())
}

export function useClaimNavigationSection(
  section: NavigationSection | undefined,
) {
  useEffect(() => {
    if (!section) return
    setClaimed(section)
    return () => setClaimed(undefined)
  }, [section])
}

export function useClaimedNavigationSection() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => claimed,
    () => undefined,
  )
}
