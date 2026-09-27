import type {
  TrainingEntry,
  TrainingHorse,
} from '#/components/training/trainingCalendarData'
import type { Doc } from 'convex/_generated/dataModel'
import type { FunctionReturnType } from 'convex/server'
import type { api } from 'convex/_generated/api'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'

export type DashboardCommandChrome = DashboardChrome

export type DashboardCommandStable = Doc<'stables'>
export type DashboardCommandEvent = Doc<'events'>
// Calendar projections keep the real event ID for navigation.
export type DashboardCommandScheduleEvent = DashboardCommandEvent & {
  occurrenceKey?: string
}
export type DashboardCommandOverview = FunctionReturnType<
  typeof api.userCareOverview.getForCurrentUser
>
export type DashboardCommandHorse = FunctionReturnType<
  typeof api.horses.list
>[number]

export type DashboardCommandReminder =
  DashboardCommandOverview['dueReminders'][number]
export type DashboardCommandUpcomingEvent =
  DashboardCommandOverview['upcomingEvents'][number]
export type DashboardCommandAttentionHorse =
  DashboardCommandOverview['attentionHorses'][number]

export type DashboardTrainingData = {
  events: Array<Doc<'events'>>
  records: Array<Doc<'trainingRecords'>>
  horses: Array<TrainingHorse>
}

export type DashboardCommandData = {
  todayTraining?: Array<TrainingEntry>
  stable: DashboardCommandStable
  stables: Array<DashboardCommandStable>
  events: Array<DashboardCommandEvent>
  horses: Array<DashboardCommandHorse>
  overview: DashboardCommandOverview
  upcomingEvents: Array<DashboardCommandUpcomingEvent>
  dueReminders: Array<DashboardCommandReminder>
  attentionHorses: Array<DashboardCommandAttentionHorse>
  todayEvents: Array<DashboardCommandScheduleEvent>
  weekDays: Array<DashboardCommandDay>
  urgentCount: number
}

export type DashboardCommandDay = {
  date: Date
  key: string
  label: string
  day: string
  eventCount: number
  events: Array<DashboardCommandScheduleEvent>
}
