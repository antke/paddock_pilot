import { useSmallScreen } from '#/lib/useSmallScreen'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { uniqueCalendarHorses } from 'shared/horses/horseCalendarColours'
import {
  CalendarHorseMarkers,
  HorseColourLegend,
} from '#/components/horses/HorseCalendarIdentity'
import { useCalendarDensity } from '#/components/events/useCalendarDensity'
import { useId } from 'react'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { Button } from '#/components/ui/button'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  CalendarShell,
  CalendarGrid,
  CalendarDayCell,
  CalendarDayNumber,
  CalendarWeekdayRow,
  CalendarWeekdayCell,
  CalendarDayEventList,
  CalendarMoreEventsButton,
} from '#/components/events/EventCalendar'
import {
  dateKeyToDate,
  formatLongDateKey,
  formatShortWeekdayDate,
} from '#/lib/dateDisplay'
import type { TrainingEntry } from './trainingCalendarData'
import { TrainingEntryLink } from './TrainingEntryLink'

type Props = {
  days: Array<string>
  entries: Array<TrainingEntry>
  selectedDate: string
  today: string
  onSelectDate: (date: string) => void
}

export function TrainingMonthCalendar({
  days,
  entries,
  selectedDate,
  today,
  onSelectDate,
}: Props) {
  const small = useSmallScreen()
  const t = useT()
  const { locale } = useLocale()
  const agendaId = useId()
  const leadingDays = (dateKeyToDate(days[0]).getDay() + 6) % 7
  const cells = [...Array<string | null>(leadingDays).fill(null), ...days]
  while (cells.length % 7) cells.push(null)
  const entriesByDate = new Map(
    days.map((date) => [
      date,
      entries.filter(
        (entry) =>
          entry.occurrence.startDate <= date &&
          entry.occurrence.endDate >= date,
      ),
    ]),
  )
  const selectedEntries = entriesByDate.get(selectedDate) ?? []
  const density = useCalendarDensity(cells.length / 7, days[0]?.slice(0, 7))
  const dayLabel = (date: string, count: number) =>
    t('trainingViews.selectDay', {
      date: formatLongDateKey(date, locale),
      count,
    })

  return (
    <div className="calendar-container grid gap-4">
      <HorseColourLegend horses={entries.map((entry) => entry.horse)} />
      <CalendarShell
        ref={density.ref}
        style={density.style}
        className="calendar-training-month"
        data-touch-grid="true"
        role="table"
        aria-label={t('trainingViews.monthly')}
      >
        <CalendarWeekdayRow role="row">
          {Array.from({ length: 7 }, (_, day) =>
            formatShortWeekdayDate(new Date(2026, 8, 28 + day), locale),
          ).map((weekday) => (
            <CalendarWeekdayCell
              role="columnheader"
              key={weekday}
              className="px-0 py-2"
            >
              {weekday}
            </CalendarWeekdayCell>
          ))}
        </CalendarWeekdayRow>
        <CalendarGrid period={days[0]?.slice(0, 7)} role="rowgroup">
          {Array.from({ length: cells.length / 7 }, (_week, row) => (
            <div role="row" className="contents" key={row}>
              {cells.slice(row * 7, row * 7 + 7).map((date, column) => {
                if (!date)
                  return (
                    <CalendarDayCell
                      key={`empty-${column}`}
                      role="cell"
                      muted
                      className="h-14"
                    />
                  )
                const dayEntries = entriesByDate.get(date) ?? []
                const count = dayEntries.length
                const dayHorses = uniqueCalendarHorses(
                  dayEntries.map((entry) => entry.horse),
                )
                const visible = dayEntries.slice(0, count > 2 ? 1 : 2)
                return (
                  <CalendarDayCell
                    key={date}
                    role="cell"
                    isToday={date === today}
                    className="h-14 p-0"
                  >
                    <Button
                      variant={date === selectedDate ? 'secondary' : 'ghost'}
                      className="calendar-date-button h-full min-w-0 w-full flex-col gap-1 rounded-none border-0 px-0 py-1 text-sm [@media(pointer:coarse)]:min-w-0"
                      aria-label={`${dayLabel(date, count)}${dayHorses.length ? `, ${t('calendar.horseNames', { names: dayHorses.map(getHorseDisplayName).join(', ') })}` : ''}`}
                      aria-pressed={date === selectedDate}
                      aria-current={date === today ? 'date' : undefined}
                      aria-controls={agendaId}
                      onClick={() => onSelectDate(date)}
                    >
                      <CalendarDayNumber isToday={date === today}>
                        {dateKeyToDate(date).getDate()}
                      </CalendarDayNumber>
                      <span className="calendar-compact-markers">
                        <CalendarHorseMarkers horses={dayHorses} />
                      </span>
                    </Button>
                    {!small && (
                      <CalendarDayEventList className="calendar-month-detail">
                        {visible.map((entry) => (
                          <TrainingEntryLink
                            key={entry.key}
                            entry={entry}
                            variant="month"
                          />
                        ))}
                        {count > visible.length && (
                          <CalendarMoreEventsButton
                            aria-controls={agendaId}
                            aria-label={dayLabel(date, count)}
                            onClick={() => onSelectDate(date)}
                          >
                            {t('calendar.more', {
                              count: count - visible.length,
                            })}
                          </CalendarMoreEventsButton>
                        )}
                      </CalendarDayEventList>
                    )}
                  </CalendarDayCell>
                )
              })}
            </div>
          ))}
        </CalendarGrid>
      </CalendarShell>
      <section
        id={agendaId}
        className="grid scroll-mt-4 gap-2"
        aria-label={t('calendar.daySessions', {
          date: formatLongDateKey(selectedDate, locale),
        })}
      >
        <h3 className="font-semibold">
          {formatLongDateKey(selectedDate, locale)}
        </h3>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {dayLabel(selectedDate, selectedEntries.length)}
        </p>
        {selectedEntries.length ? (
          selectedEntries.map((entry) => (
            <TrainingEntryLink key={entry.key} entry={entry} />
          ))
        ) : (
          <DashboardEmptyState chrome="flat" spacing="flush">
            {t('trainingViews.dayEmpty')}
          </DashboardEmptyState>
        )}
      </section>
    </div>
  )
}
