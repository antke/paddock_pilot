import {
  DashboardLayoutGrid,
  DashboardLayoutStack,
} from '#/components/dashboard/DashboardLayoutGrid'

import { ActiveStableHeader } from './ActiveStableHeader'
import { CareKanbanCard } from './CareKanbanCard'
import { HorseRosterCard } from './HorseRosterCard'
import { MiniCalendarCard } from './MiniCalendarCard'
import { PriorityQueueCard } from './PriorityQueueCard'
import { TodayBriefingCard } from './TodayBriefingCard'
import type { DashboardCommandData } from './dashboardTypes'

type BarnBoardGridProps = {
  data: DashboardCommandData
}

const config = {
  todayEvents: 5,
  priorityItems: 5,
  horses: 5,
  careItems: 5,
  showCareBoard: true,
  showCalendar: true,
  showCalendarInlineEvents: false,
  showCalendarDetails: true,
  showNextEvent: false,
  showTimeline: true,
  chrome: 'cards',
} as const

export function BarnBoardGrid({ data }: BarnBoardGridProps) {
  return (
    <DashboardLayoutStack>
      <ActiveStableHeader data={data} />

      <DashboardLayoutGrid
        variant="commandBento"
        className="xl:h-[min(70vh,48rem)]"
      >
        <DashboardLayoutStack className="min-h-0 xl:grid-rows-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <TodayBriefingCard
            className="h-full min-h-0 overflow-hidden xl:grid-rows-[auto_minmax(0,1fr)]"
            data={data}
            eventLimit={config.todayEvents}
            showNextEvent={config.showNextEvent}
            showTimeline={config.showTimeline}
            chrome={config.chrome}
          />
          <HorseRosterCard
            className="h-full min-h-0 overflow-hidden xl:grid-rows-[auto_minmax(0,1fr)]"
            data={data}
            visibleItemLimit={config.horses}
            chrome={config.chrome}
          />
        </DashboardLayoutStack>

        <PriorityQueueCard
          className="h-full min-h-0 xl:grid-rows-[auto_minmax(0,1fr)]"
          data={data}
          visibleItemLimit={config.priorityItems}
          chrome={config.chrome}
        />
      </DashboardLayoutGrid>

      {config.showCalendar && (
        <MiniCalendarCard
          data={data}
          layout="wide"
          showSelectedDay={config.showCalendarDetails}
          showInlineEvents={config.showCalendarInlineEvents}
          chrome={config.chrome}
        />
      )}

      {config.showCareBoard && (
        <CareKanbanCard
          data={data}
          visibleItemLimit={config.careItems}
          chrome={config.chrome}
        />
      )}
    </DashboardLayoutStack>
  )
}
