import type { ElementType, ReactNode } from 'react'

import { cn } from '#/lib/utils'
import { DashboardActions } from './DashboardActions'
import { DashboardBadgeList } from './DashboardBadgeList'
import { DashboardDisplayHeading } from './DashboardDisplayHeading'
import { DashboardHeaderRail } from './DashboardHeaderRail'

type DashboardSectionHeaderSize = 'compact' | 'panel' | 'section' | 'page'
type DashboardSectionHeaderDescriptionSize = 'default' | 'sm'
type DashboardSectionHeaderDescriptionWidth = 'default' | 'narrow'
type DashboardSectionHeaderTitleStyle = 'ui' | 'display'

type DashboardSectionHeaderProps = {
  titleSupplement?: ReactNode
  title?: ReactNode
  actions?: ReactNode
  actionsClassName?: string
  as?: ElementType
  badges?: ReactNode
  className?: string
  description?: ReactNode
  descriptionClassName?: string
  descriptionSize?: DashboardSectionHeaderDescriptionSize
  descriptionWidth?: DashboardSectionHeaderDescriptionWidth
  headingClassName?: string
  layout?: 'default' | 'inline'
  size?: DashboardSectionHeaderSize
  titleClassName?: string
  titleStyle?: DashboardSectionHeaderTitleStyle
}

export function DashboardSectionHeader({
  title,
  titleSupplement,
  actions,
  actionsClassName,
  as,
  badges,
  className,
  description,
  descriptionClassName,
  descriptionSize = 'default',
  descriptionWidth = 'default',
  headingClassName,
  layout = 'default',
  size = 'section',
  titleClassName,
  titleStyle = 'ui',
}: DashboardSectionHeaderProps) {
  const Heading = as ?? (size === 'page' ? 'h1' : 'h2')
  const usesDisplayTitle = size !== 'compact' || titleStyle === 'display'

  return (
    <header
      data-slot="dashboard-section-header"
      className={cn(
        layout === 'inline'
          ? 'flex flex-wrap items-center justify-between gap-x-6 gap-y-2'
          : 'grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-stretch',
        className,
      )}
    >
      <div
        data-slot="dashboard-section-header-main"
        className={cn('grid min-w-0 content-start gap-1.5', headingClassName)}
      >
        {usesDisplayTitle ? (
          <DashboardDisplayHeading
            as={Heading}
            scale={
              size === 'page'
                ? 'page'
                : size === 'section'
                  ? 'section'
                  : 'panel'
            }
            className={titleClassName}
          >
            {title}
          </DashboardDisplayHeading>
        ) : (
          <Heading
            className={cn(
              'min-w-0 text-lg font-semibold leading-tight tracking-normal',
              titleClassName,
            )}
          >
            {title}
          </Heading>
        )}

        {titleSupplement}
        {description && (
          <p
            className={cn(
              'leading-6 text-muted-foreground',
              descriptionWidth === 'default' && 'max-w-3xl',
              descriptionWidth === 'narrow' && 'max-w-2xl',
              descriptionSize === 'default' && 'text-sm',
              descriptionSize === 'sm' && 'text-sm',
              descriptionClassName,
            )}
          >
            {description}
          </p>
        )}
      </div>

      <DashboardHeaderRail
        className={layout === 'inline' ? 'max-w-full self-center' : undefined}
        top={
          badges ? (
            <DashboardBadgeList
              align="end"
              gap="compact"
              className="max-w-full"
            >
              {badges}
            </DashboardBadgeList>
          ) : undefined
        }
        bottom={
          actions ? (
            <DashboardActions
              align="end"
              className={cn(
                'max-w-full',
                layout === 'inline' ? 'justify-start' : 'justify-end',
                actionsClassName,
              )}
            >
              {actions}
            </DashboardActions>
          ) : undefined
        }
      />
    </header>
  )
}
