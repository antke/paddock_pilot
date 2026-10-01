import { useT, useLocale } from '#/i18n/LocaleProvider'
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
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Locale } from 'shared/i18n/locale'
import { localeInstances } from '#/i18n/resources'
import {
  addMonths,
  formatMonthLabel,
  getCalendarMonthOccurrences,
  getMonthDays,
  getMonthLeadingDayCount,
  groupCalendarOccurrencesByDate,
  startOfMonth,
  getWeekdayLabels,
} from './stableDashboardDates'
import type {
  StableCalendarDayOccurrence,
  StableCalendarOccurrence,
  StableDashboardEvent,
} from './stableDashboardDates'

type StableEventsCalendarProps = {
  events: Array<StableDashboardEvent>
  surface?: 'flat' | 'panel'
  initialMonth?: Date
}

type CalendarCell =
  { key: string; kind: 'empty' } | { date: Date; key: string; kind: 'day' }

export function StableEventsCalendar({
  events,
  initialMonth,
  surface = 'panel',
}: StableEventsCalendarProps) {
  const t = useT()
  const { locale } = useLocale()

  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(initialMonth ?? new Date()),
  )
  const [selectedDateKey, setSelectedDateKey] = useState<string>()
  const [announcedMonth, setAnnouncedMonth] = useState<Date>()
  const calendarRef = useRef<HTMLDivElement>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)
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

  // Track actual focus before a reactive render removes its node. A later
  // focus elsewhere clears ownership, so ordinary data updates cannot steal it.
  useEffect(() => {
    const rememberFocus = (event: FocusEvent) => {
      const target = event.target
      lastFocusedRef.current =
        target instanceof HTMLElement && calendarRef.current?.contains(target)
          ? target
          : null
    }
    document.addEventListener('focusin', rememberFocus)
    const breakpoint = window.matchMedia?.('(min-width: 48rem)')
    const recoverResponsiveFocus = () => {
      const focused = lastFocusedRef.current
      if (
        !focused ||
        (document.activeElement !== focused &&
          document.activeElement !== document.body)
      )
        return
      const presentation = focused
        .closest('[data-calendar-view]')
        ?.getAttribute('data-calendar-view')
      const hidden = breakpoint?.matches
        ? presentation === 'mobile'
        : presentation === 'month' || presentation === 'selected'
      if (hidden) calendarRef.current?.focus()
    }
    breakpoint?.addEventListener('change', recoverResponsiveFocus)
    return () => {
      document.removeEventListener('focusin', rememberFocus)
      breakpoint?.removeEventListener('change', recoverResponsiveFocus)
    }
  }, [])

  useLayoutEffect(() => {
    const focused = lastFocusedRef.current
    if (
      focused &&
      !focused.isConnected &&
      document.activeElement === document.body
    )
      calendarRef.current?.focus()
  }, [events, selectedDateKey, visibleMonth])

  useEffect(() => {
    if (selectedDateKey && isRendered(selectedAgendaRef.current))
      selectedAgendaRef.current?.focus()
  }, [selectedDateKey])

  const selectMonth = (month: Date) => {
    setVisibleMonth(month)
    setSelectedDateKey(undefined)
    selectedAgendaTriggerRef.current = null
    setAnnouncedMonth(month)
  }

  const closeSelectedAgenda = () => {
    const trigger = selectedAgendaTriggerRef.current
    if (isRendered(trigger)) trigger?.focus()
    else calendarRef.current?.focus()
    setSelectedDateKey(undefined)
  }

  return (
    <DashboardSectionCard
      surface={surface}
      ref={calendarRef}
      role="region"
      aria-label={t('calendar.monthRegion', {
        month: formatMonthLabel(visibleMonth, locale),
      })}
      tabIndex={-1}
      className="app-control-focus"
      title={formatMonthLabel(visibleMonth, locale)}
      description={t('calendar.monthCount', {
        count: visibleMonthOccurrences.length,
      })}
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
            {t('calendar.previous')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => selectMonth(startOfMonth(new Date()))}
          >
            {t('calendar.today')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => selectMonth(addMonths(visibleMonth, 1))}
          >
            {t('calendar.next')}
            <CaretRightIcon aria-hidden="true" />
          </Button>
        </>
      }
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcedMonth
          ? t('calendar.monthAnnouncement', {
              month: formatMonthLabel(announcedMonth, locale),
              events: t('calendar.monthCount', {
                count: getCalendarMonthOccurrences(events, announcedMonth)
                  .length,
              }),
            })
          : ''}
      </p>

      <DashboardSubsection
        as="h3"
        className="md:hidden"
        gap="compact"
        title={t('calendar.agenda')}
        data-calendar-view="mobile"
      >
        {visibleMonthOccurrences.length === 0 ? (
          <DashboardEmptyState chrome="flat" spacing="flush">
            {t('calendar.empty')}
          </DashboardEmptyState>
        ) : (
          <DashboardItemList gap="compact">
            {visibleMonthOccurrences.map((occurrence) => (
              <EventRow
                key={occurrence.occurrenceKey}
                event={getOccurrenceDisplayEvent(occurrence)}
                chrome="flat"
                horseCount={occurrence.event.horseIds.length}
                supplementalMeta={
                  occurrence.durationDays > 1
                    ? [
                        t('calendar.through', {
                          date: formatEventDate(occurrence.endDate, locale),
                        }),
                      ]
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
        role="table"
        data-calendar-view="month"
        aria-colcount={7}
        aria-rowcount={calendarWeeks.length + 1}
        aria-label={t('calendar.monthTable', {
          month: formatMonthLabel(visibleMonth, locale),
        })}
      >
        <CalendarWeekdayRow role="row">
          {getWeekdayLabels(locale).map((weekday) => (
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
                  return <CalendarDayCell key={cell.key} role="cell" muted />
                }

                const dateOccurrences = occurrencesByDate.get(cell.key) ?? []
                const visibleEvents = dateOccurrences.slice(0, 2)
                const hiddenEventCount =
                  dateOccurrences.length - visibleEvents.length
                const isToday = cell.key === todayKey
                const isSelected = cell.key === selectedDateKey
                const fullDate = formatEventDate(cell.key, locale)

                return (
                  <CalendarDayCell
                    key={cell.key}
                    role="cell"
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
                          aria-label={t(
                            isSelected
                              ? 'calendar.hideMore'
                              : 'calendar.showMore',
                            { count: hiddenEventCount, date: fullDate },
                          )}
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
                            ? t('calendar.hideAgenda')
                            : t('calendar.more', { count: hiddenEventCount })}
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
          data-calendar-view="selected"
          aria-label={t('calendar.eventsOn', {
            date: formatEventDate(selectedDateKey, locale),
          })}
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeSelectedAgenda()
          }}
          className="hidden rounded-panel border-t border-border-subtle pt-5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:block"
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
                {t('calendar.close')}
              </Button>
            }
            gap="compact"
            title={t('calendar.eventsOn', {
              date: formatEventDate(selectedDateKey, locale),
            })}
          >
            <DashboardItemList gap="compact">
              {selectedDayOccurrences.map((dayOccurrence) => (
                <EventRow
                  key={dayOccurrence.occurrence.occurrenceKey}
                  event={getOccurrenceDisplayEvent(dayOccurrence.occurrence)}
                  chrome="flat"
                  horseCount={dayOccurrence.occurrence.event.horseIds.length}
                  leadingLabel={getDayOccurrenceLabel(dayOccurrence, locale)}
                  showRecurrence={false}
                  supplementalMeta={
                    dayOccurrence.occurrence.durationDays > 1
                      ? [
                          `${formatEventDate(dayOccurrence.occurrence.startDate, locale)} – ${formatEventDate(dayOccurrence.occurrence.endDate, locale)}`,
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
  const t = useT()
  const { locale } = useLocale()

  const { occurrence } = dayOccurrence
  const event = occurrence.event
  const timingLabel = getDayOccurrenceLabel(dayOccurrence, locale)
  const statusLabel =
    event.status && event.status !== 'planned'
      ? t(`calendar.${event.status}`)
      : null

  return (
    <CalendarEventChipLink
      to="/stables/$stableId/events/$eventId"
      params={{ stableId: event.stableId, eventId: event._id }}
      aria-label={`${event.title}, ${formatEventDateTime(occurrence.startDate, event.time, occurrence.endDate, locale)}${dayOccurrence.position === 'single' || dayOccurrence.position === 'start' ? '' : t('calendar.dayContext', { timing: timingLabel.toLowerCase(), date: formatEventDate(dayOccurrence.dateKey, locale) })}${statusLabel ? `, ${statusLabel.toLowerCase()}` : ''}`}
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

function getDayOccurrenceLabel(
  { occurrence, position }: StableCalendarDayOccurrence,
  locale: Locale = 'en',
) {
  const t = localeInstances[locale].t
  if (position === 'single' || position === 'start')
    return occurrence.event.time
  if (position === 'end') return t('calendar.endsToday')
  return t('calendar.continues')
}

function isRendered(element: HTMLElement | null): element is HTMLElement {
  return Boolean(
    element?.isConnected &&
    element.getClientRects().length > 0 &&
    window.getComputedStyle(element).visibility !== 'hidden',
  )
}
