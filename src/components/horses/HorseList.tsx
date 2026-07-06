import { dashboardEmptyClassName } from '#/components/dashboard/dashboardChrome'
import type { DashboardChrome } from '#/components/dashboard/dashboardChrome'
import { Button } from '#/components/ui/button'
import { HorseCard } from './HorseCard'
import { convexQuery } from '@convex-dev/react-query'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { isEmpty } from 'lodash'

type Props = {
  stableId: string
  chrome?: DashboardChrome
}

export function HorseList({ stableId, chrome = 'cards' }: Props) {
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stableId as Id<'stables'> }),
  )

  if (isEmpty(horses)) {
    return (
      <div className={dashboardEmptyClassName(chrome)}>
        <p>No horses added yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {horses.map((horse) => (
        <HorseCard
          key={horse._id}
          horse={horse}
          chrome={chrome}
          action={
            <Link
              to="/stables/$stableId/horses/$horseId"
              params={{ stableId, horseId: horse._id }}
            >
              <Button variant="ghost" size="icon-sm" className="shadow-none">
                <ArrowRightIcon />
              </Button>
            </Link>
          }
        />
      ))}
    </div>
  )
}
