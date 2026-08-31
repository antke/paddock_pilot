import { Children, Fragment } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '#/lib/utils'

type DashboardMetaListSize = 'micro' | 'xs' | 'sm'
type DashboardMetaListSeparator = 'none' | 'dot' | 'slash' | 'pipe'
type DashboardMetaListGap = 'compact' | 'default' | 'roomy'

type DashboardMetaListProps = ComponentProps<'div'> & {
  gap?: DashboardMetaListGap
  size?: DashboardMetaListSize
  separator?: DashboardMetaListSeparator
}

export const dashboardMetaListClassName =
  'flex min-w-0 flex-wrap items-center text-muted-foreground'

const dashboardMetaListGapClassNames = {
  compact: 'gap-x-1.5 gap-y-1',
  default: 'gap-2',
  roomy: 'gap-x-3 gap-y-1',
} satisfies Record<DashboardMetaListGap, string>

const dashboardMetaListSizeClassNames = {
  micro: 'text-xs font-medium leading-4',
  xs: 'text-xs',
  sm: 'text-sm',
} satisfies Record<DashboardMetaListSize, string>

const separatorCharacters = {
  dot: '\u00B7',
  slash: '/',
  pipe: '|',
} satisfies Record<Exclude<DashboardMetaListSeparator, 'none'>, string>

function renderSeparatedMeta(
  children: ReactNode,
  separator: Exclude<DashboardMetaListSeparator, 'none'>,
) {
  return Children.toArray(children).map((child, index) => (
    <Fragment key={index}>
      {index > 0 && (
        <span aria-hidden="true" className="text-muted-foreground/45">
          {separatorCharacters[separator]}
        </span>
      )}
      {child}
    </Fragment>
  ))
}

export function DashboardMetaList({
  className,
  children,
  gap = 'default',
  separator = 'none',
  size = 'sm',
  ...props
}: DashboardMetaListProps) {
  return (
    <div
      data-slot="dashboard-meta-list"
      className={cn(
        dashboardMetaListClassName,
        dashboardMetaListGapClassNames[gap],
        dashboardMetaListSizeClassNames[size],
        className,
      )}
      {...props}
    >
      {separator === 'none'
        ? children
        : renderSeparatedMeta(children, separator)}
    </div>
  )
}
