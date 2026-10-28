import {
  ActivityCalendarFilter,
  useActivityCalendars,
} from '#/components/events/ActivityCalendarFilter'
import { MyActivityInvitations } from '#/components/events/ActivityPeople'
import { useT } from '#/i18n/LocaleProvider'
import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { TrainingCalendar } from '#/components/training/TrainingCalendar'
import { useSmallScreen } from '#/lib/useSmallScreen'

export const Route = createFileRoute('/stables/_layout/$stableId/training/')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { horseIds?: Array<string> } => ({
    horseIds: Array.isArray(search.horseIds)
      ? search.horseIds.filter((id): id is string => typeof id === 'string')
      : undefined,
  }),
  component: TrainingLog,
})
function TrainingLog() {
  const t = useT()
  const small = useSmallScreen()

  const { stableId } = Route.useParams()
  const { horseIds } = Route.useSearch()
  const calendars = useActivityCalendars(true, stableId)
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
      <TrainingCalendar
        key={`${stableId}:${horseIds?.join(',') ?? ''}`}
        stableId={stableId}
        {...(calendars.data ?? { horses: [], events: [], records: [] })}
        mixedSources={calendars.mixedSources}
        initialHorseIds={horseIds}
      />
    </DashboardPage>
  )
}
