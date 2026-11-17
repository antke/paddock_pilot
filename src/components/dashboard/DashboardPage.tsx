import type { ComponentProps } from 'react'

import { cn } from '#/lib/utils'

type DashboardPageGap = 'standard' | 'loose' | 'compact'
type DashboardPageWidth = 'full' | 'narrow' | 'compact'
type DashboardPageVerticalAlign = 'start' | 'center'

const dashboardPageGapClassNames = {
  standard: 'grid gap-[var(--app-section-gap)]',
  loose: 'grid gap-8',
  compact: 'grid gap-4',
} satisfies Record<DashboardPageGap, string>

// Narrow pages centre their content and title in a column; page and entity headers
// still span the page so Back stays top left (both read --page-column).
const centredColumnClassName =
  'w-full *:mx-auto *:w-full *:max-w-(--page-column) [&>[data-slot=dashboard-page-header]]:max-w-none [&>[data-slot=dashboard-hero-section]]:max-w-none'

const dashboardPageWidthClassNames = {
  full: '',
  narrow: cn('[--page-column:var(--container-4xl)]', centredColumnClassName),
  compact: cn('[--page-column:var(--container-xl)]', centredColumnClassName),
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
    'min-w-0',
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
