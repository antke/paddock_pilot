import type { ElementType, ReactNode } from 'react'

import { cn } from '#/lib/utils'
import { DashboardBadgeList } from './DashboardBadgeList'

type DashboardInlineHeaderGap = 'default' | 'comfortable' | 'loose'
type DashboardInlineHeaderDescriptionSize = 'default' | 'xs'
type DashboardInlineHeaderTitleSize = 'default' | 'sm' | 'lg'
type DashboardInlineHeaderTitleWeight = 'medium' | 'semibold'

type DashboardInlineHeaderProps = {
  title: ReactNode
  aside?: ReactNode
  as?: ElementType
  className?: string
  description?: ReactNode
  descriptionClassName?: string
  descriptionSize?: DashboardInlineHeaderDescriptionSize
  gap?: DashboardInlineHeaderGap
  headingClassName?: string
  titleClassName?: string
  titleSize?: DashboardInlineHeaderTitleSize
  titleWeight?: DashboardInlineHeaderTitleWeight
}

export const dashboardInlineHeaderClassName =
  'flex min-w-0 flex-wrap items-center justify-between'
export const dashboardNestedHeadingClassName =
  'min-w-0 font-display font-black uppercase tracking-normal'

const dashboardInlineHeaderGapClassNames = {
  default: 'gap-2',
  comfortable: 'gap-3',
  loose: 'gap-4',
} satisfies Record<DashboardInlineHeaderGap, string>

const dashboardInlineHeaderDescriptionSizeClassNames = {
  default: 'text-sm',
  xs: 'text-xs',
} satisfies Record<DashboardInlineHeaderDescriptionSize, string>

const dashboardInlineHeaderTitleSizeClassNames = {
  default: 'text-lg leading-[0.95]',
  sm: 'text-sm',
  lg: 'text-lg leading-[0.95]',
} satisfies Record<DashboardInlineHeaderTitleSize, string>

const dashboardInlineHeaderTitleWeightClassNames = {
  medium: 'font-black',
  semibold: 'font-black',
} satisfies Record<DashboardInlineHeaderTitleWeight, string>

export function DashboardInlineHeader({
  title,
  aside,
  as,
  className,
  description,
  descriptionClassName,
  descriptionSize = 'default',
  gap = 'default',
  headingClassName,
  titleClassName,
  titleSize = 'default',
  titleWeight = 'medium',
}: DashboardInlineHeaderProps) {
  const Title = as ?? 'span'

  return (
    <div
      className={cn(
        dashboardInlineHeaderClassName,
        dashboardInlineHeaderGapClassNames[gap],
        className,
      )}
    >
      <div className={cn('grid min-w-0 gap-1', headingClassName)}>
        <Title
          className={cn(
            dashboardNestedHeadingClassName,
            dashboardInlineHeaderTitleSizeClassNames[titleSize],
            dashboardInlineHeaderTitleWeightClassNames[titleWeight],
            titleClassName,
          )}
        >
          {title}
        </Title>
        {description && (
          <p
            className={cn(
              'text-muted-foreground',
              dashboardInlineHeaderDescriptionSizeClassNames[descriptionSize],
              descriptionClassName,
            )}
          >
            {description}
          </p>
        )}
      </div>

      {aside && (
        <DashboardBadgeList align="end" gap="compact" className="shrink-0">
          {aside}
        </DashboardBadgeList>
      )}
    </div>
  )
}
