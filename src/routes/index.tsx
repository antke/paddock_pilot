import { AppDashboard } from '#/components/dashboard/AppDashboard'
import { PublicLandingPage } from '#/components/landing/PublicLandingPage'
import { RoutePending } from '#/components/layout/RoutePending'
import { ClerkLoaded, ClerkLoading, Show } from '@clerk/tanstack-react-start'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
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
    <>
      <ClerkLoading>
        <RoutePending />
      </ClerkLoading>

      <ClerkLoaded>
        <Show when="signed-out">
          <PublicLandingPage />
        </Show>

        <Show when="signed-in">
          <SignedInWelcome />
        </Show>
      </ClerkLoaded>
    </>
  )
}

function SignedInWelcome() {
  const { data: user } = useSuspenseQuery(convexQuery(api.users.getCurrentUser))
  const { data: stables } = useSuspenseQuery(convexQuery(api.stables.list))
  const { data: events } = useSuspenseQuery(convexQuery(api.events.list))

  return <AppDashboard user={user} stables={stables} events={events} />
}
