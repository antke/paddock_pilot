import {
  CalendarDayCell,
  CalendarDayEventList,
  CalendarDayHeader,
  CalendarDayNumber,
  CalendarEventChipLink,
  CalendarEventChipMeta,
  CalendarEventChipTitle,
  CalendarGrid,
  CalendarMoreEventsButton,
  CalendarShell,
  CalendarWeekdayCell,
  CalendarWeekdayRow,
} from '#/components/events/EventCalendar'
import { EventRow } from '#/components/events/EventRow'
import {
  formatEventDate,
  formatEventDateTime,
} from '#/components/events/eventDisplay'
import { DashboardCountBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import {
  DashboardSectionCard,
  DashboardSubsection,
} from '#/components/dashboard/DashboardSectionCard'
import { Button } from '#/components/ui/button'
import { getTodayDateKey } from '#/lib/dateDisplay'
import { formatCountLabel } from '#/lib/numberDisplay'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { eventStatusLabels } from 'shared/events/eventSchema'
import {
  addMonths,
  formatMonthLabel,
  getCalendarMonthOccurrences,
  getMonthDays,
  getMonthLeadingDayCount,
  groupCalendarOccurrencesByDate,
  startOfMonth,
  weekdayLabels,
} from './stableDashboardDates'
import type {
  StableCalendarDayOccurrence,
  StableCalendarOccurrence,
  StableDashboardEvent,
} from './stableDashboardDates'

type StableEventsCalendarProps = {
  events: Array<StableDashboardEvent>
}

type CalendarCell =
  | { key: string; kind: 'empty' }
  | { date: Date; key: string; kind: 'day' }

export function StableEventsCalendar({ events }: StableEventsCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date()),
  )
  const [selectedDateKey, setSelectedDateKey] = useState<string>()
  const [calendarAnnouncement, setCalendarAnnouncement] = useState('')
  const selectedAgendaId = useId()
  const selectedAgendaRef = useRef<HTMLDivElement>(null)
  const selectedAgendaTriggerRef = useRef<HTMLButtonElement>(null)
  const todayKey = getTodayDateKey()
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth])
  const visibleMonthOccurrences = useMemo(
    () => getCalendarMonthOccurrences(events, visibleMonth),
    [events, visibleMonth],
  )
  const occurrencesByDate = useMemo(
    () => groupCalendarOccurrencesByDate(visibleMonthOccurrences, visibleMonth),
    [visibleMonth, visibleMonthOccurrences],
  )
  const selectedDayOccurrences = selectedDateKey
    ? (occurrencesByDate.get(selectedDateKey) ?? [])
    : []
  const leadingDays = getMonthLeadingDayCount(visibleMonth)
  const trailingDays = (7 - ((leadingDays + monthDays.length) % 7)) % 7
  const calendarCells: Array<CalendarCell> = [
    ...Array.from({ length: leadingDays }, (_, index) => ({
      key: `empty-${index}`,
      kind: 'empty' as const,
    })),
    ...monthDays.map(({ date, key }) => ({ date, key, kind: 'day' as const })),
    ...Array.from({ length: trailingDays }, (_, index) => ({
      key: `trailing-empty-${index}`,
      kind: 'empty' as const,
    })),
  ]
  const calendarWeeks = Array.from(
    { length: Math.ceil(calendarCells.length / 7) },
    (_, index) => calendarCells.slice(index * 7, index * 7 + 7),
  )

  useEffect(() => {
    if (selectedDateKey) selectedAgendaRef.current?.focus()
  }, [selectedDateKey])

  const selectMonth = (month: Date) => {
    setVisibleMonth(month)
    setSelectedDateKey(undefined)
    selectedAgendaTriggerRef.current = null
    setCalendarAnnouncement(
      `${formatMonthLabel(month)}, ${formatCountLabel(getCalendarMonthOccurrences(events, month).length, 'event')} this month.`,
    )
  }

  const closeSelectedAgenda = () => {
    selectedAgendaTriggerRef.current?.focus()
    setSelectedDateKey(undefined)
  }

  return (
    <DashboardSectionCard
      title={formatMonthLabel(visibleMonth)}
      description={`${formatCountLabel(visibleMonthOccurrences.length, 'event')} this month`}
      descriptionSize="sm"
      contentGap="comfortable"
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => selectMonth(addMonths(visibleMonth, -1))}
          >
            <CaretLeftIcon aria-hidden="true" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => selectMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => selectMonth(addMonths(visibleMonth, 1))}
          >
            Next
            <CaretRightIcon aria-hidden="true" />
          </Button>
        </>
      }
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {calendarAnnouncement}
      </p>

      <DashboardSubsection
        as="h3"
        className="md:hidden"
        gap="compact"
        title="Monthly agenda"
      >
        {visibleMonthOccurrences.length === 0 ? (
          <DashboardEmptyState chrome="soft" spacing="flush">
            No events are scheduled this month.
          </DashboardEmptyState>
        ) : (
          <DashboardItemList gap="compact">
            {visibleMonthOccurrences.map((occurrence) => (
              <EventRow
                key={occurrence.occurrenceKey}
                event={getOccurrenceDisplayEvent(occurrence)}
                chrome="soft"
                horseCount={occurrence.event.horseIds.length}
                supplementalMeta={
                  occurrence.durationDays > 1
                    ? [`Through ${formatEventDate(occurrence.endDate)}`]
                    : []
                }
                variant="agenda"
              />
            ))}
          </DashboardItemList>
        )}
      </DashboardSubsection>

      <CalendarShell
        className="hidden md:block"
        role="grid"
        aria-label={`${formatMonthLabel(visibleMonth)} event calendar`}
      >
        <CalendarWeekdayRow role="row">
          {weekdayLabels.map((weekday) => (
            <CalendarWeekdayCell role="columnheader" key={weekday}>
              {weekday}
            </CalendarWeekdayCell>
          ))}
        </CalendarWeekdayRow>

        <CalendarGrid role="rowgroup">
          {calendarWeeks.map((week, weekIndex) => (
            <div role="row" className="contents" key={`week-${weekIndex}`}>
              {week.map((cell) => {
                if (cell.kind === 'empty') {
                  return (
                    <CalendarDayCell
                      key={cell.key}
                      role="gridcell"
                      aria-hidden="true"
                      muted
                    />
                  )
                }

                const dateOccurrences = occurrencesByDate.get(cell.key) ?? []
                const visibleEvents = dateOccurrences.slice(0, 2)
                const hiddenEventCount =
                  dateOccurrences.length - visibleEvents.length
                const isToday = cell.key === todayKey
                const isSelected = cell.key === selectedDateKey
                const fullDate = formatEventDate(cell.key)

                return (
                  <CalendarDayCell
                    key={cell.key}
                    role="gridcell"
                    aria-label={fullDate}
                    aria-current={isToday ? 'date' : undefined}
                    isToday={isToday}
                    isSelected={isSelected}
                  >
                    <CalendarDayHeader>
                      <CalendarDayNumber isToday={isToday}>
                        {cell.date.getDate()}
                      </CalendarDayNumber>
                      {dateOccurrences.length > 0 && (
                        <DashboardCountBadge
                          count={dateOccurrences.length}
                          variant="secondary"
                        />
                      )}
                    </CalendarDayHeader>

                    <CalendarDayEventList>
                      {visibleEvents.map((dayOccurrence) => (
                        <CalendarEventLink
                          key={`${dayOccurrence.occurrence.occurrenceKey}-${cell.key}`}
                          dayOccurrence={dayOccurrence}
                        />
                      ))}

                      {hiddenEventCount > 0 && (
                        <CalendarMoreEventsButton
                          aria-controls={selectedAgendaId}
                          aria-expanded={isSelected}
                          aria-label={`${isSelected ? 'Hide' : 'Show'} ${formatCountLabel(hiddenEventCount, 'additional event')} on ${fullDate}`}
                          onClick={(event) => {
                            if (isSelected) {
                              setSelectedDateKey(undefined)
                              return
                            }

                            selectedAgendaTriggerRef.current =
                              event.currentTarget
                            setSelectedDateKey(cell.key)
                          }}
                        >
                          {isSelected
                            ? 'Hide day agenda'
                            : `+${hiddenEventCount} more`}
                        </CalendarMoreEventsButton>
                      )}
                    </CalendarDayEventList>
                  </CalendarDayCell>
                )
              })}
            </div>
          ))}
        </CalendarGrid>
      </CalendarShell>

      {selectedDateKey && selectedDayOccurrences.length > 0 && (
        <div
          id={selectedAgendaId}
          ref={selectedAgendaRef}
          role="region"
          aria-label={`Events on ${formatEventDate(selectedDateKey)}`}
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeSelectedAgenda()
          }}
          className="hidden scroll-mt-24 rounded-panel border-t border-border-subtle pt-5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:block"
        >
          <DashboardSubsection
            as="h3"
            aside={
              <Button
                type="button"
                variant="subtle"
                size="sm"
                onClick={closeSelectedAgenda}
              >
                Close
              </Button>
            }
            gap="compact"
            title={`Events on ${formatEventDate(selectedDateKey)}`}
          >
            <DashboardItemList gap="compact">
              {selectedDayOccurrences.map((dayOccurrence) => (
                <EventRow
                  key={dayOccurrence.occurrence.occurrenceKey}
                  event={getOccurrenceDisplayEvent(dayOccurrence.occurrence)}
                  chrome="soft"
                  horseCount={dayOccurrence.occurrence.event.horseIds.length}
                  leadingLabel={getDayOccurrenceLabel(dayOccurrence)}
                  showRecurrence={false}
                  supplementalMeta={
                    dayOccurrence.occurrence.durationDays > 1
                      ? [
                          `${formatEventDate(dayOccurrence.occurrence.startDate)} – ${formatEventDate(dayOccurrence.occurrence.endDate)}`,
                        ]
                      : []
                  }
                  variant="contextual"
                />
              ))}
            </DashboardItemList>
          </DashboardSubsection>
        </div>
      )}
    </DashboardSectionCard>
  )
}

