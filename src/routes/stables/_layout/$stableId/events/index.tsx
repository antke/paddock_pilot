import {
  ActivityCalendarFilter,
  useActivityCalendars,
} from '#/components/events/ActivityCalendarFilter'
import { MyActivityInvitations } from '#/components/events/ActivityPeople'
import {
  StableEventsPage,
  parseEventsSearch,
} from '#/components/events/StableEventsPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/stables/_layout/$stableId/events/')({
  validateSearch: parseEventsSearch,
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const { view } = Route.useSearch()
  const navigate = Route.useNavigate()
  const calendars = useActivityCalendars(false, stableId)
  return (
    <StableEventsPage
      stableId={stableId}
      events={calendars.data?.events ?? []}
      horses={calendars.data?.horses ?? []}
      notices={<MyActivityInvitations invitationsOnly />}
      filters={
        <ActivityCalendarFilter
          stables={calendars.stables}
          selected={calendars.selected}
          onChange={calendars.setSelected}
          loading={calendars.loading}
        />
      }
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
