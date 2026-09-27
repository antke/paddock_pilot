import { DashboardSection } from '#/components/dashboard/DashboardSection'
import type { Doc } from 'convex/_generated/dataModel'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { ButtonLink } from '#/components/ui/button'
import { NoStablesPrompt } from './NoStablesPrompt'
import { StableCardLink } from './StableCard'

export function StableListPage({
  stables,
}: {
  stables: ReadonlyArray<Pick<Doc<'stables'>, '_id' | 'name' | 'location'>>
}) {
  return (
    <DashboardPage>
      <DashboardPageHeader
        title="All stables"
        actions={
          stables.length > 0 ? (
            <ButtonLink to="/stables/create" action="create">
              Create stable
            </ButtonLink>
          ) : undefined
        }
      />
      {stables.length === 0 ? (
        <NoStablesPrompt chrome="flat" />
      ) : (
        <DashboardSection aria-label="Stable list">
          <DashboardItemList>
            {stables.map((stable) => (
              <StableCardLink
                key={stable._id}
                stableId={stable._id}
                name={stable.name}
                location={stable.location}
              />
            ))}
          </DashboardItemList>
        </DashboardSection>
      )}
    </DashboardPage>
  )
}
