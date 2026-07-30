import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { HorseList } from '#/components/horses/HorseList'
import { ButtonLink } from '#/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/horses/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Horses"
        actions={
          <ButtonLink
            to="/stables/$stableId/horses/create"
            params={{ stableId }}
            variant="secondary"
          >
            Add horse
          </ButtonLink>
        }
      />

      <DashboardSectionCard contentGap="comfortable">
        <HorseList stableId={stableId} />
      </DashboardSectionCard>
    </DashboardPage>
  )
}
