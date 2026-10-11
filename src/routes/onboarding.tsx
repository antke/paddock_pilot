import { useT } from '#/i18n/LocaleProvider'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'

import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { RoutePending } from '#/components/layout/RoutePending'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { SignedOutRoutePrompt } from '#/components/layout/SignedOutRoutePrompt'
import { PersonalOnboarding } from '#/components/ownership/PersonalOnboarding'
import { OnboardingPage } from '#/components/onboarding/OnboardingPage'
import { api } from 'convex/_generated/api'
import { onboardingReturnTo } from '#/components/layout/accountRouting'

type OnboardingSearch = {
  stableId?: string
  returnTo?: string
}

export const Route = createFileRoute('/onboarding')({
  validateSearch: (search): OnboardingSearch => ({
    stableId: typeof search.stableId === 'string' ? search.stableId : undefined,
    returnTo: onboardingReturnTo(search.returnTo),
  }),
  component: OnboardingRoute,
})

function OnboardingRoute() {
  const t = useT()

  const { stableId, returnTo } = Route.useSearch()

  return (
    <AuthStateSwitch
      signedOut={
        <SignedOutRoutePrompt
          title={t('onboarding.signInTitle')}
          description={t('onboarding.signInHelp')}
        />
      }
      signedIn={<OnboardingGate stableId={stableId} returnTo={returnTo} />}
    />
  )
}

function OnboardingGate({ stableId, returnTo }: OnboardingSearch) {
  const t = useT()

  const user = useQuery(api.users.getCurrentUser)

  if (user === undefined) return <RoutePending />
  if (!user) {
    return (
      <RouteStatusAlert
        tone="muted"
        title={t('onboarding.preparingAccount')}
        description={t('onboarding.preparingAccountHelp')}
      />
    )
  }

  return stableId ? (
    <StableOnboardingGate stableId={stableId} />
  ) : (
    <PersonalOnboarding key={returnTo ?? 'start'} returnTo={returnTo} />
  )
}

function StableOnboardingGate({ stableId }: { stableId: string }) {
  const t = useT()

  const resolvedStableId = useQuery(api.onboarding.resolveStableId, {
    stableId,
  })

  if (resolvedStableId === undefined) return <RoutePending />
  if (!resolvedStableId) {
    return (
      <RouteStatusAlert
        title={t('onboarding.notFound')}
        description={t('onboarding.invalidLink')}
      />
    )
  }

  return <OnboardingPage stableId={resolvedStableId} />
}
