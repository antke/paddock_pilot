import { DashboardLabPage } from '#/components/dashboard-lab/DashboardLabPage'
import { RoutePending } from '#/components/layout/RoutePending'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { buttonVariants } from '#/components/ui/button'
import { ClerkLoaded, ClerkLoading, Show } from '@clerk/tanstack-react-start'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import type { DashboardLabVersion } from '#/components/dashboard-lab/dashboardLabTypes'

export const Route = createFileRoute('/dashboard-lab/$version')({
  component: () => (
    <Suspense fallback={<RoutePending />}>
      <DashboardLabRoute />
    </Suspense>
  ),
})

const validVersions = new Set(['1', '2', '3', '4'])

function DashboardLabRoute() {
  const { version } = Route.useParams()
  const labVersion: DashboardLabVersion = validVersions.has(version)
    ? (version as DashboardLabVersion)
    : '1'

  return (
    <>
      <ClerkLoading>
        <RoutePending />
      </ClerkLoading>

      <ClerkLoaded>
        <Show when="signed-in">
          <DashboardLabPage version={labVersion} />
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
        <span>The dashboard concepts use your active stable data.</span>
        <Link to="/sign-in/$" params={{ _splat: '' }} className={buttonVariants()}>
          Sign in
        </Link>
      </AlertDescription>
    </Alert>
  )
}
