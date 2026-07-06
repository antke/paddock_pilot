import { PageLabPage } from '#/components/page-lab/PageLabPage'
import { RoutePending } from '#/components/layout/RoutePending'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { buttonVariants } from '#/components/ui/button'
import { ClerkLoaded, ClerkLoading, Show } from '@clerk/tanstack-react-start'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'

export const Route = createFileRoute('/page-lab/$page')({
  component: () => (
    <Suspense fallback={<RoutePending />}>
      <PageLabRoute />
    </Suspense>
  ),
})

function PageLabRoute() {
  const { page } = Route.useParams()

  return (
    <>
      <ClerkLoading>
        <RoutePending />
      </ClerkLoading>

      <ClerkLoaded>
        <Show when="signed-in">
          <PageLabPage pageId={page} />
        </Show>
        <Show when="signed-out">
          <SignedOutPageLab />
        </Show>
      </ClerkLoaded>
    </>
  )
}

function SignedOutPageLab() {
  return (
    <Alert>
      <AlertTitle>Sign in to try the page lab</AlertTitle>
      <AlertDescription className="grid gap-4">
        <span>The page lab uses your active stable data.</span>
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
