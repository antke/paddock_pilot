import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/stables/_layout/$stableId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const { data: stable } = useSuspenseQuery(
    convexQuery(api.stables.get, { id: stableId as Id<'stables'> }),
  )

  return (
    <div>
      <p>{stable?.name}</p>
    </div>
  )
}
