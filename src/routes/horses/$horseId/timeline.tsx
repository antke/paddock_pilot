import { HorseTimelinePage } from '#/components/horses/HorseTimelinePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/horses/$horseId/timeline')({
  component: RouteComponent,
})

function RouteComponent() {
  const { horseId } = Route.useParams()

  return <HorseTimelinePage horseId={horseId} />
}
