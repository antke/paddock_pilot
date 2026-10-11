import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'
import { HorseManagement } from '#/components/ownership/HorseManagement'

export const Route = createFileRoute('/horses/$horseId/manage')({
  component: Page,
})
function Page() {
  const { horseId } = Route.useParams()
  return <HorseManagement horseId={horseId as Id<'horses'>} />
}
