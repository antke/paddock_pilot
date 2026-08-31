import {
  DashboardLayoutGrid,
  DashboardLayoutStack,
} from '#/components/dashboard/DashboardLayoutGrid'

import { ActiveStableHeader } from './ActiveStableHeader'
import { HorseRosterCard } from './HorseRosterCard'
import { MiniCalendarCard } from './MiniCalendarCard'
import { PriorityQueueCard } from './PriorityQueueCard'
import { TodayBriefingCard } from './TodayBriefingCard'
import type { DashboardCommandData } from './dashboardTypes'

type BarnBoardGridProps = {
  data: DashboardCommandData
}

export function BarnBoardGrid({ data }: BarnBoardGridProps) {
  return (
    <DashboardLayoutStack gap="loose">
      <ActiveStableHeader data={data} />

      <DashboardLayoutGrid variant="commandCenter">
        <TodayBriefingCard
          className="xl:col-start-1 xl:row-start-1"
          data={data}
        />
        <PriorityQueueCard
          className="xl:col-start-2 xl:row-span-3 xl:row-start-1"
          data={data}
        />
        <MiniCalendarCard
          className="xl:col-start-1 xl:row-start-2"
          data={data}
        />
        <HorseRosterCard
          className="xl:col-start-1 xl:row-start-3"
          data={data}
        />
      </DashboardLayoutGrid>
    </DashboardLayoutStack>
  )
}
