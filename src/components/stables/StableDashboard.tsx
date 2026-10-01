import { useLocale } from '#/i18n/LocaleProvider'
import { createDashboardCommandData } from '#/components/dashboard/command-center/dashboardData'
import type {
  DashboardCommandEvent,
  DashboardCommandHorse,
  DashboardCommandOverview,
  DashboardCommandStable,
  DashboardTrainingData,
} from '#/components/dashboard/command-center/dashboardTypes'
import { StableCommandCenter } from '#/components/dashboard/command-center/StableCommandCenter'
import { DashboardPage } from '#/components/dashboard/DashboardPage'

type StableDashboardProps = {
  stable: DashboardCommandStable
  stables: Array<DashboardCommandStable>
  horses: Array<DashboardCommandHorse>
  events: Array<DashboardCommandEvent>
  overview: DashboardCommandOverview
  training: DashboardTrainingData
  todayKey: string
}

export function StableDashboard({
  stable,
  stables,
  horses,
  events,
  overview,
  todayKey,
  training,
}: StableDashboardProps) {
  const { locale } = useLocale()
  const data = createDashboardCommandData({
    locale,
    stable,
    stables,
    horses,
    events,
    overview,
    todayKey,
    training,
  })

  return (
    <DashboardPage>
      <StableCommandCenter data={data} />
    </DashboardPage>
  )
}
