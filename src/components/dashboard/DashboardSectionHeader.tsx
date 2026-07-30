import type { ElementType, ReactNode } from 'react'

import { cn } from '#/lib/utils'
import { DashboardActions } from './DashboardActions'
import { DashboardBadgeList } from './DashboardBadgeList'
import { DashboardDisplayHeading } from './DashboardDisplayHeading'

type DashboardSectionHeaderSize = 'compact' | 'panel' | 'section' | 'page'
type DashboardSectionHeaderDescriptionSize = 'default' | 'sm'
type DashboardSectionHeaderDescriptionWidth = 'default' | 'narrow'
type DashboardSectionHeaderTitleStyle = 'ui' | 'display'

type DashboardSectionHeaderProps = {
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
  size?: DashboardSectionHeaderSize
  titleClassName?: string
  titleStyle?: DashboardSectionHeaderTitleStyle
}

export function DashboardSectionHeader({
  title,
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
  size = 'section',
  titleClassName,
  titleStyle = 'ui',
}: DashboardSectionHeaderProps) {
  const Heading = as ?? (size === 'page' ? 'h1' : 'h2')
  const usesDisplayTitle = size !== 'compact' || titleStyle === 'display'

  return (
    <header
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className={cn('grid min-w-0 gap-1.5', headingClassName)}>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
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
          {badges && (
            <DashboardBadgeList gap="compact" className="min-w-0">
              {badges}
            </DashboardBadgeList>
          )}
        </div>

        {description && (
          <p
            className={cn(
              'leading-6 text-muted-foreground',
              descriptionWidth === 'default' && 'max-w-3xl',
              descriptionWidth === 'narrow' && 'max-w-2xl',
              descriptionSize === 'default' &&
                (usesDisplayTitle ? 'text-sm font-semibold' : 'text-base'),
              descriptionSize === 'sm' && 'text-sm',
              descriptionClassName,
            )}
          >
            {description}
          </p>
        )}
      </div>

      {actions && (
        <DashboardActions
          align="start"
          className={cn('sm:shrink-0 sm:justify-end', actionsClassName)}
        >
          {actions}
        </DashboardActions>
      )}
    </header>
  )
}
