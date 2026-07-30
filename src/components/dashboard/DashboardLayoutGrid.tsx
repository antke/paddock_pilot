import type { ComponentProps, ElementType } from 'react'

import { cn } from '#/lib/utils'

type DashboardLayoutGridVariant =
  | 'alertColumns'
  | 'commandBento'
  | 'commandCenter'
  | 'commandCenterRail'
  | 'equal'
  | 'quarters'
  | 'sidebar'
  | 'split'
  | 'splitWide'
  | 'thirds'
  | 'thirdsCompact'

type DashboardLayoutStackGap = 'compact' | 'comfortable' | 'loose'

type DashboardLayoutStackProps = ComponentProps<'div'> & {
  as?: ElementType
  gap?: DashboardLayoutStackGap
}

type DashboardLayoutGridProps = ComponentProps<'div'> & {
  variant?: DashboardLayoutGridVariant
}

const dashboardLayoutGridVariantClassNames = {
  alertColumns:
    'grid items-start gap-x-8 gap-y-5 lg:grid-cols-2 2xl:grid-cols-4',
  commandBento:
    'grid items-stretch gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(18rem,1fr)]',
  commandCenter:
    'grid items-start gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(20rem,1fr)]',
  commandCenterRail: 'grid gap-6 md:grid-cols-2 xl:grid-cols-1',
  equal: 'grid items-start gap-6 lg:grid-cols-2',
  quarters: 'grid items-start gap-4 xl:grid-cols-4',
  sidebar: 'grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]',
  split:
    'grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]',
  splitWide:
    'grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]',
  thirds: 'grid items-start gap-4 xl:grid-cols-3',
  thirdsCompact: 'grid gap-3 lg:grid-cols-3',
} satisfies Record<DashboardLayoutGridVariant, string>

const dashboardLayoutStackGapClassNames = {
  compact: 'gap-4',
  comfortable: 'gap-6',
  loose: 'gap-8',
} satisfies Record<DashboardLayoutStackGap, string>

export function DashboardLayoutGrid({
  className,
  variant = 'equal',
  ...props
}: DashboardLayoutGridProps) {
  return (
    <div
      className={cn(dashboardLayoutGridVariantClassNames[variant], className)}
      {...props}
    />
  )
}

export function DashboardLayoutStack({
  as,
  className,
  gap = 'comfortable',
  ...props
}: DashboardLayoutStackProps) {
  const Component = as ?? 'div'

  return (
    <Component
      className={cn('grid', dashboardLayoutStackGapClassNames[gap], className)}
      {...props}
    />
  )
}
