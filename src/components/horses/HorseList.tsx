import { Button } from '#/components/ui/button'
import { Item, ItemActions, ItemContent, ItemTitle } from '#/components/ui/item'
import { convexQuery } from '@convex-dev/react-query'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { isEmpty } from 'lodash'

type Props = {
  stableId: string
}

export function HorseList({ stableId }: Props) {
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stableId as Id<'stables'> }),
  )

  if (isEmpty(horses)) {
    return (
      <div>
        <p>No horses added yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 p-4">
      {horses.map((horse) => (
        <Item key={horse._id} variant={'outline'} className="max-w-md">
          <ItemTitle>{horse.name}</ItemTitle>
          <ItemContent>age: {horse.age}</ItemContent>
          {horse.breed && <ItemContent>{horse.breed}</ItemContent>}
          <ItemActions>
            <Link
              to="/stables/$stableId/horses/$horseId"
              params={{ stableId, horseId: horse._id }}
            >
              <Button variant={'outline'}>
                <ArrowRightIcon />
              </Button>
            </Link>
          </ItemActions>
        </Item>
      ))}
    </div>
  )
}
