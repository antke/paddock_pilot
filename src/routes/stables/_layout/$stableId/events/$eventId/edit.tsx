import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'
import { PersonalEventEditor } from '#/components/ownership/PersonalEvents'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/events/$eventId/edit',
)({ component: Page })
function Page() {
  return (
    <PersonalEventEditor eventId={Route.useParams().eventId as Id<'events'>} />
  )
}
