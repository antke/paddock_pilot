import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { FloatingCreateShortcut } from '#/components/layout/floatingActionsContext'
import { useT } from '#/i18n/LocaleProvider'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
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
            {/* Quiet text link before Add, like a dashboard's See all link. */}
            <ButtonLink
              to="/stables/$stableId/horses/deleted"
              params={{ stableId }}
              variant="ghost"
              size="sm"
              className="min-h-10 border-0 px-0 hover:bg-transparent hover:text-primary active:bg-transparent dark:hover:bg-transparent"
            >
              {t('horseList.deleted')}
            </ButtonLink>
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

      <DashboardSectionCard
        surface="canvas"
        role="region"
        aria-label={t('horseList.list')}
      >
        <HorseList horses={horses} stableId={stableId} />
      </DashboardSectionCard>
    </DashboardPage>
  )
}
