import {
  DashboardItemCardContent,
  dashboardItemCardClassName,
} from '#/components/dashboard/DashboardItemCard'
import {
  dashboardEmptyClassName,
  dashboardSectionClassName,
} from '#/components/dashboard/dashboardChrome'
import { buttonVariants } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

type HorseListPageLabProps = {
  data: DashboardLabData
}

export function HorseListPageLab({ data }: HorseListPageLabProps) {
  if (data.horses.length === 0) {
    return (
      <div className={dashboardEmptyClassName('cards')}>
        <p>No horses added yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <section className={dashboardSectionClassName('soft', 'grid gap-5')}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">All horses</h2>
          <Link
            to="/stables/$stableId/horses/create"
            params={{ stableId: data.stable._id }}
            className={buttonVariants({ variant: 'secondary' })}
          >
            Add horse
          </Link>
        </div>

        <div className="grid gap-3">
          {data.horses.map((horse) => (
            <article
              key={horse._id}
              className={dashboardItemCardClassName({
                interactive: true,
                chrome: 'soft',
                className:
                  'grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center',
              })}
            >
              <DashboardItemCardContent
                title={horse.name}
                leading={<HorseAvatar horse={horse} />}
                meta={
                  <>
                    <span>{horse.ownerName}</span>
                    {horse.breed && (
                      <>
                        <span>·</span>
                        <span>{horse.breed}</span>
                      </>
                    )}
                    {horse.age && (
                      <>
                        <span>·</span>
                        <span>{horse.age} years</span>
                      </>
                    )}
                  </>
                }
              />

              <Link
                to="/stables/$stableId/horses/$horseId"
                params={{ stableId: data.stable._id, horseId: horse._id }}
                className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Open
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function HorseAvatar({ horse }: { horse: DashboardLabData['horses'][number] }) {
  return (
    <div className="size-12 shrink-0 overflow-hidden rounded-row bg-card/70 sm:size-14">
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
