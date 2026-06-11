import { ActiveStableHero } from '../modules/ActiveStableHero'
import { CareKanbanCard } from '../modules/CareKanbanCard'
import { HorseSpotlightCard } from '../modules/HorseSpotlightCard'
import { HorseRosterCard } from '../modules/HorseRosterCard'
import { MiniCalendarCard } from '../modules/MiniCalendarCard'
import { PriorityQueueCard } from '../modules/PriorityQueueCard'
import { TodayBriefingCard } from '../modules/TodayBriefingCard'
import type { DashboardLabData } from '../dashboardLabTypes'

export type BarnBoardSimplification = 'full' | 'focused' | 'essential' | 'minimal'

type PrototypeProps = {
  data: DashboardLabData
  onActiveStableChange: (stableId: DashboardLabData['stable']['_id']) => void
  simplification?: BarnBoardSimplification
}

const simplificationConfig = {
  full: {
    todayEvents: 5,
    priorityItems: 5,
    horses: 5,
    careItems: 5,
    showCareBoard: true,
    showSpotlight: false,
    showCalendar: true,
    showCalendarInlineEvents: false,
    showCalendarFullWidth: false,
    showCalendarDetails: true,
    compactRoster: false,
    showNextEvent: false,
    showTimeline: true,
  },
  focused: {
    todayEvents: 3,
    priorityItems: 5,
    horses: 5,
    careItems: 5,
    showCareBoard: true,
    showSpotlight: false,
    showCalendar: true,
    showCalendarInlineEvents: true,
    showCalendarFullWidth: true,
    showCalendarDetails: false,
    compactRoster: true,
    showNextEvent: false,
    showTimeline: true,
  },
  essential: {
    todayEvents: 2,
    priorityItems: 5,
    horses: 5,
    careItems: 5,
    showCareBoard: true,
    showSpotlight: false,
    showCalendar: true,
    showCalendarInlineEvents: false,
    showCalendarFullWidth: false,
    showCalendarDetails: false,
    compactRoster: true,
    showNextEvent: true,
    showTimeline: true,
  },
  minimal: {
    todayEvents: 0,
    priorityItems: 5,
    horses: 5,
    careItems: 5,
    showCareBoard: false,
    showSpotlight: false,
    showCalendar: false,
    showCalendarInlineEvents: false,
    showCalendarFullWidth: false,
    showCalendarDetails: false,
    compactRoster: true,
    showNextEvent: false,
    showTimeline: false,
  },
} satisfies Record<BarnBoardSimplification, {
  todayEvents: number
  priorityItems: number
  horses: number
  careItems: number
  showCareBoard: boolean
  showSpotlight: boolean
  showCalendar: boolean
  showCalendarInlineEvents: boolean
  showCalendarFullWidth: boolean
  showCalendarDetails: boolean
  compactRoster: boolean
  showNextEvent: boolean
  showTimeline: boolean
}>

export function BarnBoardGrid({
  data,
  onActiveStableChange,
  simplification = 'focused',
}: PrototypeProps) {
  const config = simplificationConfig[simplification]

  return (
    <div className="grid gap-6">
      <ActiveStableHero data={data} onActiveStableChange={onActiveStableChange} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,1fr)]">
        <div className="grid gap-6">
          <section>
            <TodayBriefingCard
              data={data}
              eventLimit={config.todayEvents}
              showNextEvent={config.showNextEvent}
              showTimeline={config.showTimeline}
            />
          </section>
          <HorseRosterCard
            data={data}
            visibleItemLimit={config.horses}
            compact={config.compactRoster}
          />
          {config.showCareBoard && (
            <CareKanbanCard
              data={data}
              visibleItemLimit={config.careItems}
            />
          )}
        </div>

        <div className="grid gap-6">
          <section>
            <PriorityQueueCard
              data={data}
              visibleItemLimit={config.priorityItems}
            />
          </section>
          {(config.showSpotlight || config.showCalendar) && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
              {config.showSpotlight && <HorseSpotlightCard data={data} />}
              {config.showCalendar && !config.showCalendarFullWidth && (
                <MiniCalendarCard
                  data={data}
                  layout="compact"
                  showSelectedDay={config.showCalendarDetails}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {config.showCalendar && config.showCalendarFullWidth && (
        <MiniCalendarCard
          data={data}
          layout="wide"
          showSelectedDay={config.showCalendarDetails}
          showInlineEvents={config.showCalendarInlineEvents}
        />
      )}
    </div>
  )
}
