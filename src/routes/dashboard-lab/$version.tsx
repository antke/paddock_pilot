import { DashboardLabPage } from '#/components/dashboard-lab/DashboardLabPage'
import { RoutePending } from '#/components/layout/RoutePending'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { buttonVariants } from '#/components/ui/button'
import { ClerkLoaded, ClerkLoading, Show } from '@clerk/tanstack-react-start'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/dashboard-lab/$version')({
  component: () => (
    <Suspense fallback={<RoutePending />}>
      <DashboardLabRoute />
    </Suspense>
  ),
})

function DashboardLabRoute() {
  return (
    <>
      <ClerkLoading>
        <RoutePending />
      </ClerkLoading>

      <ClerkLoaded>
        <Show when="signed-in">
          <DashboardLabPage />
        </Show>
        <Show when="signed-out">
          <SignedOutDashboardLab />
        </Show>
      </ClerkLoaded>
    </>
  )
}

function SignedOutDashboardLab() {
  return (
    <Alert>
      <AlertTitle>Sign in to try the dashboard lab</AlertTitle>
      <AlertDescription className="grid gap-4">
        <span>The dashboard lab uses your active stable data.</span>
        <Link
          to="/sign-in/$"
          params={{ _splat: '' }}
          className={buttonVariants()}
        >
          Sign in
        </Link>
      </AlertDescription>
    </Alert>
  )
}
