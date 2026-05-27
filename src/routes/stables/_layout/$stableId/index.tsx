import { HorseList } from '#/components/horses/HorseList'
import { buttonVariants } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
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
      <div className="flex flex-wrap gap-4">
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

      <Card className="w-full">
        <CardHeader>
          <CardTitle>{stable?.name}</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-2 text-sm">
          <p>owner: {owner?.firstName}</p>
          {stable?.description && <p>description: {stable?.description}</p>}
          <p>address: {stable?.location}</p>
        </CardContent>
      </Card>

      <section className="grid gap-4">
        <h2 className="font-semibold">Horses in the stable</h2>

        <HorseList stableId={stableId} />
      </section>
    </div>
  )
}
