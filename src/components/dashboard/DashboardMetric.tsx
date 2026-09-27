import type { ComponentProps, ElementType, ReactNode } from 'react'

import { cn } from '#/lib/utils'
import type { DashboardChrome } from './dashboardChrome'
import { dashboardInlinePanelClassName } from './dashboardChrome'

type DashboardMetricChrome = DashboardChrome | 'plain'
type DashboardMetricStripColumns = 3 | 4
type DashboardMetricStripBreakpoint = 'sm' | 'md'
type DashboardMetricStripInset = 'compact' | 'default'

type DashboardMetricProps = {
  title: ReactNode
  value: ReactNode
  as?: ElementType
  children?: ReactNode
  chrome?: DashboardMetricChrome
  className?: string
  descriptionClassName?: string
  stripItem?: boolean | DashboardMetricStripItemOptions
  titleClassName?: string
  valueClassName?: string
}

type DashboardMetricStripProps = ComponentProps<'div'> & {
  breakpoint?: DashboardMetricStripBreakpoint
  columns?: DashboardMetricStripColumns
}

// The strip owns both columns and their dividers, so item settings cannot
// drift from the responsive row boundaries.
const dashboardMetricStripColumnClassNames = {
  3: {
    sm: 'sm:grid-cols-3 sm:[&>.metric-strip-item:not(:nth-child(3n+1))]:border-l sm:[&>.metric-strip-item:not(:nth-child(3n+1))]:pl-(--metric-strip-inset)',
    md: 'md:grid-cols-3 md:[&>.metric-strip-item:not(:nth-child(3n+1))]:border-l md:[&>.metric-strip-item:not(:nth-child(3n+1))]:pl-(--metric-strip-inset)',
  },
  4: {
    sm: 'sm:grid-cols-2 xl:grid-cols-4 sm:max-xl:[&>.metric-strip-item:nth-child(even)]:border-l sm:max-xl:[&>.metric-strip-item:nth-child(even)]:pl-(--metric-strip-inset) xl:[&>.metric-strip-item:not(:nth-child(4n+1))]:border-l xl:[&>.metric-strip-item:not(:nth-child(4n+1))]:pl-(--metric-strip-inset)',
    md: 'md:grid-cols-2 xl:grid-cols-4 md:max-xl:[&>.metric-strip-item:nth-child(even)]:border-l md:max-xl:[&>.metric-strip-item:nth-child(even)]:pl-(--metric-strip-inset) xl:[&>.metric-strip-item:not(:nth-child(4n+1))]:border-l xl:[&>.metric-strip-item:not(:nth-child(4n+1))]:pl-(--metric-strip-inset)',
  },
} satisfies Record<
  DashboardMetricStripColumns,
  Record<DashboardMetricStripBreakpoint, string>
>

const dashboardMetricStripItemClassNames = {
  compact: '[--metric-strip-inset:calc(var(--spacing)*4)]',
  default: '[--metric-strip-inset:calc(var(--spacing)*5)]',
} satisfies Record<DashboardMetricStripInset, string>

type DashboardMetricStripItemOptions = {
  inset?: DashboardMetricStripInset
}

export function DashboardMetricStrip({
  breakpoint = 'sm',
  className,
  columns = 4,
  ...props
}: DashboardMetricStripProps) {
  return (
    <div
      className={cn(
        'grid gap-3 border-y border-border-subtle py-5',
        dashboardMetricStripColumnClassNames[columns][breakpoint],
        className,
      )}
      {...props}
    />
  )
}

export function dashboardMetricStripItemClassName({
  className,
  inset = 'default',
}: DashboardMetricStripItemOptions & { className?: string } = {}) {
  return cn(
    'metric-strip-item border-border-subtle',
    dashboardMetricStripItemClassNames[inset],
    className,
  )
}

export function DashboardMetric({
  title,
  value,
  as,
  children,
  chrome = 'plain',
  className,
  descriptionClassName,
  stripItem,
  titleClassName,
  valueClassName,
}: DashboardMetricProps) {
  const Component = as ?? (chrome === 'plain' ? 'div' : 'article')
  const stripItemClassName = stripItem
    ? dashboardMetricStripItemClassName(
        typeof stripItem === 'object' ? stripItem : undefined,
      )
    : undefined

  return (
    <Component
      data-slot="dashboard-metric"
      className={
        chrome === 'plain'
          ? cn('grid gap-1', stripItemClassName, className)
          : dashboardInlinePanelClassName(
              chrome,
              cn('grid gap-1', stripItemClassName, className),
            )
      }
    >
      <p
        className={cn(
          'text-sm font-medium text-muted-foreground',
          titleClassName,
        )}
      >
        {title}
      </p>
      <p
        className={cn('text-3xl font-semibold tracking-normal', valueClassName)}
      >
        {value}
      </p>
      {children && (
        <p
          className={cn('text-sm text-muted-foreground', descriptionClassName)}
        >
          {children}
        </p>
      )}
    </Component>
  )
}
