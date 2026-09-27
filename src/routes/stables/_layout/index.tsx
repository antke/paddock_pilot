import { StableListPage } from '#/components/stables/StableListPage'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'

export const Route = createFileRoute('/stables/_layout/')({
  component: RouteComponent,
})
function RouteComponent() {
  const { data: stables } = useSuspenseQuery(convexQuery(api.stables.list))
  return <StableListPage stables={stables} />
}
