import { useNavigate } from '@tanstack/react-router'
import { FloatingCreateShortcut } from '#/components/layout/floatingActionsContext'
import { useT } from '#/i18n/LocaleProvider'
import type { Doc } from 'convex/_generated/dataModel'
import { DashboardLayoutGrid } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { ButtonLink } from '#/components/ui/button'
import { NoStablesPrompt } from './NoStablesPrompt'
import type { StableRole } from 'shared/stables/stableAccess'
import { StableGatewayCard } from './StableCard'

export function StableListPage({
  stables,
}: {
  stables: ReadonlyArray<
    Pick<Doc<'stables'>, '_id' | 'name' | 'location'> & {
      viewerRole?: StableRole
    }
  >
}) {
  const t = useT()
  const navigate = useNavigate()

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
      {stables.length > 0 && (
        <FloatingCreateShortcut
          label={t('stables.create')}
          onSelect={() => void navigate({ to: '/stables/create' })}
        />
      )}
      {stables.length === 0 ? (
        <NoStablesPrompt chrome="flat" />
      ) : (
        <DashboardLayoutGrid variant="tiles" aria-label={t('stables.list')}>
          {stables.map((stable) => (
            <StableGatewayCard
              key={stable._id}
              stableId={stable._id}
              name={stable.name}
              location={stable.location}
              viewerRole={stable.viewerRole}
            />
          ))}
        </DashboardLayoutGrid>
      )}
    </DashboardPage>
  )
}
