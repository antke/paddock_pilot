import {
  DashboardLayoutGrid,
  DashboardLayoutStack,
} from '#/components/dashboard/DashboardLayoutGrid'

import { ActiveStableHeader } from './ActiveStableHeader'
import { HorseRosterCard } from './HorseRosterCard'
import { MiniCalendarCard } from './MiniCalendarCard'
import { CareRemindersSummaryCard, HealthIssuesCard } from './PriorityQueueCard'
import { TodayTrainingCard } from './TodayTrainingCard'
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
        <DashboardLayoutStack>
          <TodayBriefingCard data={data} />
          <TodayTrainingCard data={data} />
          <MiniCalendarCard data={data} />
          <HorseRosterCard data={data} />
        </DashboardLayoutStack>
        <DashboardLayoutStack>
          <HealthIssuesCard data={data} visibleItemLimit={3} />
          <CareRemindersSummaryCard data={data} visibleItemLimit={3} />
        </DashboardLayoutStack>
      </DashboardLayoutGrid>
    </DashboardLayoutStack>
  )
}
