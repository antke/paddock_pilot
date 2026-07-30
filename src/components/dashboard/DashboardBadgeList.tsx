import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'

type DashboardBadgeListAlign = 'start' | 'end'
type DashboardBadgeListGap = 'compact' | 'default'

type DashboardBadgeListProps = {
  children: ReactNode
  className?: string
  align?: DashboardBadgeListAlign
  gap?: DashboardBadgeListGap
}

export const dashboardBadgeListClassName = 'flex flex-wrap items-center'

const dashboardBadgeListAlignClassNames = {
  start: 'justify-start',
  end: 'justify-end',
} satisfies Record<DashboardBadgeListAlign, string>

const dashboardBadgeListGapClassNames = {
  compact: 'gap-1.5',
  default: 'gap-2',
} satisfies Record<DashboardBadgeListGap, string>

export function DashboardBadgeList({
  align = 'start',
  children,
  className,
  gap = 'default',
}: DashboardBadgeListProps) {
  return (
    <div
      data-slot="dashboard-badge-list"
      className={cn(
        dashboardBadgeListClassName,
        dashboardBadgeListAlignClassNames[align],
        dashboardBadgeListGapClassNames[gap],
        className,
      )}
    >
      {children}
    </div>
  )
}
