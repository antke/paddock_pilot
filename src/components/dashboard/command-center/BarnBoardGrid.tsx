import {
  DashboardLayoutGrid,
  DashboardLayoutStack,
} from '#/components/dashboard/DashboardLayoutGrid'

import { ActiveStableHeader } from './ActiveStableHeader'
import { HorseRosterCard } from './HorseRosterCard'
import { CareRemindersSummaryCard, HealthIssuesCard } from './PriorityQueueCard'
import { TodayTrainingCard } from './TodayTrainingCard'
import { TodayBriefingCard } from './TodayBriefingCard'
import { MobileHealthSummary } from './MobileHealthSummary'
import type { DashboardCommandData } from './dashboardTypes'
import type { ReactNode } from 'react'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { MobileStableDashboard } from './MobileStableDashboard'

type BarnBoardGridProps = {
  data: DashboardCommandData
  setupNotice?: ReactNode
  updates?: ReactNode
}

export function BarnBoardGrid({
  data,
  setupNotice,
  updates,
}: BarnBoardGridProps) {
  const small = useSmallScreen()
  if (small)
    return (
      <MobileStableDashboard
        data={data}
        setupNotice={setupNotice}
        updates={updates}
      />
    )
  return (
    <DashboardLayoutStack gap="loose">
      <ActiveStableHeader data={data} />

      <DashboardLayoutGrid variant="commandCenter">
        <DashboardLayoutStack className="xl:order-1">
          <MobileHealthSummary data={data} />
          <TodayTrainingCard data={data} />
          <TodayBriefingCard data={data} />
          <HorseRosterCard data={data} />
          <CareRemindersSummaryCard
            className="xl:hidden"
            data={data}
            visibleItemLimit={3}
          />
          {setupNotice}
          {updates}
        </DashboardLayoutStack>
        <DashboardLayoutStack className="hidden xl:order-2 xl:grid">
          <HealthIssuesCard data={data} visibleItemLimit={3} />
          <CareRemindersSummaryCard data={data} visibleItemLimit={3} />
        </DashboardLayoutStack>
      </DashboardLayoutGrid>
    </DashboardLayoutStack>
  )
}
