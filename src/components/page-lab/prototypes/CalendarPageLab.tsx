import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { Button } from '#/components/ui/button'

export function CalendarPageLab({ data }: { data: DashboardLabData }) {
  const events = data.events.filter(
    (event) => event.stableId === data.stable._id,
  )

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Event calendar"
        actions={<Button variant="secondary">Add event</Button>}
      />

      <DashboardSectionCard
        title={`${events.length} scheduled events`}
      />

      <StableEventsCalendar events={events} />
    </DashboardPage>
  )
}
