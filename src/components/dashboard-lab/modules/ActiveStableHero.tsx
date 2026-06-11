import { AppDashboardNavigation } from '#/components/dashboard/AppDashboardNavigation'
import { buttonVariants } from '#/components/ui/button'
import { Link } from '@tanstack/react-router'
import type { DashboardLabChrome, DashboardLabData } from '../dashboardLabTypes'
import { dashboardHeroClassName } from './dashboardChrome'

type ActiveStableHeroProps = {
  data: DashboardLabData
  onActiveStableChange: (stableId: DashboardLabData['stable']['_id']) => void
  chrome?: DashboardLabChrome
}

export function ActiveStableHero({
  data,
  onActiveStableChange,
  chrome = 'cards',
}: ActiveStableHeroProps) {
  const { stable, overview } = data

  return (
    <section className={dashboardHeroClassName(chrome)}>
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
