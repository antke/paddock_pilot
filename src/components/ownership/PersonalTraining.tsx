import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { useOwnershipCopy } from './ownershipCopy'
import { ButtonLink } from '#/components/ui/button'
import {
  ActivityCalendarFilter,
  useActivityCalendars,
} from '#/components/events/ActivityCalendarFilter'
import { MyActivityInvitations } from '#/components/events/ActivityPeople'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { TrainingCalendar } from '#/components/training/TrainingCalendar'
import { useT } from '#/i18n/LocaleProvider'
import { useSmallScreen } from '#/lib/useSmallScreen'

export function PersonalTraining() {
  const t = useT()
  const c = useOwnershipCopy()
  const small = useSmallScreen()
  const calendars = useActivityCalendars(true)
  const data = calendars.data ?? { horses: [], events: [], records: [] }
  return (
    <DashboardPage>
      <DashboardPageHeader
        showWorkspace={false}
        title={t('trainingViews.log')}
        description={!small ? t('trainingViews.logHelp') : undefined}
      />
      <ActivityCalendarFilter
        stables={calendars.stables}
        selected={calendars.selected}
        onChange={calendars.setSelected}
        loading={calendars.loading}
      />
      <MyActivityInvitations invitationsOnly />
      {calendars.data && !data.horses.length && calendars.personal && (
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
      <div
        aria-busy={calendars.loading}
        hidden={Boolean(
          calendars.data && !data.horses.length && calendars.personal,
        )}
      >
        <TrainingCalendar {...data} />
      </div>
    </DashboardPage>
  )
}
