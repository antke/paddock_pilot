import { cn } from '#/lib/utils'
import type { ReactNode } from 'react'

type DashboardItemCardDensity = 'comfortable' | 'compact'

type DashboardItemCardContentProps = {
  title: ReactNode
  meta?: ReactNode
  leading?: ReactNode
  media?: ReactNode
  badges?: ReactNode
  density?: DashboardItemCardDensity
}

export function dashboardItemCardClassName({
  density = 'comfortable',
  interactive = false,
  className,
}: {
  density?: DashboardItemCardDensity
  interactive?: boolean
  className?: string
} = {}) {
  return cn(
    'group/dashboard-item rounded-row border border-border-subtle bg-background/55 transition-colors',
    density === 'compact' ? 'p-3' : 'p-4',
    interactive &&
      'hover:border-primary/25 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none',
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

      {badges && <div className="flex shrink-0 flex-wrap justify-end gap-2">{badges}</div>}
    </div>
  )
}
