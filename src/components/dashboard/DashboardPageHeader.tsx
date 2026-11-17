import { useWorkspace } from '#/components/layout/WorkspaceContext'
import type { ElementType, ReactNode } from 'react'

import { cn } from '#/lib/utils'
import { PageBack } from '#/components/layout/PageBack'
import { PageBackSlot } from './PageBackSlot'
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
  /** Defaults to the route's `PageBack`; pass `null` to suppress it. */
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
  // The title stands alone; inside a stable its name leads the meta line.
  const workspaceLabel =
    showWorkspace &&
    workspace?.stableId &&
    typeof title === 'string' &&
    title !== workspace.label
      ? workspace.label
      : undefined
  const contentLayoutClassName = {
    center: 'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-center',
    // Actions sit beside the title when both fit and drop to their own row
    // when they don't, so a button label never breaks across lines.
    default:
      'flex flex-wrap items-start justify-between gap-x-4 gap-y-3 md:items-stretch',
    inline: 'grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4',
    wide: 'grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch',
  } satisfies Record<DashboardPageHeaderContentLayout, string>
  const descriptionNode = (description || workspaceLabel) && (
    <p
      className={cn(
        'text-muted-foreground',
        descriptionWidth === 'default' && 'max-w-3xl',
        descriptionWidth === 'narrow' && 'max-w-2xl',
        descriptionSize === 'sm' && 'text-sm leading-6',
        descriptionSize === 'base' && 'text-base leading-6',
        descriptionClassName,
      )}
    >
      {workspaceLabel}
      {workspaceLabel && description && <span aria-hidden="true"> · </span>}
      {description}
    </p>
  )

  return (
    <header
      data-slot="dashboard-page-header"
      className={cn(dashboardHeroClassName('flat'), className)}
    >
      <PageBackSlot>
        {backAction === undefined ? <PageBack /> : backAction}
      </PageBackSlot>
      <div
        className={cn(
          'mx-auto w-full max-w-[var(--page-column,none)]',
          contentLayoutClassName[contentLayout],
          contentClassName,
        )}
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
              {title}
            </DashboardDisplayHeading>

            {contentLayout !== 'default' && descriptionNode}
          </div>
        </div>

        <DashboardHeaderRail
          className="max-md:justify-items-start md:ml-auto"
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
                  'max-w-full justify-end max-md:justify-start',
                  actionsClassName,
                )}
              >
                {actions}
              </DashboardActions>
            ) : undefined
          }
        />
        {/* Its own line: the description's max width would otherwise let it share the title row. */}
        {contentLayout === 'default' && descriptionNode && (
          <div className="basis-full">{descriptionNode}</div>
        )}
      </div>
    </header>
  )
}
