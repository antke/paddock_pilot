import { useT } from '#/i18n/LocaleProvider'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { ButtonLink } from '#/components/ui/button'
import { HorseList } from './HorseList'
import type { HorseListHorse } from './HorseList'

type HorseListPageProps = {
  horses: ReadonlyArray<HorseListHorse>
  stableId: string
}

export function HorseListPage({ horses, stableId }: HorseListPageProps) {
  const t = useT()

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={t('horseList.horses')}
        description={t('horseList.stableCount', { count: horses.length })}
        actions={
          <ButtonLink
            to="/stables/$stableId/horses/create"
            params={{ stableId }}
            action="create"
          >
            {t('horseList.addHorse')}
          </ButtonLink>
        }
      />

      <DashboardSection aria-label={t('horseList.list')}>
        <HorseList horses={horses} stableId={stableId} />
      </DashboardSection>

      <DashboardActions
        align="end"
        className="border-t border-border-subtle pt-3"
      >
        <ButtonLink
          to="/stables/$stableId/horses/deleted"
          params={{ stableId }}
          variant="subtle"
        >
          {t('horseList.deleted')}
        </ButtonLink>
      </DashboardActions>
    </DashboardPage>
  )
}
