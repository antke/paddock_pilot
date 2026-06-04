import { HorseCard } from '#/components/horses/HorseCard'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
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
      <Alert>
        <AlertTitle>No horses added yet.</AlertTitle>
        <AlertDescription>
          Add a horse to start building this stable roster.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {horses.map((horse) => (
        <HorseCard
          key={horse._id}
          horse={horse}
          action={
            <Link
              to="/stables/$stableId/horses/$horseId"
              params={{ stableId, horseId: horse._id }}
            >
              <Button variant="outline" size="icon-sm">
                <ArrowRightIcon />
              </Button>
            </Link>
          }
        />
      ))}
    </div>
  )
}