function CalendarEventLink({
  dayOccurrence,
}: {
  dayOccurrence: StableCalendarDayOccurrence
}) {
  const { occurrence } = dayOccurrence
  const event = occurrence.event
  const timingLabel = getDayOccurrenceLabel(dayOccurrence)
  const statusLabel =
    event.status && event.status !== 'planned'
      ? eventStatusLabels[event.status]
      : null

  return (
    <CalendarEventChipLink
      to="/stables/$stableId/events/$eventId"
      params={{ stableId: event.stableId, eventId: event._id }}
      aria-label={`${event.title}, ${formatEventDateTime(occurrence.startDate, event.time, occurrence.endDate)}${dayOccurrence.position === 'single' || dayOccurrence.position === 'start' ? '' : `, ${timingLabel.toLowerCase()} on ${formatEventDate(dayOccurrence.dateKey)}`}${statusLabel ? `, ${statusLabel.toLowerCase()}` : ''}`}
    >
      <CalendarEventChipTitle>{event.title}</CalendarEventChipTitle>
      <CalendarEventChipMeta>
        {[timingLabel, statusLabel].filter(Boolean).join(' · ')}
      </CalendarEventChipMeta>
    </CalendarEventChipLink>
  )
}

function getOccurrenceDisplayEvent(occurrence: StableCalendarOccurrence) {
  return {
    ...occurrence.event,
    date: occurrence.startDate,
    endDate: occurrence.durationDays > 1 ? occurrence.endDate : undefined,
  }
}

function getDayOccurrenceLabel({
  occurrence,
  position,
}: StableCalendarDayOccurrence) {
  if (position === 'single' || position === 'start')
    return occurrence.event.time
  if (position === 'end') return 'Ends today'
  return 'Continues'
}
