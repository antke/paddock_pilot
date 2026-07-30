import type { ComponentProps } from 'react'

import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { cn } from '#/lib/utils'

type DashboardTablePanelProps = ComponentProps<typeof DashboardInlinePanel>

export function DashboardTablePanel({
  chrome = 'soft',
  className,
  padding = 'none',
  ...props
}: DashboardTablePanelProps) {
  return (
    <DashboardInlinePanel
      data-slot="dashboard-table-panel"
      chrome={chrome}
      padding={padding}
      className={cn('overflow-hidden', className)}
      {...props}
    />
  )
}
