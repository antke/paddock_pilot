import { useWorkspace } from '#/components/layout/WorkspaceContext'
import type { ElementType, ReactNode } from 'react'

import { cn } from '#/lib/utils'
import { dashboardHeroClassName } from './dashboardChrome'
import { DashboardActions } from './DashboardActions'
import { DashboardBadgeList } from './DashboardBadgeList'
import { DashboardDisplayHeading } from './DashboardDisplayHeading'
import { DashboardHeaderRail } from './DashboardHeaderRail'

type DashboardPageHeaderTitleSize = 'default' | 'detail'
type DashboardPageHeaderDescriptionSize = 'sm' | 'base'
type DashboardPageHeaderDescriptionWidth = 'default' | 'narrow'
type DashboardPageHeaderContentLayout = 'center' | 'default' | 'inline' | 'wide'

type DashboardPageHeaderProps = {
  showWorkspace?: boolean
  title: ReactNode
  as?: ElementType
  backAction?: ReactNode
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
  showWorkspace = true,
  title,
  as,
  actions,
  backAction,
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
  const workspace = useWorkspace()
  const contentLayoutClassName = {
    center: 'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center',
    default: 'grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-stretch',
    inline: 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4',
    wide: 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch',
  } satisfies Record<DashboardPageHeaderContentLayout, string>

  return (
    <header
      data-slot="dashboard-page-header"
      className={cn(dashboardHeroClassName('flat'), className)}
    >
      {backAction && (
        <div className="mb-3 flex justify-start">{backAction}</div>
      )}
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

          <div
            className={cn('grid min-w-0 content-start gap-2', headingClassName)}
          >
            <DashboardDisplayHeading
              as={as}
              scale={titleSize === 'default' ? 'page' : 'section'}
              className={titleClassName}
            >
              {showWorkspace &&
              workspace?.stableId &&
              typeof title === 'string' &&
              title !== workspace.label
                ? `${title} · ${workspace.label}`
                : title}
            </DashboardDisplayHeading>

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

        <DashboardHeaderRail
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
                className={cn('max-w-full justify-end', actionsClassName)}
              >
                {actions}
              </DashboardActions>
            ) : undefined
          }
        />
      </div>
    </header>
  )
}
