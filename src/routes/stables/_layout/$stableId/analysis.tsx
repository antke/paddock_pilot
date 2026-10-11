import { StableAnalysisPage } from '#/components/analysis/StableAnalysisPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/analysis')({
  validateSearch: (search: Record<string, unknown>): { horseId?: string } => ({
    horseId:
      typeof search.horseId === 'string' &&
      search.horseId.length > 0 &&
      search.horseId.length <= 250
        ? search.horseId
        : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const { horseId } = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <StableAnalysisPage
      stableId={stableId}
      selectedHorseId={horseId}
      onHorseChange={(next) => void navigate({ search: { horseId: next } })}
    />
  )
}
