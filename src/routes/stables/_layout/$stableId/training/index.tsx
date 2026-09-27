import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { TrainingCalendar } from '#/components/training/TrainingCalendar'

export const Route = createFileRoute('/stables/_layout/$stableId/training/')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { horseIds?: Array<string> } => ({
    horseIds: Array.isArray(search.horseIds)
      ? search.horseIds.filter((id): id is string => typeof id === 'string')
      : undefined,
  }),
  component: TrainingLog,
})
function TrainingLog() {
  const { stableId } = Route.useParams()
  const { horseIds } = Route.useSearch()
  const { data } = useSuspenseQuery(
    convexQuery(api.training.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Training log"
        description="Plan sessions, record completed work, and review each horse’s training."
      />
      <TrainingCalendar
        key={`${stableId}:${horseIds?.join(',') ?? ''}`}
        stableId={stableId}
        {...data}
        initialHorseIds={horseIds}
      />
    </DashboardPage>
  )
}
