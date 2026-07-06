import { dashboardItemCardClassName } from '#/components/dashboard/DashboardItemCard'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { cn } from '#/lib/utils'
import type { ReactNode } from 'react'

type HorseCardHorse = {
  name: string
  ownerName?: string
  breed?: string
  profileImageUrl?: string | null
}

type HorseCardProps = {
  horse: HorseCardHorse
  action?: ReactNode
  chrome?: DashboardChrome
  className?: string
}

export function HorseCard({ horse, action, chrome, className }: HorseCardProps) {
  return (
    <article
      className={cn(
        dashboardItemCardClassName({ interactive: true, chrome }),
        'flex items-center gap-3',
        className,
      )}
    >
      <div className="size-12 shrink-0 overflow-hidden rounded-md border border-border-subtle bg-card sm:size-14">
        {horse.profileImageUrl ? (
          <img
            src={horse.profileImageUrl}
            alt={`${horse.name} profile`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
            {horse.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground underline-offset-4 group-hover/dashboard-item:underline">
          {horse.name}
        </h3>
        <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {horse.ownerName && (
            <HorseMeta label="Owner" value={horse.ownerName} />
          )}
          {horse.breed && <HorseMeta label="Breed" value={horse.breed} />}
        </dl>
      </div>

      {action && <div className="shrink-0 opacity-85">{action}</div>}
    </article>
  )
}

function HorseMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-1">
      <dt>{label}:</dt>
      <dd className="text-foreground/80">{value}</dd>
    </div>
  )
}
