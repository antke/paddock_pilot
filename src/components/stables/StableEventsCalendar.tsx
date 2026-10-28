import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import {
  eventCalendarHorses,
  uniqueCalendarHorses,
} from 'shared/horses/horseCalendarColours'
import type { CalendarHorse } from 'shared/horses/horseCalendarColours'
import {
  CalendarHorseMarkers,
  HorseColourLegend,
  HorseCalendarNames,
} from '#/components/horses/HorseCalendarIdentity'
import { useCalendarDensity } from '#/components/events/useCalendarDensity'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import {
  CalendarDayCell,
  CalendarDayEventList,
  CalendarDayHeader,
  CalendarDayNumber,
  CalendarEventChipLink,
  CalendarEventChipTitle,
  CalendarGrid,
  CalendarMoreEventsButton,
  CalendarShell,
  CalendarWeekdayCell,
  CalendarWeekdayRow,
} from '#/components/events/EventCalendar'
import { EventRow } from '#/components/events/EventRow'
import { CalendarEventTooltip } from '#/components/events/CalendarEventTooltip'
import { calendarCompactEventChipClassName } from '#/components/events/EventCalendarChrome'
import { MotionList } from '#/components/motion/MotionList'
import { MotionNotice } from '#/components/motion/MotionNotice'
import {
  formatEventDate,
  formatEventDateTime,
  formatEventTime,
} from '#/components/events/eventDisplay'
import { DashboardCountBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  DashboardSectionCard,
  DashboardSubsection,
} from '#/components/dashboard/DashboardSectionCard'
import { Button } from '#/components/ui/button'
import {
  getTodayDateKey,
  dateKeyToDate,
  formatDateKey,
} from '#/lib/dateDisplay'
import { useSessionState } from '#/lib/useSessionState'
import { isDateKey } from 'shared/training/trainingSchema'
import { useEventCalendarFilters } from '#/components/events/useEventCalendarFilters'
import { CalendarToolbar } from '#/components/events/CalendarToolbar'
import { useSmallScreen } from '#/lib/useSmallScreen'
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ReactNode } from 'react'
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
  horses?: ReadonlyArray<CalendarHorse>
  surface?: 'flat' | 'panel'
  initialMonth?: Date
  filters?: ReactNode
  viewControl?: ReactNode
  actions?: ReactNode
  storageKey?: string
}

type CalendarCell =
  { key: string; kind: 'empty' } | { date: Date; key: string; kind: 'day' }

