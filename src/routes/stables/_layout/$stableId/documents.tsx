import { StableDocumentsPage } from '#/components/documents/StableDocumentsPage'
import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/stables/_layout/$stableId/documents')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  return <StableDocumentsPage stableId={stableId as Id<'stables'>} />
}
