import {
  DashboardItemCardContent,
  dashboardItemCardClassName,
} from '#/components/dashboard/DashboardItemCard'
import { dashboardEmptyClassName } from '#/components/dashboard/dashboardChrome'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { isEmpty } from 'lodash'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/stables/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: stables } = useSuspenseQuery(convexQuery(api.stables.list))

  if (isEmpty(stables)) {
    return (
      <div className={dashboardEmptyClassName('cards')}>
        <p>No stables added yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {stables.map((stable) => (
        <div key={stable._id} className={dashboardItemCardClassName()}>
          <DashboardItemCardContent
            title={stable.name}
            meta={stable.location}
            badges={
              <Link to="/stables/$stableId" params={{ stableId: stable._id }}>
                <Button variant={'outline'}>
                  <ArrowRightIcon />
                </Button>
              </Link>
            }
          />
        </div>
      ))}
    </div>
  )
}
