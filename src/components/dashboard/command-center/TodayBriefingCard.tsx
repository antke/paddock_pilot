import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemBodyText } from '#/components/dashboard/DashboardItemCard'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { formatTime } from '#/lib/dateDisplay'
import type {
  DashboardCommandChrome,
  DashboardCommandData,
  DashboardCommandEvent,
} from './dashboardTypes'
import { DashboardInlinePanelLink } from '#/components/dashboard/DashboardInlinePanel'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardSectionHeader } from '#/components/dashboard/DashboardSectionHeader'
import { EventRow } from '#/components/events/EventRow'
import { ButtonLink } from '#/components/ui/button'

type TodayBriefingCardProps = {
  className?: string
  data: DashboardCommandData
  eventLimit?: number
  showNextEvent?: boolean
  showTimeline?: boolean
  chrome?: DashboardCommandChrome
}

export function TodayBriefingCard({
  className,
  data,
  eventLimit = 5,
  showNextEvent = true,
  showTimeline = true,
  chrome = 'cards',
}: TodayBriefingCardProps) {
  const events = data.todayEvents.slice(0, eventLimit)
  const nextEvent = getNextTodayEvent(data.todayEvents)
  const recordChrome = 'soft' as const

  return (
    <DashboardSection
      chrome={chrome}
      className={className}
      padding={chrome === 'cards' ? 'roomy' : 'default'}
    >
      <div
        className={
          showNextEvent
            ? 'grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]'
            : 'grid gap-5'
        }
      >
        <DashboardSectionHeader
          title="Today"
          size="section"
          titleStyle="display"
          actions={
            <ButtonLink
              to="/stables/$stableId/events/create"
              params={{ stableId: data.stable._id }}
              variant="secondary"
              size="sm"
            >
              Add event
            </ButtonLink>
          }
        />

        {showNextEvent && <NextEventPanel event={nextEvent} chrome={chrome} />}
      </div>

      {showTimeline &&
        (events.length === 0 ? (
          <DashboardEmptyState
            chrome={recordChrome}
            className="h-full min-h-40 place-content-center justify-items-center px-6 py-8 text-center"
            title="A quieter day at the stable"
            titleClassName="text-xl font-semibold tracking-normal md:text-2xl"
            bodyClassName="max-w-xl text-base text-muted-foreground md:text-lg"
          >
            Nothing is scheduled right now. Take the extra breathing room and
            enjoy a slower day.
          </DashboardEmptyState>
        ) : (
          <ScrollableList
            className="gap-3"
            fillParent
            itemCount={events.length}
            visibleItemLimit={eventLimit}
          >
            {events.map((event) => (
              <EventRow
                key={event._id}
                event={event}
                chrome={recordChrome}
                accent="primary"
                variant="contextual"
              />
            ))}
          </ScrollableList>
        ))}
    </DashboardSection>
  )
}

function NextEventPanel({
  event,
  chrome,
}: {
  event: DashboardCommandEvent | undefined
  chrome: DashboardCommandChrome
}) {
  if (!event) {
    return (
      <DashboardEmptyState
        chrome={chrome}
        title="No more events today"
        spacing={chrome === 'cards' ? 'compact' : 'default'}
      >
        Your stable calendar is clear for now.
      </DashboardEmptyState>
    )
  }

  return (
    <DashboardInlinePanelLink
      to="/stables/$stableId/events/$eventId"
      params={{ stableId: event.stableId, eventId: event._id }}
      chrome={chrome}
      tone="highlight"
      stack="compact"
      className="group/next"
    >
      <p className="text-3xl font-semibold tracking-normal text-primary">
        {event.time}
      </p>
      <p className="font-semibold transition-colors group-hover/next:text-primary">
        {event.title}
      </p>
      {event.location && (
        <DashboardItemBodyText tone="muted">
          {event.location}
        </DashboardItemBodyText>
      )}
    </DashboardInlinePanelLink>
  )
}

function getNextTodayEvent(events: Array<DashboardCommandEvent>) {
  const currentTime = formatTime(new Date())
  return events.find((event) => event.time >= currentTime) ?? events[0]
}
