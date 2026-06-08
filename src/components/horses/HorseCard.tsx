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
  className?: string
}

export function HorseCard({ horse, action, className }: HorseCardProps) {
  return (
    <article
      className={cn(
        'app-row app-row-hover grid grid-cols-4 items-center gap-4 p-4',
        className,
      )}
    >
      <div className="col-span-1 aspect-square overflow-hidden rounded-row border border-border-subtle bg-muted">
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

      <div className="col-span-3 grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-semibold">{horse.name}</h3>
          {action}
        </div>

        <dl className="grid gap-1 text-xs text-muted-foreground">
          {horse.ownerName && (
            <div className="flex gap-1">
              <dt>Owner:</dt>
              <dd>{horse.ownerName}</dd>
            </div>
          )}
          {horse.breed && (
            <div className="flex gap-1">
              <dt>Breed:</dt>
              <dd>{horse.breed}</dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  )
}
