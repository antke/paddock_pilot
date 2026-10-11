import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'
import { PersonalEventEditor } from '#/components/ownership/PersonalEvents'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/training/$eventId/edit',
)({
  validateSearch: (
    s,
  ): { date?: string; horseId?: string; participationId?: string } => ({
    date: typeof s.date === 'string' ? s.date : undefined,
    horseId: typeof s.horseId === 'string' ? s.horseId : undefined,
    participationId:
      typeof s.participationId === 'string' ? s.participationId : undefined,
  }),
  component: Page,
})
function Page() {
  return (
    <PersonalEventEditor
      {...Route.useSearch()}
      eventId={Route.useParams().eventId as Id<'events'>}
    />
  )
}
