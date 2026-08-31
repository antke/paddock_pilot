import { useSyncExternalStore } from 'react'

export function isDevFixtureRoute(pathname: string) {
  return (
    pathname === '/style-lab' ||
    pathname.startsWith('/dashboard-lab') ||
    pathname.startsWith('/page-lab')
  )
}

export function isDevAuthBypassEnabled() {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return false
  }

  if (!isDevFixtureRoute(window.location.pathname)) return false

  const isLocalHost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1'

  return (
    isLocalHost ||
    new URLSearchParams(window.location.search).get('devAuthBypass') ===
      'true' ||
    window.localStorage.getItem('paddockPilot.devAuthBypass') === 'true'
  )
}

function subscribeToDevAuthBypass() {
  return () => undefined
}

function getServerDevAuthBypassSnapshot() {
  return false
}

export function useDevAuthBypassEnabled() {
  return useSyncExternalStore(
    subscribeToDevAuthBypass,
    isDevAuthBypassEnabled,
    getServerDevAuthBypassSnapshot,
  )
}
