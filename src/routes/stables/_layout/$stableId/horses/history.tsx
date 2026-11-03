import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'
import { StableHorseHistoryUnavailable } from '#/components/ownership/StableOwnershipTools'

/** Retired destination: old links explain the change and never load horse data. */
export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/history',
)({ component: Page })
function Page() {
  return (
    <StableHorseHistoryUnavailable
      stableId={Route.useParams().stableId as Id<'stables'>}
    />
  )
}
