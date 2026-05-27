import { Item, ItemActions, ItemContent, ItemTitle } from '#/components/ui/item'
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
      <div>
        <p>No stables added yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {stables.map((stable) => (
        <Item key={stable._id} variant={'outline'}>
          <ItemTitle>{stable.name}</ItemTitle>
          <ItemContent>{stable.location}</ItemContent>
          <ItemActions>
            <Link to="/stables/$stableId" params={{ stableId: stable._id }}>
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
