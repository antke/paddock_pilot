import { StableAnalysisPage } from '#/components/analysis/StableAnalysisPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/analysis')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  return <StableAnalysisPage stableId={stableId} />
}
