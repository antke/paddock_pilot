import { buttonVariants } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { Link } from '@tanstack/react-router'
import type { DashboardLabData, DashboardLabHorse } from '../dashboardLabTypes'
import { DashboardItemCardContent, dashboardItemCardClassName } from './DashboardItemCard'
import { ScrollableList } from '#/components/ui/scrollable-list'

type HorseRosterCardProps = {
  data: DashboardLabData
  visibleItemLimit?: number
  compact?: boolean
}

export function HorseRosterCard({ data, visibleItemLimit = 5, compact = false }: HorseRosterCardProps) {
  return (
    <section className="rounded-panel border border-border-subtle bg-card/80 p-5 shadow-control">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Horses in {data.stable.name}</h2>
        </div>
        <Link
          to="/stables/$stableId/horses"
          params={{ stableId: data.stable._id }}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          View all horses
        </Link>
      </div>

      {data.horses.length > 0 ? (
        <ScrollableList
          itemCount={data.horses.length}
          visibleItemLimit={visibleItemLimit}
          estimatedItemHeightRem={compact ? 4 : 4.75}
          className="mt-4"
        >
          {data.horses.map((horse) => (
            <HorseRosterItem key={horse._id} data={data} horse={horse} compact={compact} />
          ))}
        </ScrollableList>
      ) : (
        <p className="mt-4 rounded-row border border-dashed border-border-subtle p-4 text-sm text-muted-foreground">
          No horses have been added to this stable yet.
        </p>
      )}
    </section>
  )
}

function HorseRosterItem({
  data,
  horse,
  compact,
}: {
  data: DashboardLabData
  horse: DashboardLabHorse
  compact: boolean
}) {
  const attention = data.attentionHorses.find((item) => item.horseId === horse._id)
  const secondaryMeta = [horse.breed, horse.discipline].filter(Boolean).join(' · ')
  const meta = [attention ? 'Needs care' : undefined, secondaryMeta || horse.ownerName || `${horse.age} years old`]
    .filter(Boolean)
    .join(' · ')

  return (
    <Link
      to="/stables/$stableId/horses/$horseId"
      params={{ stableId: data.stable._id, horseId: horse._id }}
      className={dashboardItemCardClassName({ density: 'compact', interactive: true })}
    >
      <DashboardItemCardContent
        title={horse.name}
        density="compact"
        media={<HorseAvatar horse={horse} compact={compact} />}
        meta={meta}
      />
    </Link>
  )
}

function HorseAvatar({ horse, compact }: { horse: DashboardLabHorse; compact: boolean }) {
  return (
    <div className={cn('shrink-0 overflow-hidden rounded-md border border-border-subtle bg-card', compact ? 'size-10' : 'size-12')}>
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
  )
}
