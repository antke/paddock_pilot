import { PageLabPage } from '#/components/page-lab/PageLabPage'
import { LabRouteBoundary } from '#/components/lab/LabChrome'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/page-lab/$page')({
  component: PageLabRoute,
})

function PageLabRoute() {
  const { page } = Route.useParams()

  return (
    <LabRouteBoundary
      signedOutTitle="Sign in to try the page lab"
      signedOutDescription="The page lab uses your active stable data."
    >
      <PageLabPage pageId={page} />
    </LabRouteBoundary>
  )
}
