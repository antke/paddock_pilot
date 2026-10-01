import { useT } from '#/i18n/LocaleProvider'
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
  const t = useT()

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={t('stables.all')}
        actions={
          stables.length > 0 ? (
            <ButtonLink to="/stables/create" action="create">
              {t('stables.create')}
            </ButtonLink>
          ) : undefined
        }
      />
      {stables.length === 0 ? (
        <NoStablesPrompt chrome="flat" />
      ) : (
        <DashboardSection aria-label={t('stables.list')}>
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
