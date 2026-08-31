import type { ComponentProps, ReactNode } from 'react'

import { cn } from '#/lib/utils'

type DashboardHeaderRailProps = Omit<ComponentProps<'div'>, 'children'> & {
  bottom?: ReactNode
  top?: ReactNode
}

export function DashboardHeaderRail({
  bottom,
  className,
  top,
  ...props
}: DashboardHeaderRailProps) {
  if (!top && !bottom) return null

  return (
    <div
      data-slot="dashboard-header-rail"
      className={cn(
        'grid min-w-0 self-stretch justify-items-end gap-3',
        top && bottom && 'content-between',
        Boolean(top) !== Boolean(bottom) && 'content-start',
        className,
      )}
      {...props}
    >
      {top}
      {bottom}
    </div>
  )
}
