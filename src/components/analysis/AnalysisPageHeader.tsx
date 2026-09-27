import { Construction } from 'lucide-react'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'

export function AnalysisPageHeader() {
  return (
    <div className="grid gap-5">
      <DashboardPageHeader title="Analysis Centre" />
      <div
        role="note"
        className="flex items-center gap-4 rounded-panel border border-status-warning/30 bg-status-warning-surface p-5 text-status-warning sm:p-6"
      >
        <Construction aria-hidden="true" className="size-8 shrink-0" />
        <p className="text-2xl font-bold leading-tight sm:text-3xl">
          Work in progress
        </p>
      </div>
    </div>
  )
}