export function StableEventsCalendar({
  events: sourceEvents,
  horses = [],
  initialMonth,
  surface = 'panel',
  storageKey,
  filters,
  viewControl,
  actions,
}: StableEventsCalendarProps) {
  const t = useT()
  const small = useSmallScreen()
  const { locale } = useLocale()

  const [visibleMonth, setVisibleMonth] = useSessionState<Date>(
    storageKey,
    () => startOfMonth(initialMonth ?? new Date()),
    (value) =>
      typeof value === 'string' && isDateKey(value)
        ? startOfMonth(dateKeyToDate(value))
        : undefined,
    formatDateKey,
  )
  const [selectedDateKey, setSelectedDateKey] = useState<string>()
  const [mobileDateKey, setMobileDateKey] = useState<string>()
  const [announcedMonth, setAnnouncedMonth] = useState<Date>()
  const calendarRef = useRef<HTMLDivElement>(null)
  const calendarFilters = useEventCalendarFilters({
    events: sourceEvents,
    horses,
    storageKey,
    onShowResults: () => {
      calendarRef.current?.focus({ preventScroll: true })
      calendarRef.current?.scrollIntoView({ block: 'start' })
    },
  })
  const events = calendarFilters.events
  const lastFocusedRef = useRef<HTMLElement | null>(null)
  const selectedAgendaId = useId()
  const mobileAgendaId = useId()
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
  const monthKey = formatDateKey(visibleMonth).slice(0, 7)
  const mobileSelectedDate =
    mobileDateKey ??
    (todayKey.startsWith(monthKey) ? todayKey : formatDateKey(visibleMonth))
  const mobileDayOccurrences = occurrencesByDate.get(mobileSelectedDate) ?? []
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

  const density = useCalendarDensity(calendarWeeks.length, monthKey)
  const participatingHorses = uniqueCalendarHorses(
    visibleMonthOccurrences.flatMap((item) =>
      eventCalendarHorses(item.event, horses),
    ),
  )
  const generalEvent = (event: StableDashboardEvent) =>
    eventCalendarHorses(event, horses).length === 0
  const namesFor = (items: ReadonlyArray<StableCalendarDayOccurrence>) =>
    uniqueCalendarHorses(
      items.flatMap((item) =>
        eventCalendarHorses(item.occurrence.event, horses),
      ),
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
      const hidden = Boolean(presentation && !isRendered(focused))
      if (hidden) calendarRef.current?.focus()
    }
    breakpoint?.addEventListener('change', recoverResponsiveFocus)
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(recoverResponsiveFocus)
    if (calendarRef.current) observer?.observe(calendarRef.current)
    return () => {
      document.removeEventListener('focusin', rememberFocus)
      breakpoint?.removeEventListener('change', recoverResponsiveFocus)
      observer?.disconnect()
    }
  }, [])

  useLayoutEffect(() => {
    const focused = lastFocusedRef.current
    if (
      focused &&
      (!focused.isConnected ||
        (selectedDayOccurrences.length === 0 &&
          selectedAgendaRef.current?.contains(focused))) &&
      (document.activeElement === document.body ||
        document.activeElement === focused)
    )
      calendarRef.current?.focus()
  }, [events, selectedDateKey, selectedDayOccurrences.length, visibleMonth])

  useEffect(() => {
    if (selectedDateKey && isRendered(selectedAgendaRef.current))
      selectedAgendaRef.current?.focus()
  }, [selectedDateKey])

  const selectMonth = (month: Date) => {
    setVisibleMonth(month)
    setSelectedDateKey(undefined)
    setMobileDateKey(undefined)
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
      className="app-control-focus calendar-container"
      title={small ? undefined : formatMonthLabel(visibleMonth, locale)}
      contentGap="default"
    >
      <CalendarToolbar
        label={formatMonthLabel(visibleMonth, locale)}
        previousLabel={t('trainingViews.previousMonth')}
        nextLabel={t('trainingViews.nextMonth')}
        onPrevious={() => selectMonth(addMonths(visibleMonth, -1))}
        onNext={() => selectMonth(addMonths(visibleMonth, 1))}
        onToday={() => selectMonth(startOfMonth(new Date()))}
        viewControl={viewControl}
        mobileFilters={calendarFilters.control}
        actions={actions}
      />
      {calendarFilters.content}
      {filters}
      {calendarFilters.activeFilterCount > 0 &&
        visibleMonthOccurrences.length === 0 && (
          <DashboardEmptyState chrome="flat" spacing="flush">
            {t('eventViews.filteredEmpty')}
          </DashboardEmptyState>
        )}
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

      <div
        className="calendar-month-compact grid gap-4"
        data-calendar-view="mobile"
      >
        <CalendarShell
          data-touch-grid="true"
          role="table"
          aria-label={t('calendar.chooseDay', {
            month: formatMonthLabel(visibleMonth, locale),
          })}
        >
          <CalendarWeekdayRow role="row">
            {getWeekdayLabels(locale).map((weekday) => (
              <CalendarWeekdayCell
                role="columnheader"
                key={weekday}
                className="px-0 py-2"
              >
                {weekday}
              </CalendarWeekdayCell>
            ))}
          </CalendarWeekdayRow>
          <CalendarGrid period={monthKey} role="rowgroup">
            {calendarWeeks.map((week, index) => (
              <div role="row" className="contents" key={index}>
                {week.map((cell) => {
                  if (cell.kind === 'empty')
                    return (
                      <CalendarDayCell
                        role="cell"
                        muted
                        key={cell.key}
                        className="h-14"
                      />
                    )
                  const dayOccurrences = occurrencesByDate.get(cell.key) ?? []
                  const dayHorses = namesFor(dayOccurrences)
                  const count = dayOccurrences.length
                  const selected = cell.key === mobileSelectedDate
                  return (
                    <CalendarDayCell
                      role="cell"
                      key={cell.key}
                      className="h-14 p-0"
                      isToday={cell.key === todayKey}
                    >
                      <Button
                        variant={selected ? 'secondary' : 'ghost'}
                        className="h-full min-w-0 w-full flex-col gap-1 rounded-none border-0 px-0 py-1 text-sm [@media(pointer:coarse)]:min-w-0"
                        aria-label={`${t('calendar.selectDay', { date: formatEventDate(cell.key, locale), count })}${dayHorses.length ? `, ${t('calendar.horseNames', { names: dayHorses.map(getHorseDisplayName).join(', ') })}` : ''}`}
                        aria-pressed={selected}
                        aria-current={
                          cell.key === todayKey ? 'date' : undefined
                        }
                        aria-controls={mobileAgendaId}
                        onClick={() => setMobileDateKey(cell.key)}
                      >
                        <CalendarDayNumber isToday={cell.key === todayKey}>
                          {cell.date.getDate()}
                        </CalendarDayNumber>
                        <CalendarHorseMarkers
                          horses={dayHorses}
                          general={dayOccurrences.some((item) =>
                            generalEvent(item.occurrence.event),
                          )}
                        />
                      </Button>
                    </CalendarDayCell>
                  )
                })}
              </div>
            ))}
          </CalendarGrid>
        </CalendarShell>
        <DashboardSubsection
          id={mobileAgendaId}
          as="h3"
          gap="compact"
          title={t('calendar.eventsOn', {
            date: formatEventDate(mobileSelectedDate, locale),
          })}
        >
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {t('calendar.selectDay', {
              date: formatEventDate(mobileSelectedDate, locale),
              count: mobileDayOccurrences.length,
            })}
          </p>
          <CalendarAgendaList
            key={mobileSelectedDate}
            occurrences={mobileDayOccurrences}
            horses={horses}
            locale={locale}
            focusTarget={() => calendarRef.current}
            empty={
              <DashboardEmptyState chrome="flat" spacing="flush">
                {t('calendar.dayEmpty')}
              </DashboardEmptyState>
            }
          />
        </DashboardSubsection>
      </div>

      <CalendarShell
        ref={density.ref}
        style={density.style}
        className="calendar-month-detail"
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

        <CalendarGrid period={monthKey} role="rowgroup">
          {calendarWeeks.map((week, weekIndex) => (
            <div role="row" className="contents" key={`week-${weekIndex}`}>
              {week.map((cell) => {
                if (cell.kind === 'empty') {
                  return <CalendarDayCell key={cell.key} role="cell" muted />
                }

                const dateOccurrences = occurrencesByDate.get(cell.key) ?? []
                const visibleEvents = dateOccurrences.slice(
                  0,
                  dateOccurrences.length > 2 ? 1 : 2,
                )
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
                      <Button
                        variant="subtle"
                        className="h-6 min-h-6 min-w-6 justify-start gap-1.5 p-0 text-xs pointer-coarse:min-h-11"
                        aria-controls={selectedAgendaId}
                        aria-expanded={isSelected}
                        aria-label={`${t('calendar.selectDay', { date: fullDate, count: dateOccurrences.length })}${namesFor(dateOccurrences).length ? `, ${t('calendar.horseNames', { names: namesFor(dateOccurrences).map(getHorseDisplayName).join(', ') })}` : ''}`}
                        onClick={(event) => {
                          selectedAgendaTriggerRef.current = event.currentTarget
                          setSelectedDateKey(cell.key)
                        }}
                      >
                        <CalendarDayNumber isToday={isToday}>
                          {cell.date.getDate()}
                        </CalendarDayNumber>
                        <CalendarHorseMarkers
                          horses={namesFor(dateOccurrences)}
                          general={dateOccurrences.some((item) =>
                            generalEvent(item.occurrence.event),
                          )}
                        />
                      </Button>
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
                          horses={horses}
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
      <HorseColourLegend
        horses={participatingHorses}
        general={visibleMonthOccurrences.some((item) =>
          generalEvent(item.event),
        )}
      />

      <MotionNotice
        show={Boolean(selectedDateKey)}
        className="calendar-month-detail"
      >
        {selectedDateKey && (
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
            className="calendar-month-detail rounded-panel border-t border-border-subtle pt-5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
              <CalendarAgendaList
                occurrences={selectedDayOccurrences}
                horses={horses}
                empty={
                  <DashboardEmptyState chrome="flat" spacing="flush">
                    {t('calendar.dayEmpty')}
                  </DashboardEmptyState>
                }
                locale={locale}
                focusTarget={() =>
                  selectedAgendaRef.current ?? calendarRef.current
                }
              />
            </DashboardSubsection>
          </div>
        )}
      </MotionNotice>
    </DashboardSectionCard>
  )
}

/** Agenda rows share record identity; dense calendar table cells stay unwrapped. */
function CalendarAgendaList({
  occurrences,
  horses,
  locale,
  empty,
  focusTarget,
}: {
  occurrences: StableCalendarDayOccurrence[]
  horses: ReadonlyArray<CalendarHorse>
  locale: Locale
  empty?: ReactNode
  focusTarget: () => HTMLElement | null
}) {
  return (
    <MotionList
      className="min-h-24 content-start"
      items={occurrences}
      getKey={(item) => item.occurrence.occurrenceKey}
      focusTarget={focusTarget}
      empty={empty}
      renderItem={(dayOccurrence) => (
        <div className="grid gap-1">
          <HorseCalendarNames
            horses={eventCalendarHorses(dayOccurrence.occurrence.event, horses)}
          />
          <EventRow
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
        </div>
      )}
    />
  )
}

function CalendarEventLink({
  dayOccurrence,
  horses,
}: {
  dayOccurrence: StableCalendarDayOccurrence
  horses: ReadonlyArray<CalendarHorse>
}) {
  const t = useT()
  const { locale } = useLocale()

  const { occurrence } = dayOccurrence
  const event = occurrence.event
  const participants = eventCalendarHorses(event, horses)
  const timingLabel = getDayOccurrenceLabel(dayOccurrence, locale)
  const statusLabel =
    event.status && event.status !== 'planned'
      ? t(`calendar.${event.status}`)
      : null

  return (
    <CalendarEventTooltip
      label={event.title}
      trigger={
        <CalendarEventChipLink
          to="/events/$eventId"
          params={{ eventId: event._id }}
          search={{
            horseId: event.contextHorseId,
            participationId: event.contextParticipationId,
          }}
          className={calendarCompactEventChipClassName()}
          aria-label={`${event.title}, ${formatEventDateTime(occurrence.startDate, event.time, occurrence.endDate, locale)}${dayOccurrence.position === 'single' || dayOccurrence.position === 'start' ? '' : t('calendar.dayContext', { timing: timingLabel.toLowerCase(), date: formatEventDate(dayOccurrence.dateKey, locale) })}${statusLabel ? `, ${statusLabel.toLowerCase()}` : ''}, ${t(`events.types.${event.type}`)}${participants.length ? `, ${t('calendar.horseNames', { names: participants.map(getHorseDisplayName).join(', ') })}` : ''}`}
        >
          <CalendarHorseMarkers
            horses={participants}
            general={!participants.length}
          />
          <CalendarEventChipTitle>{event.title}</CalendarEventChipTitle>
        </CalendarEventChipLink>
      }
    >
      <div className="grid gap-3">
        <div className="grid gap-1">
          <span className="font-bold">{event.title}</span>
          <HorseCalendarNames horses={participants} />
          <span>{t(`events.types.${event.type}`)}</span>
          <span>{t(`calendar.${event.status ?? 'planned'}`)}</span>
          <span>
            {formatEventDateTime(
              occurrence.startDate,
              event.time,
              occurrence.endDate,
              locale,
            )}
          </span>
          {event.providerName && <span>{event.providerName}</span>}
          {event.location && <span>{event.location}</span>}
        </div>
        {event.description && (
          <p className="whitespace-pre-wrap">{event.description}</p>
        )}
        {event.notesAfterCompletion && (
          <p className="whitespace-pre-wrap">{event.notesAfterCompletion}</p>
        )}
      </div>
    </CalendarEventTooltip>
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
    return formatEventTime(occurrence.event.time, locale)
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
