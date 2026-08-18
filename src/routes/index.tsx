import { AppDashboard } from '#/components/dashboard/AppDashboard'
import { PublicLandingPage } from '#/components/landing/PublicLandingPage'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { RoutePending } from '#/components/layout/RoutePending'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'
import { Suspense } from 'react'

export const Route = createFileRoute('/')({
  component: () => (
    <Suspense fallback={<RoutePending />}>
      <HomePage />
    </Suspense>
  ),
})

function HomePage() {
  return (
    <AuthStateSwitch
      signedOut={<PublicLandingPage />}
      signedIn={<SignedInWelcome />}
    />
  )
}

function SignedInWelcome() {
  const user = useQuery(api.users.getCurrentUser)

  if (user === undefined || !user) return <RoutePending />

  return <SignedInDashboard />
}

function SignedInDashboard() {
  const { data: stables } = useSuspenseQuery(convexQuery(api.stables.list))
  const { data: events } = useSuspenseQuery(convexQuery(api.events.list))
  const { data: nextOnboarding } = useSuspenseQuery(
    convexQuery(api.onboarding.getNextIncompleteStable),
  )

  if (stables.length === 0) return <Navigate to="/onboarding" />
  if (nextOnboarding) {
    return (
      <Navigate
        to="/onboarding"
        search={{ stableId: nextOnboarding.stableId }}
      />
    )
  }

  return <AppDashboard stables={stables} events={events} />
}
