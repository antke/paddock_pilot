import type { ComponentProps } from 'react'

import { cn } from '#/lib/utils'

type DashboardPageGap = 'standard' | 'loose' | 'compact'
type DashboardPageWidth = 'full' | 'narrow' | 'compact'
type DashboardPageVerticalAlign = 'start' | 'center'

const dashboardPageGapClassNames = {
  standard: 'grid gap-6',
  loose: 'grid gap-8',
  compact: 'grid gap-4',
} satisfies Record<DashboardPageGap, string>

const dashboardPageWidthClassNames = {
  full: '',
  narrow: 'mx-auto w-full max-w-4xl',
  compact: 'mx-auto w-full max-w-xl',
} satisfies Record<DashboardPageWidth, string>

const dashboardPageVerticalAlignClassNames = {
  start: '',
  center: 'min-h-[70vh] content-center',
} satisfies Record<DashboardPageVerticalAlign, string>

export function dashboardPageClassName(
  gap: DashboardPageGap = 'standard',
  width: DashboardPageWidth = 'full',
  verticalAlign: DashboardPageVerticalAlign = 'start',
  className?: string,
) {
  return cn(
    dashboardPageGapClassNames[gap],
    dashboardPageWidthClassNames[width],
    dashboardPageVerticalAlignClassNames[verticalAlign],
    className,
  )
}

type DashboardPageProps = ComponentProps<'div'> & {
  gap?: DashboardPageGap
  verticalAlign?: DashboardPageVerticalAlign
  width?: DashboardPageWidth
}

export function DashboardPage({
  gap = 'standard',
  verticalAlign = 'start',
  width = 'full',
  className,
  ...props
}: DashboardPageProps) {
  return (
    <div
      className={dashboardPageClassName(gap, width, verticalAlign, className)}
      {...props}
    />
  )
}
