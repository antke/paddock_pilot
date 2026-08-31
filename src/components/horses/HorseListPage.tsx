import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { ButtonLink } from '#/components/ui/button'
import { formatCountLabel } from '#/lib/numberDisplay'
import { HorseList } from './HorseList'
import type { HorseListHorse } from './HorseList'

type HorseListPageProps = {
  horses: ReadonlyArray<HorseListHorse>
  stableId: string
}

export function HorseListPage({ horses, stableId }: HorseListPageProps) {
  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Horses"
        description={`${formatCountLabel(horses.length, 'horse')} in this stable.`}
        actions={
          <ButtonLink
            to="/stables/$stableId/horses/create"
            params={{ stableId }}
            action="create"
          >
            Add horse
          </ButtonLink>
        }
      />

      <HorseList horses={horses} stableId={stableId} />

      <DashboardActions
        align="end"
        className="border-t border-border-subtle pt-3"
      >
        <ButtonLink
          to="/stables/$stableId/horses/deleted"
          params={{ stableId }}
          variant="subtle"
        >
          Deleted horses
        </ButtonLink>
      </DashboardActions>
    </DashboardPage>
  )
}
