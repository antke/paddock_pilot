import { HorseList } from '#/components/horses/HorseList'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/horses/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  return <HorseList stableId={stableId} />
}
