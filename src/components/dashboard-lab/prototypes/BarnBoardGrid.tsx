import { ActiveStableHero } from '../modules/ActiveStableHero'
import { CareKanbanCard } from '../modules/CareKanbanCard'
import { HorseRosterCard } from '../modules/HorseRosterCard'
import { MiniCalendarCard } from '../modules/MiniCalendarCard'
import { PriorityQueueCard } from '../modules/PriorityQueueCard'
import { TodayBriefingCard } from '../modules/TodayBriefingCard'
import type { DashboardLabData } from '../dashboardLabTypes'

type PrototypeProps = {
  data: DashboardLabData
  onActiveStableChange: (stableId: DashboardLabData['stable']['_id']) => void
}

const config = {
  todayEvents: 5,
  priorityItems: 5,
  horses: 5,
  careItems: 5,
  showCareBoard: true,
  showCalendar: true,
  showCalendarInlineEvents: false,
  showCalendarFullWidth: false,
  showCalendarDetails: true,
  compactRoster: false,
  showNextEvent: false,
  showTimeline: true,
  chrome: 'soft',
} as const

export function BarnBoardGrid({ data, onActiveStableChange }: PrototypeProps) {
  return (
    <div className="grid gap-6">
      <ActiveStableHero
        data={data}
        onActiveStableChange={onActiveStableChange}
        chrome={config.chrome}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,1fr)]">
        <div className="grid gap-6">
          <section>
            <TodayBriefingCard
              data={data}
              eventLimit={config.todayEvents}
              showNextEvent={config.showNextEvent}
              showTimeline={config.showTimeline}
              chrome={config.chrome}
            />
          </section>
          <HorseRosterCard
            data={data}
            visibleItemLimit={config.horses}
            compact={config.compactRoster}
            chrome={config.chrome}
          />
          {config.showCareBoard && (
            <CareKanbanCard
              data={data}
              visibleItemLimit={config.careItems}
              chrome={config.chrome}
            />
          )}
        </div>

        <div className="grid gap-6">
          <section>
            <PriorityQueueCard
              data={data}
              visibleItemLimit={config.priorityItems}
              chrome={config.chrome}
            />
          </section>
          {config.showCalendar && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
              {config.showCalendar && !config.showCalendarFullWidth && (
                <MiniCalendarCard
                  data={data}
                  layout="compact"
                  showSelectedDay={config.showCalendarDetails}
                  chrome={config.chrome}
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
          chrome={config.chrome}
        />
      )}
    </div>
  )
}
