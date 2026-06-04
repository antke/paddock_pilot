import { StableSettingsPage } from '#/components/stables/StableSettingsPage'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/stables/_layout/$stableId/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()

  const { data: settings } = useSuspenseQuery(
    convexQuery(api.stableMembers.listWithUsers, {
      stableId: stableId as Id<'stables'>,
    }),
  )

  return <StableSettingsPage settings={settings} />
}
