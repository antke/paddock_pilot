import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'
import { UnclaimedHorseForm } from '#/components/ownership/StableOwnershipTools'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/unclaimed',
)({ component: Page })
function Page() {
  const { stableId } = Route.useParams()
  return <UnclaimedHorseForm stableId={stableId as Id<'stables'>} />
}
