import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DeletedHorsesCard } from '#/components/stables/DeletedHorsesCard'
import { ButtonLink } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/deleted',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const { data: deletedHorses } = useSuspenseQuery(
    convexQuery(api.horses.listDeleted, {
      stableId: stableId as Id<'stables'>,
    }),
  )

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Deleted horses"
        actions={
          <ButtonLink
            to="/stables/$stableId/horses"
            params={{ stableId }}
            variant="outline"
          >
            Back to horses
          </ButtonLink>
        }
      />

      <DeletedHorsesCard horses={deletedHorses} />
    </DashboardPage>
  )
}
