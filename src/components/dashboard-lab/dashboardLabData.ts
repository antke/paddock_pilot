import { getTodayDateKey } from '#/lib/dateDisplay'
import { createDashboardCommandData } from '#/components/dashboard/command-center/dashboardData'
import type {
  DashboardLabData,
  DashboardLabEvent,
  DashboardLabHorse,
  DashboardLabOverview,
  DashboardLabStable,
} from './dashboardLabTypes'

export function createDashboardLabData({
  stable,
  stables,
  events,
  horses,
  overview,
  todayKey = getTodayDateKey(),
}: {
  stable: DashboardLabStable
  stables: Array<DashboardLabStable>
  events: Array<DashboardLabEvent>
  horses: Array<DashboardLabHorse>
  overview: DashboardLabOverview
  todayKey?: string
}): DashboardLabData {
  return createDashboardCommandData({
    stable,
    stables,
    events,
    horses,
    overview,
    todayKey,
  })
}
