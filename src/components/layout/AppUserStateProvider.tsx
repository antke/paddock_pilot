import { Navigate, useLocation } from '@tanstack/react-router'
import { useAuth } from '@clerk/tanstack-react-start'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useAction, useConvexAuth, useQuery } from 'convex/react'
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
import { RouteStatusAlert } from './RouteStatusAlert'
import { Button } from '#/components/ui/button'

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
  const { userId: clerkUserId } = useAuth()
  const { isAuthenticated, isLoading: isLoadingAuth } = useConvexAuth()
  const identity = useQuery(
    api.users.getCurrentIdentity,
    isAuthenticated ? {} : 'skip',
  )
  const currentUser = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : 'skip',
  )
  const syncCurrentUser = useAction(api.users.syncCurrentUser)
  const [syncedUserId, setSyncedUserId] = useState<string>()
  const [syncError, setSyncError] = useState(false)
  const [syncAttempt, setSyncAttempt] = useState(0)
  const pendingInvitations = useQuery(
    api.stableInvitations.listForCurrentUser,
    currentUser && syncedUserId === clerkUserId ? {} : 'skip',
  )
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
    setSyncedUserId(undefined)
    setSyncError(false)
    if (!isAuthenticated || !clerkUserId || identity?.subject !== clerkUserId)
      return

    let cancelled = false
    const bootstrapUser = async () => {
      try {
        await syncCurrentUser()
        if (!cancelled) setSyncedUserId(clerkUserId)
      } catch {
        if (!cancelled) setSyncError(true)
      }
    }

    void bootstrapUser()

    return () => {
      cancelled = true
    }
  }, [
    clerkUserId,
    identity?.subject,
    syncCurrentUser,
    isAuthenticated,
    syncAttempt,
  ])

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
  const checkInvitations =
    isAuthenticated && currentUser && !isInvitationExemptPath(pathname)
  const invitationRedirect = checkInvitations
    ? pendingInvitations?.[0]
    : undefined
  const stableSetupPending = Boolean(
    isAuthenticated &&
    currentUser &&
    !isStableSetupExemptPath(pathname) &&
    (queriedStables === undefined || nextIncompleteStable === undefined),
  )
  const accountPending = Boolean(
    clerkUserId &&
    (isLoadingAuth ||
      !isAuthenticated ||
      syncedUserId !== clerkUserId ||
      currentUser?.clerkId !== clerkUserId),
  )

  return (
    <AppUserStateContext.Provider value={value}>
      {syncError && clerkUserId ? (
        <RouteStatusAlert
          title="Could not prepare your account"
          description="We couldn’t refresh your account details. Try again to review invitations and continue."
          actions={
            <Button onClick={() => setSyncAttempt((attempt) => attempt + 1)}>
              Try again
            </Button>
          }
        />
      ) : accountPending ||
        (checkInvitations && pendingInvitations === undefined) ? (
        <RoutePending />
      ) : invitationRedirect ? (
        <Navigate
          to="/invitations/$token"
          params={{ token: invitationRedirect.token }}
          replace
        />
      ) : stableSetupPending ? (
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
    '/stables/create',
  ].some((path) => pathname === path || pathname.startsWith(path))
}

function isInvitationExemptPath(pathname: string) {
  return ['/invitations/', '/pricing', '/sign-in', '/sign-up'].some(
    (path) => pathname === path || pathname.startsWith(path),
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
