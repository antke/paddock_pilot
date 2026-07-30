import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'
import { DashboardActions } from './DashboardActions'
import type { DashboardChrome } from './dashboardChrome'
import { dashboardEmptyClassName } from './dashboardChrome'

type DashboardEmptyStateProps = {
  actions?: ReactNode
  bodyClassName?: string
  children?: ReactNode
  chrome?: DashboardChrome
  className?: string
  spacing?: 'default' | 'compact' | 'flush'
  title?: ReactNode
  titleClassName?: string
}

export function DashboardEmptyState({
  actions,
  bodyClassName,
  children,
  chrome = 'cards',
  className,
  spacing = 'default',
  title,
  titleClassName,
}: DashboardEmptyStateProps) {
  return (
    <div
      data-slot="dashboard-empty-state"
      className={dashboardEmptyClassName(
        chrome,
        cn(
          'grid gap-2',
          spacing === 'compact' && 'p-4',
          spacing === 'flush' && 'p-0',
          className,
        ),
      )}
    >
      {title && (
        <p className={cn('font-medium text-foreground', titleClassName)}>
          {title}
        </p>
      )}

      {children && (
        <div className={cn('leading-6', bodyClassName)}>{children}</div>
      )}

      {actions && (
        <DashboardActions align="start" className="pt-1">
          {actions}
        </DashboardActions>
      )}
    </div>
  )
}
