import { cn } from '#/lib/utils'
import type { ReactNode } from 'react'
import type { DashboardChrome } from './dashboardChrome'

type DashboardItemCardDensity = 'comfortable' | 'compact'

type DashboardItemCardContentProps = {
  title: ReactNode
  meta?: ReactNode
  leading?: ReactNode
  media?: ReactNode
  badges?: ReactNode
  density?: DashboardItemCardDensity
}

export const dashboardItemActionGridClassName =
  'grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-stretch'

export const dashboardItemActionColumnClassName =
  'flex flex-wrap justify-end gap-4 sm:min-w-24 sm:flex-col sm:items-end sm:self-stretch sm:justify-between sm:justify-self-end'

export const dashboardItemStateBadgesClassName =
  'flex flex-wrap justify-end gap-1.5'

export const dashboardItemActionButtonsClassName =
  'flex flex-wrap justify-end gap-2 sm:mt-auto sm:flex-col sm:items-end'

export function dashboardItemCardClassName({
  density = 'comfortable',
  interactive = false,
  chrome = 'cards',
  className,
}: {
  density?: DashboardItemCardDensity
  interactive?: boolean
  chrome?: DashboardChrome
  className?: string
} = {}) {
  return cn(
    'group/dashboard-item transition-colors',
    chrome === 'cards' && 'rounded-row bg-background/55',
    chrome === 'soft' && 'rounded-row bg-background/60',
    chrome === 'lines' && 'border-t border-border-subtle first:border-t-0',
    chrome === 'open' && 'first:pt-0',
    chrome === 'bare' && 'rounded-none',
    density === 'compact'
      ? chrome === 'bare'
        ? 'py-2'
        : 'p-4'
      : chrome === 'bare'
        ? 'py-3'
        : 'p-5',
    interactive &&
      cn(
        'focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none',
        'hover:bg-primary/5',
      ),
    className,
  )
}

export function DashboardItemCardContent({
  title,
  meta,
  leading,
  media,
  badges,
  density = 'comfortable',
}: DashboardItemCardContentProps) {
  const hasLeading = Boolean(media ?? leading)
  const hasBadges = Boolean(badges)

  return (
    <div
      className={cn(
        'grid min-w-0 items-center gap-3',
        hasLeading && hasBadges && 'grid-cols-[auto_minmax(0,1fr)_auto]',
        hasLeading && !hasBadges && 'grid-cols-[auto_minmax(0,1fr)]',
        !hasLeading && hasBadges && 'grid-cols-[minmax(0,1fr)_auto]',
        !hasLeading && !hasBadges && 'grid-cols-1',
      )}
    >
      {media ?? leading}

      <div className="min-w-0">
        <div className="line-clamp-1 font-semibold underline-offset-4 group-hover/dashboard-item:underline">
          {title}
        </div>
        {meta && (
          <div
            className={cn(
              'mt-1 flex min-w-0 flex-wrap items-center gap-2 text-muted-foreground',
              density === 'compact' ? 'text-xs' : 'text-sm',
            )}
          >
            {meta}
          </div>
        )}
      </div>

      {badges && (
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          {badges}
        </div>
      )}
    </div>
  )
}
