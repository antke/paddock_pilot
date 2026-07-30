import { useLocation } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useConvexAuth, useQuery } from 'convex/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

const ACTIVE_STABLE_STORAGE_KEY = 'paddockPilot.activeStableId'

type AppUserState = {
  activeStable?: Doc<'stables'>
  activeStableId?: Id<'stables'>
  isLoadingStables: boolean
  setActiveStableId: (stableId: Id<'stables'>) => void
  stables: Array<Doc<'stables'>>
}

const AppUserStateContext = createContext<AppUserState | null>(null)

export function AppUserStateProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { isAuthenticated, isLoading: isLoadingAuth } = useConvexAuth()
  const queriedStables = useQuery(
    api.stables.list,
    isAuthenticated ? {} : 'skip',
  )
  const stables = useMemo(() => queriedStables ?? [], [queriedStables])
  const [preferredStableId, setPreferredStableId] = useState<
    Id<'stables'> | undefined
  >(readStoredStableId)

  const routeStableId = getRouteStableId(pathname)
  const activeStable =
    stables.find((stable) => stable._id === routeStableId) ??
    stables.find((stable) => stable._id === preferredStableId) ??
    stables[0]

  useEffect(() => {
    if (!activeStable || activeStable._id === preferredStableId) return

    setPreferredStableId(activeStable._id)
  }, [activeStable, preferredStableId])

  useEffect(() => {
    if (!activeStable) return

    window.localStorage.setItem(ACTIVE_STABLE_STORAGE_KEY, activeStable._id)
  }, [activeStable])

  const setActiveStableId = useCallback((stableId: Id<'stables'>) => {
    setPreferredStableId(stableId)
    window.localStorage.setItem(ACTIVE_STABLE_STORAGE_KEY, stableId)
  }, [])

  const value = useMemo<AppUserState>(
    () => ({
      activeStable,
      activeStableId: activeStable?._id ?? routeStableId ?? preferredStableId,
      isLoadingStables:
        isLoadingAuth || (isAuthenticated && queriedStables === undefined),
      setActiveStableId,
      stables,
    }),
    [
      activeStable,
      isAuthenticated,
      isLoadingAuth,
      queriedStables,
      preferredStableId,
      routeStableId,
      setActiveStableId,
      stables,
    ],
  )

  return (
    <AppUserStateContext.Provider value={value}>
      {children}
    </AppUserStateContext.Provider>
  )
}

export function useAppUserState() {
  const state = useContext(AppUserStateContext)

  if (!state) {
    throw new Error('useAppUserState must be used within AppUserStateProvider')
  }

  return state
}

function getRouteStableId(pathname: string) {
  const match = pathname.match(/^\/stables\/([^/]+)/)
  return match?.[1] as Id<'stables'> | undefined
}

function readStoredStableId() {
  if (typeof window === 'undefined') return undefined

  return (window.localStorage.getItem(ACTIVE_STABLE_STORAGE_KEY) ??
    undefined) as Id<'stables'> | undefined
}
