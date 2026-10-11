import { HorseCareSummaryPage } from '#/components/horses/HorseCareSummaryPage'
import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/horses/$horseId/care-summary')({
  component: RouteComponent,
})

function RouteComponent() {
  const { horseId } = Route.useParams()

  return <HorseCareSummaryPage horseId={horseId as Id<'horses'>} />
}
