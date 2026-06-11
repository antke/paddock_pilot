import { EventList } from '#/components/events/EventList'
import { buttonVariants } from '#/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/events/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-sm text-muted-foreground">
            Scheduled work and appointments for this stable.
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

      <EventList stableId={stableId} />
    </div>
  )
}
