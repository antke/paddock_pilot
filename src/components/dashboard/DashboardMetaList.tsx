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

// Separated lists fold the separator's own spacing into one wider gap (gap · gap).
const separatedGapClassNames = {
  compact: '[--meta-gap:1rem] gap-y-1',
  default: '[--meta-gap:1.25rem] gap-y-2',
  roomy: '[--meta-gap:1.75rem] gap-y-1',
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
  const visibleItems = Children.toArray(children).filter(
    (child) => typeof child !== 'string' || child.trim().length > 0,
  )
  // Each separator hangs in the gap before its item. One that would start a line falls
  // outside the list's left edge, where `overflow-x: clip` hides it, so wrapped lines
  // never begin or end with a separator.
  return visibleItems.map((child, index) =>
    index === 0 ? (
      <Fragment key={index}>{child}</Fragment>
    ) : (
      <span key={index} className="relative min-w-0 max-w-full">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-[calc(100%+var(--meta-gap)/2)] translate-x-1/2 text-muted-foreground/45"
        >
          {separatorCharacters[separator]}
        </span>
        {child}
      </span>
    ),
  )
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
        separator === 'none'
          ? dashboardMetaListGapClassNames[gap]
          : [separatedGapClassNames[gap], 'gap-x-(--meta-gap) overflow-x-clip'],
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
