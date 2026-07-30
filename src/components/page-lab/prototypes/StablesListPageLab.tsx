import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemLinkCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ButtonLink } from '#/components/ui/button'
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
      <DashboardEmptyState chrome="cards">
        No stables added yet.
      </DashboardEmptyState>
    )
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="All stables"
        actions={<ButtonLink to="/stables/create">Create stable</ButtonLink>}
      />

      <DashboardSectionCard contentGap="comfortable">
        <DashboardItemList gap="flush">
          {stableSummaries.map(({ stable, eventCount, nextEvent }) => (
            <DashboardItemLinkCard
              key={stable._id}
              to="/stables/$stableId"
              params={{ stableId: stable._id }}
              chrome="soft"
              className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
            >
              <DashboardItemCardContent
                title={stable.name}
                metaSeparator="dot"
                meta={
                  <>
                    <span>{stable.location}</span>
                    <span>{eventCount} events</span>
                    {nextEvent && <span>Next: {nextEvent.title}</span>}
                  </>
                }
              />

              <span className="text-sm font-semibold text-primary transition-colors group-hover/dashboard-item:text-foreground">
                Open stable
              </span>
            </DashboardItemLinkCard>
          ))}
        </DashboardItemList>
      </DashboardSectionCard>
    </DashboardPage>
  )
}
