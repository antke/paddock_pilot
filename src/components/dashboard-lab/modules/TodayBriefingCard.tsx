import { Link } from '@tanstack/react-router'
import type { DashboardLabData, DashboardLabEvent } from '../dashboardLabTypes'
import { EventLinkCard } from './EventLinkCard'

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

type TodayBriefingCardProps = {
  data: DashboardLabData
  eventLimit?: number
  showNextEvent?: boolean
  showTimeline?: boolean
}

export function TodayBriefingCard({
  data,
  eventLimit = 5,
  showNextEvent = true,
  showTimeline = true,
}: TodayBriefingCardProps) {
  const events = (data.todayEvents.length > 0 ? data.todayEvents : data.events).slice(0, eventLimit)
  const nextEvent = getNextTodayEvent(data.todayEvents)
  const briefingText = createBriefingText(data, nextEvent)

  return (
    <section className="rounded-panel border border-primary/15 bg-card/85 p-5 shadow-control md:p-6">
      <div className={showNextEvent ? 'grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]' : 'grid gap-5'}>
        <div className="grid gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Today at {data.stable.name}
            </h2>
            <p className={showNextEvent ? 'mt-3 max-w-3xl text-balance text-base leading-7 text-muted-foreground md:text-lg' : 'mt-3 text-balance text-base leading-7 text-muted-foreground md:text-lg'}>
              {briefingText}
            </p>
          </div>
        </div>

        {showNextEvent && <NextEventPanel event={nextEvent} />}
      </div>

      {showTimeline && (
        <div className="mt-6 grid gap-3">
          {events.length === 0 ? (
            <p className="rounded-row border border-dashed border-border-subtle p-4 text-sm text-muted-foreground">
              No scheduled work is visible yet.
            </p>
          ) : (
            events.map((event) => <EventLinkCard key={event._id} event={event} />)
          )}
        </div>
      )}
    </section>
  )
}

function NextEventPanel({ event }: { event: DashboardLabEvent | undefined }) {
  if (!event) {
    return (
      <div className="rounded-row border border-dashed border-border-subtle bg-muted/25 p-4">
        <p className="text-sm font-semibold">No more events today</p>
        <p className="mt-1 text-sm text-muted-foreground">Your stable calendar is clear for now.</p>
      </div>
    )
  }

  return (
    <Link
      to="/stables/$stableId/events/$eventId"
      params={{ stableId: event.stableId, eventId: event._id }}
      className="group/next rounded-row border border-primary/20 bg-primary/8 p-4 transition-colors hover:border-primary/35 hover:bg-primary/12 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none"
    >
      <p className="text-3xl font-semibold tracking-tight text-primary">{event.time}</p>
      <p className="mt-2 font-semibold underline-offset-4 group-hover/next:underline">{event.title}</p>
      {event.location && <p className="mt-1 text-sm text-muted-foreground">{event.location}</p>}
    </Link>
  )
}

function getNextTodayEvent(events: Array<DashboardLabEvent>) {
  const currentTime = timeFormatter.format(new Date())
  return events.find((event) => event.time >= currentTime) ?? events[0]
}

function createBriefingText(data: DashboardLabData, nextEvent: DashboardLabEvent | undefined) {
  const eventCount = data.todayEvents.length
  const reminderCount = data.overview.summary.dueReminderCount
  const alertCount = data.overview.summary.highSeverityIssueCount

  if (nextEvent) {
    return `You have ${eventCount} scheduled ${eventCount === 1 ? 'event' : 'events'} today. The next one is ${nextEvent.title} at ${nextEvent.time}${nextEvent.location ? ` in ${nextEvent.location}` : ''}. There are also ${reminderCount} care ${reminderCount === 1 ? 'reminder' : 'reminders'} and ${alertCount} high alert ${alertCount === 1 ? 'signal' : 'signals'} to keep an eye on.`
  }

  return `There are no scheduled events left today. You still have ${reminderCount} care ${reminderCount === 1 ? 'reminder' : 'reminders'} and ${alertCount} high alert ${alertCount === 1 ? 'signal' : 'signals'} visible for ${data.stable.name}.`
}
