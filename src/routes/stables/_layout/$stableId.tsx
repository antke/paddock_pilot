import { buttonVariants } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/stables/_layout/$stableId')({
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
    <>
      <div>
        <Link
          to="/stables/$stableId/edit"
          params={{ stableId }}
          className={buttonVariants({ variant: 'outline' })}
        >
          Edit
        </Link>
      </div>

      <div>
        <p>name: {stable?.name}</p>
        <p>owner: {owner?.firstName}</p>
        {stable?.description && <p>description: {stable?.description}</p>}
        <p>address: {stable?.location}</p>
      </div>
    </>
  )
}
