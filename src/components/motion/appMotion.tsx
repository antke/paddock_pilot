import { createContext, useContext, useMemo, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { MotionConfig } from 'motion/react'

/** Seconds in JS; corresponding CSS tokens live in styles.css. */
export const journalMotion = {
  feedback: 0.12,
  state: 0.16,
  disclosure: 0.22,
  exit: 0.14,
  confirmation: 0.32,
  distance: 6,
  ease: [0.16, 1, 0.3, 1] as const,
  spring: { type: 'spring', stiffness: 460, damping: 38, mass: 0.7 } as const,
}

const MotionScope = createContext({
  enabled: false,
  spatial: false,
  duration: 0,
})
const query = '(prefers-reduced-motion: reduce)'
const subscribe = (notify: () => void) => {
  const media = window.matchMedia?.(query)
  media?.addEventListener('change', notify)
  return () => media?.removeEventListener('change', notify)
}
const snapshot = () => window.matchMedia?.(query).matches ?? true
const serverSnapshot = () => true

/** Scoped to working application/explicit fixtures, never public pages or studies. */
export function AppMotionProvider({
  children,
  enabled = true,
}: {
  children: ReactNode
  enabled?: boolean
}) {
  const reduced = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  const policy = useMemo(
    () => ({
      enabled,
      spatial: enabled && !reduced,
      duration: enabled ? journalMotion.state : 0,
    }),
    [enabled, reduced],
  )
  return (
    <MotionScope.Provider value={policy}>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: journalMotion.state, ease: journalMotion.ease }}
      >
        {children}
      </MotionConfig>
    </MotionScope.Provider>
  )
}

export function useAppMotion() {
  return useContext(MotionScope)
}
