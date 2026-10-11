import { createFileRoute } from '@tanstack/react-router'
import type { Id } from 'convex/_generated/dataModel'
import { PersonalEventDetail } from '#/components/ownership/PersonalEvents'

export const Route = createFileRoute('/events/$eventId/')({
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
  const { eventId } = Route.useParams()
  return (
    <PersonalEventDetail
      eventId={eventId as Id<'events'>}
      date={Route.useSearch().date}
      horseId={Route.useSearch().horseId}
      participationId={Route.useSearch().participationId}
    />
  )
}
