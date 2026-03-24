import { HorseList } from '#/components/horses/HorseList'
import { buttonVariants } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/stables/_layout/$stableId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  const { data } = useSuspenseQuery(
    convexQuery(api.stables.getWithOwner, { id: stableId as Id<'stables'> }),
  )
  const stable = data?.stable
  const owner = data?.owner

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-4 align-middle justify-center">
        <Link
          to="/stables/$stableId/edit"
          params={{ stableId }}
          className={buttonVariants({ variant: 'outline' })}
        >
          Edit
        </Link>

        <Link
          to="/stables/$stableId/horses/create"
          params={{ stableId }}
          className={buttonVariants({ variant: 'outline' })}
        >
          Add horse
        </Link>

        <Link
          to="/stables/$stableId/events/create"
          params={{ stableId }}
          className={buttonVariants({ variant: 'outline' })}
        >
          Add event
        </Link>
      </div>

      <div>
        <p>name: {stable?.name}</p>
        <p>owner: {owner?.firstName}</p>
        {stable?.description && <p>description: {stable?.description}</p>}
        <p>address: {stable?.location}</p>
      </div>

      <div>
        <p>Horses in the stable </p>

        <HorseList stableId={stableId} />
      </div>
    </div>
  )
}
