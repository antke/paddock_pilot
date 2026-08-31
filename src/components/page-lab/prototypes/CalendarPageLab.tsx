import type {
  DashboardLabData,
  DashboardLabEvent,
} from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { ButtonLink } from '#/components/ui/button'
import { formatDateKey } from '#/lib/dateDisplay'
import type { Id } from 'convex/_generated/dataModel'

export function CalendarPageLab({ data }: { data: DashboardLabData }) {
  const events = createCalendarLabEvents(
    data.events.filter((event) => event.stableId === data.stable._id),
  )

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Event calendar"
        actions={
          <ButtonLink
            to="/stables/$stableId/events/create"
            params={{ stableId: data.stable._id }}
            action="create"
          >
            Add event
          </ButtonLink>
        }
      />

      <StableEventsCalendar events={events} />
    </DashboardPage>
  )
}

function createCalendarLabEvents(events: Array<DashboardLabEvent>) {
  const baseEvent = events[0]
  if (!baseEvent) return events
  const denseDate = formatDateKey(new Date())

  const denseDayEvents: Array<DashboardLabEvent> = [
    {
      ...baseEvent,
      _id: 'lab-calendar-dense-1' as Id<'events'>,
      title: 'Arena confidence session with visiting instructor',
      date: denseDate,
      time: '08:00',
      type: 'training',
      status: 'planned',
    },
    {
      ...baseEvent,
      _id: 'lab-calendar-dense-2' as Id<'events'>,
      title: 'Farrier follow-up',
      date: denseDate,
      time: '09:15',
      type: 'hoof_trimming',
      status: 'planned',
    },
    {
      ...baseEvent,
      _id: 'lab-calendar-dense-3' as Id<'events'>,
      title: 'Dental review',
      date: denseDate,
      time: '12:30',
      type: 'dentist',
      status: 'completed',
    },
    {
      ...baseEvent,
      _id: 'lab-calendar-dense-4' as Id<'events'>,
      title: 'Cancelled evening massage appointment',
      date: denseDate,
      time: '18:45',
      type: 'massage',
      status: 'cancelled',
    },
  ]

  const currentMonthStart = new Date()
  currentMonthStart.setDate(1)
  const previousMonthEnd = new Date(currentMonthStart)
  previousMonthEnd.setDate(0)
  const rangeEnd = new Date(currentMonthStart)
  rangeEnd.setDate(2)

  const spanningEvent: DashboardLabEvent = {
    ...baseEvent,
    _id: 'lab-calendar-spanning' as Id<'events'>,
    title: 'Three-day yard clinic',
    date: formatDateKey(previousMonthEnd),
    endDate: formatDateKey(rangeEnd),
    time: '09:00',
    type: 'training',
    status: 'planned',
  }

  const recurringEvent: DashboardLabEvent = {
    ...baseEvent,
    _id: 'lab-calendar-recurring' as Id<'events'>,
    title: 'Weekly condition check',
    date: formatDateKey(currentMonthStart),
    endDate: undefined,
    time: '07:30',
    type: 'vet',
    status: 'planned',
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: [currentMonthStart.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6],
      end: { type: 'after_occurrences', count: 4 },
    },
  }

  return [...events, ...denseDayEvents, spanningEvent, recurringEvent]
}
