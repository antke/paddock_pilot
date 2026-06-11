import { AppDashboardNavigation } from '#/components/dashboard/AppDashboardNavigation'
import { buttonVariants } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import type { DashboardLabData } from '../dashboardLabTypes'

type ActiveStableHeroProps = {
  data: DashboardLabData
  onActiveStableChange: (stableId: DashboardLabData['stable']['_id']) => void
}

export function ActiveStableHero({ data, onActiveStableChange }: ActiveStableHeroProps) {
  const { stable, overview } = data

  return (
    <section className="overflow-hidden rounded-panel border border-primary/15 bg-[linear-gradient(135deg,hsl(var(--primary)/0.12),hsl(var(--card)),hsl(var(--muted)/0.55))] p-5 shadow-control md:p-7">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="grid max-w-3xl gap-3">
          <div className="grid gap-2">
            <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              {stable.name}
            </h1>
          </div>
        </div>

        <div className="grid gap-3 justify-items-start lg:justify-items-end">
          <AppDashboardNavigation
            stables={data.stables}
            activeStableId={stable._id}
            onActiveStableChange={onActiveStableChange}
          />
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link
              to="/stables/$stableId/horses/create"
              params={{ stableId: stable._id }}
              className={buttonVariants({ variant: 'outline' })}
            >
              Add horse
            </Link>
            <Link
              to="/stables/$stableId/events/create"
              params={{ stableId: stable._id }}
              className={buttonVariants()}
            >
              Add event
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
