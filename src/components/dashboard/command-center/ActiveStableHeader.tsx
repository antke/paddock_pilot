import { DashboardValueBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import type { DashboardCommandData } from './dashboardTypes'

type ActiveStableHeaderProps = {
  data: DashboardCommandData
}

export function ActiveStableHeader({ data }: ActiveStableHeaderProps) {
  const attentionLabel =
    data.urgentCount === 1
      ? '1 item needs attention'
      : `${data.urgentCount} items need attention`
  const eventLabel =
    data.todayEvents.length === 1
      ? '1 event today'
      : `${data.todayEvents.length} events today`
  const hasSummaryBadges = data.urgentCount > 0 || data.todayEvents.length > 0

  return (
    <DashboardPageHeader
      title={data.stable.name}
      titleClassName="break-words"
      badges={
        hasSummaryBadges ? (
          <>
            {data.urgentCount > 0 && (
              <DashboardValueBadge variant="destructive">
                {attentionLabel}
              </DashboardValueBadge>
            )}
            {data.todayEvents.length > 0 && (
              <DashboardValueBadge variant="secondary">
                {eventLabel}
              </DashboardValueBadge>
            )}
          </>
        ) : undefined
      }
      className="py-5 md:py-6"
    />
  )
}
