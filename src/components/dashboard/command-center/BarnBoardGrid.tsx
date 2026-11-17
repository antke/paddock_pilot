import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'

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
  pending?: ReactNode
}

export function BarnBoardGrid({
  data,
  setupNotice,
  updates,
  pending,
}: BarnBoardGridProps) {
  const small = useSmallScreen()
  if (small)
    return (
      <MobileStableDashboard
        data={data}
        setupNotice={setupNotice}
        updates={updates}
        pending={pending}
      />
    )
  return (
    <DashboardLayoutStack>
      <ActiveStableHeader data={data} />

      {/* Two independent stacks, so each card keeps its own height and gaps stay equal. */}
      <div className="grid items-start gap-[var(--app-section-gap)] xl:grid-cols-2">
        <DashboardLayoutStack className="hidden xl:grid">
          <HealthIssuesCard data={data} visibleItemLimit={3} />
          <CareRemindersSummaryCard data={data} visibleItemLimit={3} />
          <HorseRosterCard data={data} />
        </DashboardLayoutStack>
        <DashboardLayoutStack>
          <MobileHealthSummary data={data} />
          <CareRemindersSummaryCard
            className="xl:hidden"
            data={data}
            visibleItemLimit={3}
          />
          {/* Pending decisions follow urgent care but take one column, not a full-width band. */}
          {pending}
          <TodayBriefingCard data={data} />
          <TodayTrainingCard data={data} />
          <HorseRosterCard className="xl:hidden" data={data} />
          {setupNotice}
          {updates}
        </DashboardLayoutStack>
      </div>
    </DashboardLayoutStack>
  )
}
