import { createDashboardCommandData } from '#/components/dashboard/command-center/dashboardData'
import type {
  DashboardCommandEvent,
  DashboardCommandHorse,
  DashboardCommandOverview,
  DashboardCommandStable,
} from '#/components/dashboard/command-center/dashboardTypes'
import { StableCommandCenter } from '#/components/dashboard/command-center/StableCommandCenter'
import { DashboardPage } from '#/components/dashboard/DashboardPage'

type StableDashboardProps = {
  stable: DashboardCommandStable
  stables: Array<DashboardCommandStable>
  horses: Array<DashboardCommandHorse>
  events: Array<DashboardCommandEvent>
  overview: DashboardCommandOverview
  todayKey: string
}

export function StableDashboard({
  stable,
  stables,
  horses,
  events,
  overview,
  todayKey,
}: StableDashboardProps) {
  const data = createDashboardCommandData({
    stable,
    stables,
    horses,
    events,
    overview,
    todayKey,
  })

  return (
    <DashboardPage>
      <StableCommandCenter data={data} />
    </DashboardPage>
  )
}
