import { useSyncExternalStore } from 'react'

export const smallScreenQuery = '(max-width: 47.999rem)'

function subscribe(callback: () => void) {
  const media = window.matchMedia?.(smallScreenQuery)
  media?.addEventListener?.('change', callback)
  return () => media?.removeEventListener?.('change', callback)
}

/** Layout capability, not device detection. One content tree at either width. */
export function useSmallScreen() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia?.(smallScreenQuery).matches ?? false,
    () => false,
  )
}
