import { BackLink } from '#/components/ui/back-action'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { useOwnershipCopy } from './ownershipCopy'
import { usePersonalTraining } from './usePersonalTraining'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { TrainingCalendar } from '#/components/training/TrainingCalendar'
import { RoutePending } from '#/components/layout/RoutePending'
import { ButtonLink } from '#/components/ui/button'
import { useT } from '#/i18n/LocaleProvider'
import { useSmallScreen } from '#/lib/useSmallScreen'

export function PersonalTraining() {
  const t = useT()
  const c = useOwnershipCopy()
  const small = useSmallScreen()
  const data = usePersonalTraining()
  if (!data) return <RoutePending />
  return (
    <DashboardPage>
      <DashboardPageHeader
        backAction={<BackLink to="/" />}
        title={t('trainingViews.log')}
        description={!small ? t('trainingViews.logHelp') : undefined}
      />
      {data.horses.length ? (
        <TrainingCalendar {...data} />
      ) : (
        <DashboardEmptyState
          title={c.empty}
          actions={
            <ButtonLink to="/horses/create" action="create">
              {c.add}
            </ButtonLink>
          }
        >
          {c.emptyHelp}
        </DashboardEmptyState>
      )}
    </DashboardPage>
  )
}
