import { EventList } from '#/components/events/EventList'
import { dashboardSectionClassName } from '#/components/dashboard/dashboardChrome'
import { buttonVariants } from '#/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/events/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  return (
    <div className="grid gap-6">
      <section className={dashboardSectionClassName('soft', 'grid gap-6')}>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
            <p className="text-base leading-6 text-muted-foreground">
              Scheduled work and appointments for this stable.
            </p>
          </div>

          <Link
            to="/stables/$stableId/events/create"
            params={{ stableId }}
            className={buttonVariants({ variant: 'secondary' })}
          >
            Add event
          </Link>
        </header>

        <EventList stableId={stableId} />
      </section>
    </div>
  )
}
