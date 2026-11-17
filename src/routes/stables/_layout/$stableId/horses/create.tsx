import { createFileRoute } from '@tanstack/react-router'
import { HorseCreateForm } from '#/components/horses/HorseCreateForm'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/create',
)({ component: RouteComponent })

function RouteComponent() {
  const { stableId } = Route.useParams()
  return <HorseCreateForm key={stableId} initialStableId={stableId} />
}
