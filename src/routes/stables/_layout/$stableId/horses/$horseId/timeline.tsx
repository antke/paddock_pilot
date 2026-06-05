import { HorseTimelinePage } from '#/components/horses/HorseTimelinePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId/timeline',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId, horseId } = Route.useParams()

  return <HorseTimelinePage stableId={stableId} horseId={horseId} />
}
