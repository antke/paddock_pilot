import { RoutePending } from '#/components/layout/RoutePending'
import { ClerkLoaded, ClerkLoading, Show } from '@clerk/tanstack-react-start'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'
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
          <h3>Hello sign up</h3>
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

  return (
    <h3>
      Welcome back {user?.firstName} {user?.lastName}
      <br />
      fix weird behaviour on refresh - indicator of a race condition?
    </h3>
  )
}
