import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'

import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { RoutePending } from '#/components/layout/RoutePending'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { SignedOutRoutePrompt } from '#/components/layout/SignedOutRoutePrompt'
import { OnboardingPage } from '#/components/onboarding/OnboardingPage'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

type OnboardingSearch = {
  stableId?: string
}

export const Route = createFileRoute('/onboarding')({
  validateSearch: (search): OnboardingSearch => ({
    stableId: typeof search.stableId === 'string' ? search.stableId : undefined,
  }),
  component: OnboardingRoute,
})

function OnboardingRoute() {
  const { stableId } = Route.useSearch()

  return (
    <AuthStateSwitch
      signedOut={
        <SignedOutRoutePrompt
          title="Sign in to continue setup"
          description="Your saved onboarding progress will be ready after you sign in."
        />
      }
      signedIn={<OnboardingGate stableId={stableId} />}
    />
  )
}

function OnboardingGate({ stableId }: { stableId?: string }) {
  const user = useQuery(api.users.getCurrentUser)

  if (user === undefined) return <RoutePending />
  if (!user) {
    return (
      <RouteStatusAlert
        tone="muted"
        title="Preparing your account"
        description="Your sign-in is ready. We’re connecting your Paddock Pilot profile before setup begins."
      />
    )
  }

  return stableId ? (
    <StableOnboardingGate stableId={stableId} />
  ) : (
    <OnboardingPage />
  )
}

function StableOnboardingGate({ stableId }: { stableId: string }) {
  const resolvedStableId = useQuery(api.onboarding.resolveStableId, {
    stableId,
  })

  if (resolvedStableId === undefined) return <RoutePending />
  if (!resolvedStableId) {
    return (
      <RouteStatusAlert
        title="Onboarding could not be found"
        description="This setup link is invalid or the stable is no longer available."
      />
    )
  }

  return <OnboardingPage stableId={resolvedStableId as Id<'stables'>} />
}
