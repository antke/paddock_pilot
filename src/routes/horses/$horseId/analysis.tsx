import { createFileRoute } from '@tanstack/react-router'
import { HorseComparisonExplorer } from '#/components/analysis/HorseComparisonExplorer'

export const Route = createFileRoute('/horses/$horseId/analysis')({
  component: Page,
})
function Page() {
  const { horseId } = Route.useParams()
  return <HorseComparisonExplorer horseId={horseId} />
}
