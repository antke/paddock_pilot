import { useWorkspace } from '#/components/layout/WorkspaceContext'
import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'
import type { DashboardChrome } from './dashboardChrome'
import { DashboardBadgeList } from './DashboardBadgeList'
import { DashboardHeaderRail } from './DashboardHeaderRail'
import {
  DashboardHeroActions,
  DashboardHeroContent,
  DashboardHeroSection,
  DashboardHeroText,
  DashboardHeroTitle,
} from './DashboardHeroSection'

type DashboardEntityHeroProps = {
  actions?: ReactNode
  actionsLayout?: 'stack' | 'inline'
  badges?: ReactNode
  children?: ReactNode
  chrome?: DashboardChrome
  className?: string
  description?: ReactNode
  leading?: ReactNode
  media?: ReactNode
  title: ReactNode
  compactOnMobile?: boolean
}

export function DashboardEntityHero({
  actions,
  actionsLayout = 'stack',
  badges,
  children,
  chrome = 'flat',
  className,
  description,
  leading,
  media,
  title,
  compactOnMobile = false,
}: DashboardEntityHeroProps) {
  const workspace = useWorkspace()
  return (
    <DashboardHeroSection
      chrome={chrome}
      className={cn(
        'grid gap-6',
        compactOnMobile && 'gap-3 sm:gap-6',
        className,
      )}
    >
      <div
        className={cn(
          'grid gap-6',
          media && 'lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-stretch',
        )}
      >
        <DashboardHeroContent
          className={
            compactOnMobile
              ? actionsLayout === 'inline'
                ? 'grid-cols-1 items-center gap-3 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_auto]'
                : 'grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-6'
              : undefined
          }
        >
          <div
            className={cn(
              'grid min-w-0 gap-4',
              leading && 'grid-cols-[auto_minmax(0,1fr)] items-center',
            )}
          >
            {leading}
            <DashboardHeroText>
              <DashboardHeroTitle>
                {workspace &&
                typeof title === 'string' &&
                title !== workspace.label
                  ? `${title} · ${workspace.label}`
                  : title}
              </DashboardHeroTitle>
              {description && (
                <p
                  className={cn(
                    'max-w-3xl text-sm font-medium leading-6 text-muted-foreground md:text-base',
                    compactOnMobile && 'hidden sm:block',
                  )}
                >
                  {description}
                </p>
              )}
            </DashboardHeroText>
          </div>

          <DashboardHeaderRail
            className={
              actionsLayout === 'inline'
                ? 'w-full lg:w-auto lg:self-center'
                : undefined
            }
            top={
              badges ? (
                <DashboardBadgeList align="end">{badges}</DashboardBadgeList>
              ) : undefined
            }
            bottom={
              actions ? (
                <DashboardHeroActions
                  className={
                    actionsLayout === 'inline'
                      ? 'flex w-full flex-wrap items-center gap-2 lg:w-auto'
                      : undefined
                  }
                >
                  {actions}
                </DashboardHeroActions>
              ) : undefined
            }
          />
        </DashboardHeroContent>

        {media}
      </div>

      {children}
    </DashboardHeroSection>
  )
}
