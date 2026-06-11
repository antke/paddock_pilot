import type { ReactNode } from 'react'
import type { DashboardLabData } from '../dashboardLabTypes'

export function StableMetricStrip({ data }: { data: DashboardLabData }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Horses" value={data.overview.summary.horseCount}>
        Active in this stable
      </MetricCard>
      <MetricCard title="Today" value={data.todayEvents.length}>
        Scheduled items
      </MetricCard>
      <MetricCard title="Due reminders" value={data.overview.summary.dueReminderCount}>
        {data.overview.summary.overdueReminderCount} overdue
      </MetricCard>
      <MetricCard title="High alerts" value={data.overview.summary.highSeverityIssueCount}>
        Horse-level health signals
      </MetricCard>
    </div>
  )
}

function MetricCard({
  title,
  value,
  children,
}: {
  title: string
  value: number
  children: ReactNode
}) {
  return (
    <article className="rounded-panel border border-border-subtle bg-card/75 p-5 shadow-control">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </article>
  )
}
