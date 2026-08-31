import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ButtonLink } from '#/components/ui/button'
import { StableCardLink } from '#/components/stables/StableCard'
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
        actions={
          <ButtonLink to="/stables/create" action="create">
            Create stable
          </ButtonLink>
        }
      />

      <DashboardSectionCard contentGap="comfortable">
        <DashboardItemList gap="flush">
          {stableSummaries.map(({ stable, eventCount, nextEvent }) => (
            <StableCardLink
              key={stable._id}
              stableId={stable._id}
              name={stable.name}
              location={stable.location}
              meta={[
                <span key="events">{eventCount} events</span>,
                nextEvent ? (
                  <span key="next-event">Next: {nextEvent.title}</span>
                ) : null,
              ]}
            />
          ))}
        </DashboardItemList>
      </DashboardSectionCard>
    </DashboardPage>
  )
}
