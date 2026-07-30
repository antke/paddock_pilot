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

const dashboardMetricStripColumnClassNames = {
  3: {
    sm: 'sm:grid-cols-3',
    md: 'md:grid-cols-3',
  },
  4: {
    sm: 'sm:grid-cols-2 xl:grid-cols-4',
    md: 'md:grid-cols-2 xl:grid-cols-4',
  },
} satisfies Record<
  DashboardMetricStripColumns,
  Record<DashboardMetricStripBreakpoint, string>
>

const dashboardMetricStripItemClassNames = {
  compact: {
    sm: 'sm:border-l sm:border-border-subtle sm:pl-4 first:sm:border-l-0 first:sm:pl-0',
    md: 'md:border-l md:border-border-subtle md:pl-4 first:md:border-l-0 first:md:pl-0',
  },
  default: {
    sm: 'sm:border-l sm:border-border-subtle sm:pl-5 first:sm:border-l-0 first:sm:pl-0',
    md: 'md:border-l md:border-border-subtle md:pl-5 first:md:border-l-0 first:md:pl-0',
  },
} satisfies Record<
  DashboardMetricStripInset,
  Record<DashboardMetricStripBreakpoint, string>
>

type DashboardMetricStripItemOptions = {
  breakpoint?: DashboardMetricStripBreakpoint
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
  breakpoint = 'sm',
  className,
  inset = 'default',
}: DashboardMetricStripItemOptions & { className?: string } = {}) {
  return cn(dashboardMetricStripItemClassNames[inset][breakpoint], className)
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
      <p className={cn('text-3xl font-semibold tracking-normal', valueClassName)}>
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
