import { Popover } from '@base-ui/react/popover'
import {
  CalendarDayCell,
  CalendarDayEventList,
  CalendarDayHeader,
  CalendarDayNumber,
  CalendarEventChipLink,
  CalendarEventChipMeta,
  CalendarEventChipTitle,
  CalendarEventPopover,
  CalendarEventPopoverDescription,
  CalendarEventPopoverHeader,
  CalendarEventPopoverText,
  CalendarEventPopoverTitle,
  CalendarGrid,
  CalendarMutedPill,
  CalendarShell,
  CalendarWeekdayCell,
  CalendarWeekdayRow,
} from '#/components/events/EventCalendar'
import {
  EventStatusBadge,
  EventTypeBadge,
} from '#/components/events/EventBadges'
import { formatEventDateTime } from '#/components/events/eventDisplay'
import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { DashboardCountBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Button, ButtonLink } from '#/components/ui/button'
import { getTodayDateKey } from '#/lib/dateDisplay'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import {
  addMonths,
  formatMonthLabel,
  getMonthDays,
  groupEventsByDate,
  startOfMonth,
  weekdayLabels,
} from './stableDashboardDates'
import type { StableDashboardEvent } from './stableDashboardDates'

type StableEventsCalendarProps = {
  events: Array<StableDashboardEvent>
}

export function StableEventsCalendar({ events }: StableEventsCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date()),
  )
  const todayKey = getTodayDateKey()
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth])
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events])
  const leadingDays = Array.from(
    { length: visibleMonth.getDay() },
    (_, index) => index,
  )
  const trailingDays = Array.from(
    { length: (7 - ((leadingDays.length + monthDays.length) % 7)) % 7 },
    (_, index) => index,
  )

  return (
    <DashboardSectionCard
      title={formatMonthLabel(visibleMonth)}
      contentLayout="block"
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
          >
            Next
          </Button>
        </>
      }
    >
      <CalendarShell>
        <CalendarWeekdayRow>
          {weekdayLabels.map((weekday) => (
            <CalendarWeekdayCell key={weekday}>{weekday}</CalendarWeekdayCell>
          ))}
        </CalendarWeekdayRow>

        <CalendarGrid>
          {leadingDays.map((day) => (
            <CalendarDayCell key={`empty-${day}`} muted />
          ))}

          {monthDays.map(({ date, key }) => {
            const dateEvents = eventsByDate.get(key) ?? []
            const visibleEvents = dateEvents.slice(0, 2)
            const hiddenEventCount = dateEvents.length - visibleEvents.length

            return (
              <CalendarDayCell key={key} isToday={key === todayKey}>
                <CalendarDayHeader>
                  <CalendarDayNumber isToday={key === todayKey}>
                    {date.getDate()}
                  </CalendarDayNumber>

                  {dateEvents.length > 0 && (
                    <DashboardCountBadge
                      count={dateEvents.length}
                      variant="secondary"
                    />
                  )}
                </CalendarDayHeader>

                <CalendarDayEventList>
                  {visibleEvents.map((event) => (
                    <CalendarEventChip key={event._id} event={event} />
                  ))}

                  {hiddenEventCount > 0 && (
                    <CalendarMutedPill>
                      +{hiddenEventCount} more
                    </CalendarMutedPill>
                  )}
                </CalendarDayEventList>
              </CalendarDayCell>
            )
          })}

          {trailingDays.map((day) => (
            <CalendarDayCell key={`trailing-empty-${day}`} muted />
          ))}
        </CalendarGrid>
      </CalendarShell>
    </DashboardSectionCard>
  )
}

function CalendarEventChip({ event }: { event: StableDashboardEvent }) {
  return (
    <Popover.Root>
      <Popover.Trigger
        nativeButton={false}
        openOnHover
        delay={120}
        closeDelay={120}
        render={
          <CalendarEventChipLink
            to="/stables/$stableId/events/$eventId"
            params={{ stableId: event.stableId, eventId: event._id }}
          />
        }
      >
        <CalendarEventChipTitle>{event.title}</CalendarEventChipTitle>
        <CalendarEventChipMeta>{event.time}</CalendarEventChipMeta>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="top" align="start" sideOffset={8}>
          <Popover.Popup initialFocus={false} render={<CalendarEventPopover />}>
            <CalendarEventPopoverHeader>
              <CalendarEventPopoverTitle>
                {event.title}
              </CalendarEventPopoverTitle>
              <CalendarEventPopoverText>
                {formatEventDateTime(event.date, event.time, event.endDate)}
              </CalendarEventPopoverText>
            </CalendarEventPopoverHeader>

            <DashboardBadgeList>
              <EventTypeBadge type={event.type} />
              <EventStatusBadge status={event.status ?? 'planned'} />
            </DashboardBadgeList>

            {event.location && (
              <CalendarEventPopoverText>
                Location: {event.location}
              </CalendarEventPopoverText>
            )}

            {event.description && (
              <CalendarEventPopoverDescription>
                {event.description}
              </CalendarEventPopoverDescription>
            )}

            <ButtonLink
              to="/stables/$stableId/events/$eventId"
              params={{ stableId: event.stableId, eventId: event._id }}
              variant="secondary"
              size="xs"
            >
              Open event
              <ArrowRightIcon data-icon="inline-end" weight="bold" />
            </ButtonLink>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
