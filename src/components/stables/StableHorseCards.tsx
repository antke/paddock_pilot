import { dashboardEmptyClassName } from '#/components/dashboard/dashboardChrome'
import { HorseCard } from '#/components/horses/HorseCard'
import { Button } from '#/components/ui/button'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type { Doc } from 'convex/_generated/dataModel'

type StableHorseCardsProps = {
  stableId: string
  horses: Array<Doc<'horses'>>
}

export function StableHorseCards({ stableId, horses }: StableHorseCardsProps) {
  if (horses.length === 0) {
    return (
      <div className={dashboardEmptyClassName('cards')}>
        <p className="font-medium text-foreground">No horses added yet.</p>
        <p>Add a horse to start building this stable roster.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {horses.map((horse) => (
        <HorseCard
          key={horse._id}
          horse={horse}
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
