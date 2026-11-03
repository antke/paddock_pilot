import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { FloatingCreateShortcut } from '#/components/layout/floatingActionsContext'
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
  /** Further permitted Add actions, shown after Add horse in the title row. */
  extraActions?: ReactNode
}

export function HorseListPage({
  horses,
  stableId,
  extraActions,
}: HorseListPageProps) {
  const t = useT()
  const navigate = useNavigate()
  const taskState = useTaskOriginState()

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={t('horseList.horses')}
        description={t('horseList.stableCount', { count: horses.length })}
        actions={
          <>
            <ButtonLink
              to="/stables/$stableId/horses/create"
              params={{ stableId }}
              action="create"
            >
              {t('horseList.addHorse')}
            </ButtonLink>
            {extraActions}
          </>
        }
      />

      <FloatingCreateShortcut
        label={t('horseList.addHorse')}
        onSelect={() =>
          void navigate({
            to: '/stables/$stableId/horses/create',
            params: { stableId },
            state: taskState,
          })
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
