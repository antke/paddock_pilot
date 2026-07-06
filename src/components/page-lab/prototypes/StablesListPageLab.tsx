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
import type { Doc } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

type StablesListPageLabProps = {
  data: DashboardLabData
  allEvents: Array<Doc<'events'>>
}

export function StablesListPageLab({
  data,
  allEvents,
}: StablesListPageLabProps) {
  const stableSummaries = data.stables.map((stable) => {
    const stableEvents = allEvents.filter(
      (event) => event.stableId === stable._id,
    )

    return {
      stable,
      eventCount: stableEvents.length,
      nextEvent: stableEvents.sort((a, b) => {
        const dateSort = a.date.localeCompare(b.date)
        if (dateSort !== 0) return dateSort
        return a.time.localeCompare(b.time)
      })[0],
    }
  })

  if (stableSummaries.length === 0) {
    return (
      <div className={dashboardEmptyClassName('cards')}>
        <p>No stables added yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <section className={dashboardSectionClassName('soft', 'grid gap-5')}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">All stables</h2>
          <Link to="/stables/create" className={buttonVariants()}>
            Create stable
          </Link>
        </div>

        <div className="grid gap-3">
          {stableSummaries.map(({ stable, eventCount, nextEvent }) => (
            <article
              key={stable._id}
              className={dashboardItemCardClassName({
                interactive: true,
                chrome: 'soft',
                className:
                  'grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center',
              })}
            >
              <DashboardItemCardContent
                title={stable.name}
                meta={
                  <>
                    <span>{stable.location}</span>
                    <span>·</span>
                    <span>{eventCount} events</span>
                    {nextEvent && (
                      <>
                        <span>·</span>
                        <span>Next: {nextEvent.title}</span>
                      </>
                    )}
                  </>
                }
              />

              <Link
                to="/stables/$stableId"
                params={{ stableId: stable._id }}
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
