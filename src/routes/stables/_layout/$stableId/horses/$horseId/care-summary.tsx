import { HorseCareSummaryPage } from '#/components/horses/HorseCareSummaryPage'
import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId/care-summary',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId, horseId } = Route.useParams()

  return (
    <HorseCareSummaryPage stableId={stableId} horseId={horseId as Id<'horses'>} />
  )
}
