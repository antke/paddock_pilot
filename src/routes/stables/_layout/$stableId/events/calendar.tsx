import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { ButtonLink } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/events/calendar',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  const { data: events } = useSuspenseQuery(
    convexQuery(api.events.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Event calendar"
        actions={
          <ButtonLink
            to="/stables/$stableId/events/create"
            params={{ stableId }}
            action="create"
          >
            Add event
          </ButtonLink>
        }
      />

      <StableEventsCalendar events={events} />
    </DashboardPage>
  )
}
