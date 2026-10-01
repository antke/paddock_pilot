import { useT } from '#/i18n/LocaleProvider'
import { DashboardValueBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import type { DashboardCommandData } from './dashboardTypes'

type ActiveStableHeaderProps = {
  data: DashboardCommandData
}

export function ActiveStableHeader({ data }: ActiveStableHeaderProps) {
  const t = useT()

  const eventLabel = t('dashboard.todayEntries', {
    count: data.todayEvents.length,
  })

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
