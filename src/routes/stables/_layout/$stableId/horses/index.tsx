import { dashboardSectionClassName } from '#/components/dashboard/dashboardChrome'
import { HorseList } from '#/components/horses/HorseList'
import { buttonVariants } from '#/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/horses/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  return (
    <section className={dashboardSectionClassName('soft', 'grid gap-6')}>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">Horses</h1>
          <p className="text-base leading-6 text-muted-foreground">
            All horse profiles in this stable.
          </p>
        </div>

        <Link
          to="/stables/$stableId/horses/create"
          params={{ stableId }}
          className={buttonVariants({ variant: 'secondary' })}
        >
          Add horse
        </Link>
      </header>

      <HorseList stableId={stableId} chrome="soft" />
    </section>
  )
}
