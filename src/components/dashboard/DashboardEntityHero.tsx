import { PageBack } from '#/components/layout/PageBack'
import { PageBackSlot } from './PageBackSlot'
import { useWorkspace } from '#/components/layout/WorkspaceContext'
import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'
import {
  DashboardHeroSection,
  DashboardHeroText,
  DashboardHeroTitle,
} from './DashboardHeroSection'

type DashboardEntityHeroProps = {
  actions?: ReactNode
  /** Secondary content below the identity row, such as section navigation. */
  children?: ReactNode
  className?: string
  /** One meta line under the title. */
  description?: ReactNode
  /** Photo or date block beside the title. */
  leading?: ReactNode
  title: ReactNode
  /** Defaults to the route's `PageBack`; pass `null` to suppress it. */
  backAction?: ReactNode
  /**
   * Phones show this `EntityActionsMenu` in the Back row instead of `actions`;
   * `null` hides the actions on phones when a round button already holds them.
   */
  phoneMenu?: ReactNode
}

/**
 * The one detail header: Back, identity (leading block, title, meta line),
 * then the entity's actions — right-aligned beside it from `md`; on phones one
 * `phoneMenu` at the end of the Back row — then any secondary content.
 */
export function DashboardEntityHero({
  actions,
  children,
  className,
  description,
  leading,
  title,
  backAction,
  phoneMenu,
}: DashboardEntityHeroProps) {
  const workspace = useWorkspace()
  // The title stands alone; Personal or the stable's name leads the meta line.
  const workspaceLabel =
    workspace && typeof title === 'string' && title !== workspace.label
      ? workspace.label
      : undefined
  return (
    <DashboardHeroSection className={cn('grid gap-5', className)}>
      <PageBackSlot className="-mb-2 items-center">
        {backAction === undefined ? <PageBack /> : backAction}
        {phoneMenu && <div className="ml-auto md:hidden">{phoneMenu}</div>}
      </PageBackSlot>
      <div className="mx-auto grid w-full max-w-[var(--page-column,none)] min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-x-8">
        <div
          className={cn(
            'grid min-w-0 gap-4',
            leading && 'grid-cols-[auto_minmax(0,1fr)] items-center',
          )}
        >
          {leading}
          <DashboardHeroText className="gap-1.5">
            <DashboardHeroTitle>{title}</DashboardHeroTitle>
            {(description || workspaceLabel) && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-muted-foreground">
                {workspaceLabel && (
                  <span className="flex items-center gap-x-2">
                    {workspaceLabel}
                    {description && <span aria-hidden="true">·</span>}
                  </span>
                )}
                {description}
              </div>
            )}
          </DashboardHeroText>
        </div>
        {actions && (
          <div
            data-slot="entity-hero-actions"
            className={cn(
              'flex min-w-0 flex-wrap items-center gap-2 md:justify-end',
              phoneMenu !== undefined && 'max-md:hidden',
            )}
          >
            {actions}
          </div>
        )}
      </div>
      {children && (
        <div className="mx-auto w-full max-w-[var(--page-column,none)] min-w-0">
          {children}
        </div>
      )}
    </DashboardHeroSection>
  )
}
