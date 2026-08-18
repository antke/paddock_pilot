import { Navigate, useLocation } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

import { RoutePending } from './RoutePending'

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
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : 'skip',
  )
  const ensureCurrentUser = useMutation(api.users.ensureCurrentUser)
  const queriedStables = useQuery(api.stables.list, currentUser ? {} : 'skip')
  const nextIncompleteStable = useQuery(
    api.onboarding.getNextIncompleteStable,
    currentUser ? {} : 'skip',
  )
  const stables = useMemo(() => queriedStables ?? [], [queriedStables])
  const [preferredStableId, setPreferredStableId] = useState<
    Id<'stables'> | undefined
  >(readStoredStableId)

  useEffect(() => {
    if (!isAuthenticated || currentUser !== null) return

    let cancelled = false
    let retryId: number | undefined
    const bootstrapUser = async () => {
      try {
        await ensureCurrentUser()
      } catch {
        if (!cancelled) {
          retryId = window.setTimeout(() => void bootstrapUser(), 2_000)
        }
      }
    }

    void bootstrapUser()

    return () => {
      cancelled = true
      if (retryId !== undefined) window.clearTimeout(retryId)
    }
  }, [currentUser, ensureCurrentUser, isAuthenticated])

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
        isLoadingAuth ||
        (isAuthenticated &&
          (currentUser === undefined ||
            currentUser === null ||
            queriedStables === undefined ||
            nextIncompleteStable === undefined)),
      setActiveStableId,
      stables,
    }),
    [
      activeStable,
      isAuthenticated,
      isLoadingAuth,
      currentUser,
      nextIncompleteStable,
      queriedStables,
      preferredStableId,
      routeStableId,
      setActiveStableId,
      stables,
    ],
  )

  const onboardingRedirect =
    isAuthenticated &&
    currentUser &&
    queriedStables !== undefined &&
    nextIncompleteStable !== undefined &&
    !isStableSetupExemptPath(pathname)
      ? queriedStables.length === 0
        ? { stableId: undefined }
        : nextIncompleteStable
          ? { stableId: nextIncompleteStable.stableId }
          : undefined
      : undefined
  const stableSetupPending = Boolean(
    isAuthenticated &&
      currentUser &&
      !isStableSetupExemptPath(pathname) &&
      (queriedStables === undefined || nextIncompleteStable === undefined),
  )

  return (
    <AppUserStateContext.Provider value={value}>
      {stableSetupPending ? (
        <RoutePending />
      ) : onboardingRedirect ? (
        <Navigate
          to="/onboarding"
          search={{ stableId: onboardingRedirect.stableId }}
          replace
        />
      ) : (
        children
      )}
    </AppUserStateContext.Provider>
  )
}

function isStableSetupExemptPath(pathname: string) {
  return [
    '/onboarding',
    '/invitations/',
    '/pricing',
    '/sign-in',
    '/sign-up',
  ].some((path) => pathname === path || pathname.startsWith(path))
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
