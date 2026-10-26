import { useT } from '#/i18n/LocaleProvider'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DeletedHorsesCard } from '#/components/stables/DeletedHorsesCard'
import { BackLink } from '#/components/ui/back-action'
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
  const t = useT()

  const { stableId } = Route.useParams()
  const { data: deletedHorses } = useSuspenseQuery(
    convexQuery(api.horses.listDeleted, {
      stableId: stableId as Id<'stables'>,
    }),
  )

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={t('horseDeletion.deletedHorses')}
        backAction={
          <BackLink to="/stables/$stableId/horses" params={{ stableId }}>
            {t('uiRemainder.backHorses')}
          </BackLink>
        }
      />

      <DeletedHorsesCard horses={deletedHorses} />
    </DashboardPage>
  )
}
