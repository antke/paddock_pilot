import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'
import type { DashboardChrome } from './dashboardChrome'
import { DashboardBadgeList } from './DashboardBadgeList'
import {
  DashboardHeroActions,
  DashboardHeroContent,
  DashboardHeroSection,
  DashboardHeroText,
  DashboardHeroTitle,
} from './DashboardHeroSection'

type DashboardEntityHeroProps = {
  actions?: ReactNode
  badges?: ReactNode
  children?: ReactNode
  chrome?: DashboardChrome
  className?: string
  description?: ReactNode
  leading?: ReactNode
  media?: ReactNode
  title: ReactNode
}

export function DashboardEntityHero({
  actions,
  badges,
  children,
  chrome = 'cards',
  className,
  description,
  leading,
  media,
  title,
}: DashboardEntityHeroProps) {
  return (
    <DashboardHeroSection
      chrome={chrome}
      className={cn('grid gap-6', className)}
    >
      <div
        className={cn(
          'grid gap-6',
          media && 'lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-stretch',
        )}
      >
        <DashboardHeroContent>
          <div
            className={cn(
              'grid min-w-0 gap-4',
              leading && 'grid-cols-[auto_minmax(0,1fr)] items-center',
            )}
          >
            {leading}
            <DashboardHeroText>
              <DashboardHeroTitle>{title}</DashboardHeroTitle>
              {badges && <DashboardBadgeList>{badges}</DashboardBadgeList>}
              {description && (
                <p className="max-w-3xl text-sm font-medium leading-6 text-muted-foreground md:text-base">
                  {description}
                </p>
              )}
            </DashboardHeroText>
          </div>

          {actions && <DashboardHeroActions>{actions}</DashboardHeroActions>}
        </DashboardHeroContent>

        {media}
      </div>

      {children}
    </DashboardHeroSection>
  )
}
