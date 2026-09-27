import {
  StableEventsPage,
  parseEventsSearch,
} from '#/components/events/StableEventsPage'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

export const Route = createFileRoute('/stables/_layout/$stableId/events/')({
  validateSearch: parseEventsSearch,
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const { view } = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data: events } = useSuspenseQuery(
    convexQuery(api.events.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  return (
    <StableEventsPage
      stableId={stableId}
      events={events}
      view={view}
      onViewChange={(next) =>
        void navigate({
          search: next === 'log' ? { view: 'log' } : {},
          resetScroll: false,
        })
      }
    />
  )
}
