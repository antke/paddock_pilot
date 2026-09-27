import { DashboardValueBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import type { DashboardCommandData } from './dashboardTypes'

type ActiveStableHeaderProps = {
  data: DashboardCommandData
}

export function ActiveStableHeader({ data }: ActiveStableHeaderProps) {
  const eventLabel =
    data.todayEvents.length === 1
      ? '1 calendar entry today'
      : `${data.todayEvents.length} calendar entries today`

  return (
    <DashboardPageHeader
      title={data.stable.name}
      titleClassName="break-words"
      badges={
        data.todayEvents.length > 0 ? (
          <DashboardValueBadge variant="secondary">
            {eventLabel}
          </DashboardValueBadge>
        ) : undefined
      }
      className="py-5 md:py-6"
    />
  )
}
