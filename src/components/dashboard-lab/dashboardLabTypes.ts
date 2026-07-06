import type { Doc } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import type { api } from 'convex/_generated/api'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'

export type DashboardLabChrome = DashboardChrome

export type DashboardLabStable = Doc<'stables'>
export type DashboardLabEvent = Doc<'events'>
export type DashboardLabOverview = FunctionReturnType<
  typeof api.userCareOverview.getForCurrentUser
>
export type DashboardLabHorse = FunctionReturnType<
  typeof api.horses.list
>[number]

export type DashboardLabReminder = DashboardLabOverview['dueReminders'][number]
export type DashboardLabUpcomingEvent =
  DashboardLabOverview['upcomingEvents'][number]
export type DashboardLabAttentionHorse =
  DashboardLabOverview['attentionHorses'][number]

export type DashboardLabData = {
  stable: DashboardLabStable
  stables: Array<DashboardLabStable>
  events: Array<DashboardLabEvent>
  horses: Array<DashboardLabHorse>
  overview: DashboardLabOverview
  upcomingEvents: Array<DashboardLabUpcomingEvent>
  dueReminders: Array<DashboardLabReminder>
  attentionHorses: Array<DashboardLabAttentionHorse>
  todayEvents: Array<DashboardLabEvent>
  weekDays: Array<DashboardLabDay>
  urgentCount: number
}

export type DashboardLabDay = {
  date: Date
  key: string
  label: string
  day: string
  eventCount: number
  events: Array<DashboardLabEvent>
}
