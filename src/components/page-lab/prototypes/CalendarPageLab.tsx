import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { CalendarSample } from '#/components/design/CalendarSample'
import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { ButtonLink } from '#/components/ui/button'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

export function CalendarPageLab({ data }: { data: DashboardLabData }) {
  const bypass = useDevAuthBypassEnabled()
  const sample = import.meta.env.DEV && bypass
  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Event calendar"
        actions={
          !sample && (
            <ButtonLink
              to="/stables/$stableId/events/create"
              params={{ stableId: data.stable._id }}
              action="create"
            >
              Add event
            </ButtonLink>
          )
        }
      />
      {sample ? (
        <CalendarSample showUpdateControls />
      ) : (
        <StableEventsCalendar
          key={data.stable._id}
          events={data.events.filter(
            (event) => event.stableId === data.stable._id,
          )}
        />
      )}
    </DashboardPage>
  )
}
