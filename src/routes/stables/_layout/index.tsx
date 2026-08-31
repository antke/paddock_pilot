import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { NoStablesPrompt } from '#/components/stables/NoStablesPrompt'
import { StableCardLink } from '#/components/stables/StableCard'
import { ButtonLink } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { isEmpty } from 'lodash'

export const Route = createFileRoute('/stables/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: stables } = useSuspenseQuery(convexQuery(api.stables.list))

  if (isEmpty(stables)) {
    return <NoStablesPrompt />
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="All stables"
        actions={
          <ButtonLink to="/stables/create" action="create">
            Create stable
          </ButtonLink>
        }
      />

      <DashboardSectionCard contentGap="comfortable">
        <DashboardItemList gap="flush">
          {stables.map((stable) => (
            <StableCardLink
              key={stable._id}
              stableId={stable._id}
              name={stable.name}
              location={stable.location}
            />
          ))}
        </DashboardItemList>
      </DashboardSectionCard>
    </DashboardPage>
  )
}
