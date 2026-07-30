import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'
import { dashboardHeroClassName } from './dashboardChrome'
import { DashboardActions } from './DashboardActions'
import { DashboardBadgeList } from './DashboardBadgeList'
import { DashboardDisplayHeading } from './DashboardDisplayHeading'

type DashboardPageHeaderTitleSize = 'default' | 'detail'
type DashboardPageHeaderDescriptionSize = 'sm' | 'base'
type DashboardPageHeaderDescriptionWidth = 'default' | 'narrow'
type DashboardPageHeaderContentLayout = 'center' | 'default' | 'wide'

type DashboardPageHeaderProps = {
  title: ReactNode
  actions?: ReactNode
  actionsClassName?: string
  badges?: ReactNode
  className?: string
  contentClassName?: string
  contentLayout?: DashboardPageHeaderContentLayout
  description?: ReactNode
  descriptionClassName?: string
  descriptionSize?: DashboardPageHeaderDescriptionSize
  descriptionWidth?: DashboardPageHeaderDescriptionWidth
  headingClassName?: string
  leading?: ReactNode
  titleClassName?: string
  titleSize?: DashboardPageHeaderTitleSize
}

export function DashboardPageHeader({
  title,
  actions,
  actionsClassName,
  badges,
  className,
  contentClassName,
  contentLayout = 'default',
  description,
  descriptionClassName,
  descriptionSize = 'sm',
  descriptionWidth = 'default',
  headingClassName,
  leading,
  titleClassName,
  titleSize = 'default',
}: DashboardPageHeaderProps) {
  const contentLayoutClassName = {
    center: 'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center',
    default:
      'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between',
    wide: 'flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between',
  } satisfies Record<DashboardPageHeaderContentLayout, string>
  const actionsLayoutClassName = {
    center: 'shrink-0 sm:justify-end',
    default: 'shrink-0 sm:justify-end',
    wide: 'shrink-0 lg:justify-end',
  } satisfies Record<DashboardPageHeaderContentLayout, string>

  return (
    <header
      data-slot="dashboard-page-header"
      className={cn(dashboardHeroClassName('cards'), className)}
    >
      <div
        className={cn(contentLayoutClassName[contentLayout], contentClassName)}
      >
        <div
          className={cn(
            'min-w-0',
            leading ? 'flex items-center gap-4' : 'grid',
          )}
        >
          {leading}

          <div className={cn('grid min-w-0 gap-2', headingClassName)}>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <DashboardDisplayHeading
                scale={titleSize === 'default' ? 'page' : 'section'}
                className={titleClassName}
              >
                {title}
              </DashboardDisplayHeading>
              {badges && (
                <DashboardBadgeList gap="compact" className="min-w-0">
                  {badges}
                </DashboardBadgeList>
              )}
            </div>

            {description && (
              <p
                className={cn(
                  'text-muted-foreground',
                  descriptionWidth === 'default' && 'max-w-3xl',
                  descriptionWidth === 'narrow' && 'max-w-2xl',
                  descriptionSize === 'sm' && 'text-sm font-semibold leading-6',
                  descriptionSize === 'base' && 'text-base leading-6',
                  descriptionClassName,
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <DashboardActions
            align="start"
            className={cn(
              actionsLayoutClassName[contentLayout],
              actionsClassName,
            )}
          >
            {actions}
          </DashboardActions>
        )}
      </div>
    </header>
  )
}
