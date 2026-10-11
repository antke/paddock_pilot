import { PersonalHome } from '#/components/ownership/PersonalHome'
import { PublicLandingPage } from '#/components/landing/PublicLandingPage'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { RoutePending } from '#/components/layout/RoutePending'
import { createFileRoute } from '@tanstack/react-router'
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

  return <PersonalHome />
}
