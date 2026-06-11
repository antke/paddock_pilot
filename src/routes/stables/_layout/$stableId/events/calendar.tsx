import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { buttonVariants } from '#/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
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
    <div className="grid gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold">Event calendar</h1>
          <p className="text-sm text-muted-foreground">
            Browse this stable's schedule by month.
          </p>
        </div>

        <Link
          to="/stables/$stableId/events/create"
          params={{ stableId }}
          className={buttonVariants()}
        >
          Add event
        </Link>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{events.length} scheduled events</CardTitle>
          <CardDescription>
            Select any event in the calendar to open its details.
          </CardDescription>
        </CardHeader>
      </Card>

      <StableEventsCalendar events={events} />
    </div>
  )
}
