import { useId, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import {
  DashboardSectionCard,
  DashboardSubsection,
} from '#/components/dashboard/DashboardSectionCard'
import {
  CalendarDayCell,
  CalendarDayEventList,
  CalendarDayNumber,
  CalendarEventChipTitle,
  CalendarGrid,
  CalendarMoreEventsButton,
  CalendarShell,
  CalendarWeekdayCell,
  CalendarWeekdayRow,
} from '#/components/events/EventCalendar'
import { calendarCompactEventChipClassName } from '#/components/events/EventCalendarChrome'
import { CalendarItemPreview } from '#/components/events/CalendarItemPreview'
import { CalendarItemTypeDot } from '#/components/events/CalendarItemTypeDot'
import { Button } from '#/components/ui/button'
import {
  addMonths,
  formatMonthLabel,
  getMonthDays,
  getMonthLeadingDayCount,
  getWeekdayLabels,
  startOfMonth,
} from '#/components/stables/stableDashboardDates'
import { dateKeyToDate, formatLongDateKey } from '#/lib/dateDisplay'
import { formatDecimal } from '#/lib/numberDisplay'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import {
  getTimelineEntryDate,
  timelineEntryOccursOn,
} from './horseTimelineCalendarData'
import type { TimelineEntry } from './HorseTimelinePage'

const kindLabels = {
  event: 'horseHistory.events',
  healthIssue: 'horseHistory.health',
  medicationRecord: 'horseHistory.medication',
  nutritionLog: 'horseHistory.nutrition',
  weightRecord: 'horseHistory.weight',
} as const

export function HorseTimelineCalendar({
  entries,
  renderEntry,
}: {
  entries: Array<TimelineEntry>
  renderEntry: (entry: TimelineEntry) => ReactNode
}) {
  const t = useT()
  const { locale } = useLocale()
  const { today } = useLocalDateContext()
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(
      dateKeyToDate(entries[0] ? getTimelineEntryDate(entries[0]) : today),
    ),
  )
  const [selectedDate, setSelectedDate] = useState<string>()
  const agendaId = useId()
  const days = useMemo(() => getMonthDays(visibleMonth), [visibleMonth])
  const entriesByDay = useMemo(
    () =>
      new Map(
        days.map(({ key }) => [
          key,
          entries.filter((entry) => timelineEntryOccursOn(entry, key)),
        ]),
      ),
    [days, entries],
  )
  const monthCount = new Set(
    [...entriesByDay.values()]
      .flat()
      .map((entry) => `${entry.kind}-${entry.id}`),
  ).size
  const cells = [
    ...Array<null>(getMonthLeadingDayCount(visibleMonth)).fill(null),
    ...days,
  ]
  while (cells.length % 7) cells.push(null)
  const monthLabel = formatMonthLabel(visibleMonth, locale)
  const selectedEntries = selectedDate
    ? (entriesByDay.get(selectedDate) ?? [])
    : []
  const selectMonth = (month: Date) => {
    setVisibleMonth(month)
    setSelectedDate(undefined)
  }
  const title = (entry: TimelineEntry) => {
    if (entry.kind === 'medicationRecord') return entry.medicationName
    if (entry.kind === 'nutritionLog') return entry.summary
    if (entry.kind === 'weightRecord')
      return `${formatDecimal(entry.weight, locale)} ${entry.unit}`
    return entry.title
  }

  return (
    <DashboardSectionCard
      surface="flat"
      as="h3"
      title={monthLabel}
      description={t('horseHistory.monthRecords', { count: monthCount })}
      contentGap="comfortable"
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            aria-label={t('horseHistory.previousMonth')}
            onClick={() => selectMonth(addMonths(visibleMonth, -1))}
          >
            <CaretLeftIcon aria-hidden="true" />
            {t('calendar.previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              selectMonth(startOfMonth(dateKeyToDate(today)))
              setSelectedDate(today)
            }}
          >
            {t('calendar.today')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label={t('horseHistory.nextMonth')}
            onClick={() => selectMonth(addMonths(visibleMonth, 1))}
          >
            {t('calendar.next')}
            <CaretRightIcon aria-hidden="true" />
          </Button>
        </>
      }
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {monthLabel}, {t('horseHistory.monthRecords', { count: monthCount })}
        {selectedDate &&
          `. ${t('horseHistory.selectDay', { date: formatLongDateKey(selectedDate, locale), count: selectedEntries.length })}`}
      </p>
      <CalendarShell
        data-touch-grid="true"
        role="table"
        aria-label={t('horseHistory.calendarRegion', { month: monthLabel })}
      >
        <CalendarWeekdayRow role="row">
          {getWeekdayLabels(locale).map((day) => (
            <CalendarWeekdayCell role="columnheader" key={day}>
              {day}
            </CalendarWeekdayCell>
          ))}
        </CalendarWeekdayRow>
        <CalendarGrid role="rowgroup">
          {Array.from({ length: cells.length / 7 }, (_, row) => (
            <div role="row" className="contents" key={row}>
              {cells.slice(row * 7, row * 7 + 7).map((day, index) => {
                if (!day)
                  return (
                    <CalendarDayCell
                      key={`empty-${index}`}
                      role="cell"
                      muted
                      className="h-14 md:h-40"
                    />
                  )
                const records = entriesByDay.get(day.key) ?? []
                const label = t('horseHistory.selectDay', {
                  date: formatLongDateKey(day.key, locale),
                  count: records.length,
                })
                return (
                  <CalendarDayCell
                    key={day.key}
                    role="cell"
                    isToday={day.key === today}
                    isSelected={day.key === selectedDate}
                    aria-current={day.key === today ? 'date' : undefined}
                    className="h-14 p-0 md:h-40 md:p-2"
                  >
                    <Button
                      variant="subtle"
                      className="h-auto min-h-11 w-full flex-col gap-0 px-0 py-1 md:flex-row md:justify-between md:px-2"
                      aria-label={label}
                      aria-pressed={day.key === selectedDate}
                      aria-controls={agendaId}
                      onClick={() => setSelectedDate(day.key)}
                    >
                      <CalendarDayNumber isToday={day.key === today}>
                        {day.date.getDate()}
                      </CalendarDayNumber>
                      {records.length > 0 && (
                        <span
                          aria-hidden="true"
                          className="text-xs tabular-nums text-muted-foreground"
                        >
                          {records.length}
                        </span>
                      )}
                    </Button>
                    <CalendarDayEventList className="hidden md:grid">
                      {records.slice(0, 2).map((entry) => (
                        <CalendarItemPreview
                          key={`${entry.kind}-${entry.id}`}
                          trigger={
                            <Button
                              variant="ghost"
                              type="button"
                              className={calendarCompactEventChipClassName()}
                              onClick={() => setSelectedDate(day.key)}
                              aria-controls={agendaId}
                              aria-label={`${title(entry)}, ${formatLongDateKey(day.key, locale)}, ${entry.kind === 'event' ? t(`events.types.${entry.eventType}`) : t(kindLabels[entry.kind])}`}
                            >
                              <CalendarItemTypeDot
                                type={
                                  entry.kind === 'event'
                                    ? entry.eventType
                                    : entry.kind
                                }
                              />
                              <CalendarEventChipTitle>
                                {title(entry)}
                              </CalendarEventChipTitle>
                            </Button>
                          }
                        >
                          {renderEntry(entry)}
                        </CalendarItemPreview>
                      ))}
                      {records.length > 2 && (
                        <CalendarMoreEventsButton
                          onClick={() => setSelectedDate(day.key)}
                          aria-controls={agendaId}
                          aria-label={label}
                        >
                          {t('calendar.more', { count: records.length - 2 })}
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
      <div
        id={agendaId}
        role="region"
        aria-label={
          selectedDate
            ? t('horseHistory.recordsOn', {
                date: formatLongDateKey(selectedDate, locale),
              })
            : t('horseHistory.calendar')
        }
      >
        {selectedDate ? (
          <DashboardSubsection
            title={t('horseHistory.recordsOn', {
              date: formatLongDateKey(selectedDate, locale),
            })}
          >
            {selectedEntries.length ? (
              <DashboardItemList gap="compact">
                {selectedEntries.map(renderEntry)}
              </DashboardItemList>
            ) : (
              <DashboardEmptyState chrome="flat">
                {t('horseHistory.emptyDay')}
              </DashboardEmptyState>
            )}
          </DashboardSubsection>
        ) : (
          <p className="text-sm text-muted-foreground">
            {monthCount
              ? t('horseHistory.selectDayHelp')
              : t('horseHistory.emptyMonth')}
          </p>
        )}
      </div>
    </DashboardSectionCard>
  )
}
