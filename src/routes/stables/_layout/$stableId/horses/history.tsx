import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'
import { StableHorseHistory } from '#/components/ownership/StableOwnershipTools'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/history',
)({ component: Page })
function Page() {
  return (
    <StableHorseHistory
      stableId={Route.useParams().stableId as Id<'stables'>}
    />
  )
}
