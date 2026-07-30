import type { ComponentProps, ReactNode } from 'react'

import { Spinner } from '#/components/ui/spinner'
import { cn } from '#/lib/utils'

type DashboardLoadingStateProps = ComponentProps<'div'> & {
  label?: ReactNode
  panelClassName?: string
  spinnerClassName?: string
}

export function DashboardLoadingState({
  className,
  label,
  panelClassName,
  spinnerClassName,
  ...props
}: DashboardLoadingStateProps) {
  return (
    <div
      data-slot="dashboard-loading-state"
      {...props}
      className={cn(
        'flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-muted-foreground',
        className,
      )}
    >
      <div
        data-slot="dashboard-loading-panel"
        className={cn(
          'grid size-12 place-items-center rounded-control border border-border-subtle bg-card',
          panelClassName,
        )}
      >
        <Spinner className={cn('size-5', spinnerClassName)} />
      </div>

      {label ? <p>{label}</p> : null}
    </div>
  )
}
