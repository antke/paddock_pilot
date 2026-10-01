import { useT, useLocale } from '#/i18n/LocaleProvider'
import { Table } from '#/components/ui/table'
import { useEffect, useId, useState } from 'react'
import type { Doc } from 'convex/_generated/dataModel'
import { CaretLeftIcon, CaretRightIcon, XIcon } from '@phosphor-icons/react'
import { Button, ButtonLink } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Select } from '#/components/ui/select'
import { Field, FieldLabel } from '#/components/ui/field'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  CalendarShell,
  CalendarGrid,
  CalendarDayCell,
  CalendarDayHeader,
  CalendarDayNumber,
  CalendarDayEventList,
  CalendarMoreEventsButton,
  CalendarWeekdayRow,
  CalendarWeekdayCell,
} from '#/components/events/EventCalendar'
import {
  dateKeyToDate,
  formatDateKey,
  formatShortDateKey,
  formatMonthYearDate,
  formatShortWeekdayDate,
} from '#/lib/dateDisplay'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import {
  trainingActivities,
  trainingStatusLabels,
} from 'shared/training/trainingSchema'
import { getTrainingEntries, trainingWindow } from './trainingCalendarData'
import type { TrainingHorse } from './trainingCalendarData'
import { TrainingActivityTag } from './TrainingBadges'
import { TrainingEntryLink } from './TrainingEntryLink'

type Props = {
  stableId: string
  events: Array<Doc<'events'>>
  records: Array<Doc<'trainingRecords'>>
  horses: Array<TrainingHorse>
  fixedHorseId?: string
  initialHorseIds?: Array<string>
  initialDate?: string
  initialView?: 'week' | 'month'
}
export function TrainingCalendar({
  stableId,
  events,
  records,
  horses,
  fixedHorseId,
  initialHorseIds = [],
  initialDate,
  initialView,
}: Props) {
  const t = useT()
  const { locale } = useLocale()

  const { today } = useLocalDateContext()
  const id = useId()
  const [view, setView] = useState<'week' | 'month'>(initialView ?? 'week')
  const [anchor, setAnchor] = useState(initialDate ?? today)
  const [selected, setSelected] = useState(initialHorseIds)
  const [horseQuery, setHorseQuery] = useState('')
  const [activity, setActivity] = useState('all')
  const [status, setStatus] = useState('all')
  useEffect(() => {
    if (initialView) return
    try {
      const saved = localStorage.getItem('training-calendar-view')
      if (saved === 'week' || saved === 'month') setView(saved)
    } catch {
      /* Storage is optional. */
    }
  }, [initialView])
  const changeView = (next: 'week' | 'month') => {
    setView(next)
    try {
      localStorage.setItem('training-calendar-view', next)
    } catch {
      /* Storage is optional. */
    }
  }
  const period = trainingWindow(anchor, view)
  const selectedHorses = horses.filter((horse) =>
    fixedHorseId
      ? horse._id === fixedHorseId
      : selected.length === 0 || selected.includes(horse._id),
  )
  const entries = getTrainingEntries({
    events,
    records,
    horses: selectedHorses,
    ...period,
    today,
  }).filter(
    (entry) =>
      (activity === 'all' ||
        entry.details.activities.some((item) => item === activity)) &&
      (status === 'all' || entry.status === status),
  )
  const label =
    view === 'month'
      ? formatMonthYearDate(dateKeyToDate(anchor), locale)
      : `${formatShortDateKey(period.start, locale)} – ${formatShortDateKey(period.end, locale)}`
  const dayEntries = (date: string, horseId?: string) =>
    entries.filter(
      (entry) =>
        entry.occurrence.startDate <= date &&
        entry.occurrence.endDate >= date &&
        (!horseId || entry.horse._id === horseId),
    )
  const move = (direction: number) => {
    const date = dateKeyToDate(anchor)
    setAnchor(
      formatDateKey(
        view === 'month'
          ? new Date(date.getFullYear(), date.getMonth() + direction, 1)
          : new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate() + direction * 7,
            ),
      ),
    )
  }
  const inspectWeek = (date: string) => {
    setAnchor(date)
    changeView('week')
  }
  const leadingDays = (dateKeyToDate(period.start).getDay() + 6) % 7
  const monthCells = [
    ...Array<string | null>(leadingDays).fill(null),
    ...period.days,
  ]
  while (monthCells.length % 7) monthCells.push(null)

  return (
    <DashboardSectionCard title={label} contentGap="comfortable">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label={t('trainingViews.navigation')}
          className="flex items-center gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => move(-1)}
            aria-label={t(
              view === 'week'
                ? 'trainingViews.previousWeek'
                : 'trainingViews.previousMonth',
            )}
          >
            <CaretLeftIcon aria-hidden="true" />
            {t('trainingViews.previous')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAnchor(today)}>
            {t('trainingViews.today')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => move(1)}
            aria-label={t(
              view === 'week'
                ? 'trainingViews.nextWeek'
                : 'trainingViews.nextMonth',
            )}
          >
            {t('trainingViews.next')}
            <CaretRightIcon aria-hidden="true" />
          </Button>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <ChoiceButtonGroup
            aria-label={t('trainingViews.view')}
            className="w-auto"
            value={view}
            options={[
              { value: 'week', label: t('trainingViews.week') },
              { value: 'month', label: t('trainingViews.month') },
            ]}
            onValueChange={(value) => changeView(value)}
          />
          <ButtonLink
            to="/stables/$stableId/training/create"
            params={{ stableId }}
            search={{ horseIds: fixedHorseId ? [fixedHorseId] : selected }}
            action="create"
          >
            {t('trainingViews.addSession')}
          </ButtonLink>
        </div>
      </div>
      <div className="grid gap-4 rounded-row bg-surface p-4">
        <div
          className={`grid gap-3 ${fixedHorseId ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}
        >
          {!fixedHorseId && (
            <Field>
              <FieldLabel htmlFor={`${id}-horses`}>
                {t('trainingViews.findHorses')}
              </FieldLabel>
              <Input
                id={`${id}-horses`}
                value={horseQuery}
                onChange={(e) => setHorseQuery(e.target.value)}
                placeholder={t('trainingViews.searchHorses')}
              />
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor={`${id}-activity`}>
              {t('trainingViews.workType')}
            </FieldLabel>
            <Select
              id={`${id}-activity`}
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            >
              <option value="all">{t('trainingViews.allActivities')}</option>
              {trainingActivities.map((item) => (
                <option key={item} value={item}>
                  {t(`training.activities.${item}`)}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-status`}>
              {t('trainingViews.status')}
            </FieldLabel>
            <Select
              id={`${id}-status`}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">{t('trainingViews.allStatuses')}</option>
              {(
                Object.keys(trainingStatusLabels) as Array<
                  keyof typeof trainingStatusLabels
                >
              ).map((value) => (
                <option key={value} value={value}>
                  {t(`training.status.${value}`)}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {!fixedHorseId && (
          <div
            role="group"
            aria-label={t('trainingViews.filterHorses')}
            className="flex flex-wrap gap-2"
          >
            <Button
              size="sm"
              variant={selected.length === 0 ? 'secondary' : 'outline'}
              aria-pressed={selected.length === 0}
              onClick={() => setSelected([])}
            >
              {t('trainingViews.allHorses')}
            </Button>
            {horses.some((h) => h.canRecord) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setSelected(
                    horses.filter((h) => h.canRecord).map((h) => h._id),
                  )
                }
              >
                {t('trainingViews.myHorses')}
              </Button>
            )}
            {horses
              .filter(
                (horse) =>
                  horse.name
                    .toLocaleLowerCase()
                    .includes(horseQuery.toLocaleLowerCase()) ||
                  selected.includes(horse._id),
              )
              .map((horse) => (
                <Button
                  key={horse._id}
                  size="sm"
                  variant={
                    selected.includes(horse._id) ? 'secondary' : 'outline'
                  }
                  aria-pressed={selected.includes(horse._id)}
                  onClick={() =>
                    setSelected((current) =>
                      current.includes(horse._id)
                        ? current.filter((item) => item !== horse._id)
                        : [...current, horse._id],
                    )
                  }
                >
                  {horse.name}
                  {selected.includes(horse._id) && <XIcon aria-hidden="true" />}
                </Button>
              ))}
          </div>
        )}
        <div
          className="flex flex-wrap gap-2"
          aria-label={t('trainingViews.legend')}
        >
          {trainingActivities.map((item) => (
            <TrainingActivityTag key={item} activity={item} />
          ))}
        </div>
      </div>
      {horses.length === 0 ? (
        <DashboardEmptyState title={t('trainingViews.addHorse')} />
      ) : (
        <>
          {entries.length === 0 && (
            <DashboardEmptyState
              chrome="flat"
              title={t('trainingViews.noMatches')}
            >
              {t('trainingViews.noMatchesHelp')}
            </DashboardEmptyState>
          )}
          {/* Small screens use the existing calendar's agenda pattern. */}
          <div
            className="grid gap-5 md:hidden"
            aria-label={t('trainingViews.agenda')}
          >
            {period.days
              .filter((day) => dayEntries(day).length > 0)
              .map((day) => (
                <section key={day} className="grid gap-2">
                  <h3 className="font-semibold">
                    {formatShortDateKey(day, locale)}
                  </h3>
                  {dayEntries(day).map((entry) => (
                    <TrainingEntryLink
                      key={entry.key}
                      entry={entry}
                      stableId={stableId}
                    />
                  ))}
                </section>
              ))}
          </div>
          {view === 'week' ? (
            <div
              className="app-panel-strong hidden overflow-hidden md:block"
              tabIndex={0}
              role="region"
              aria-label={t('trainingViews.weekly')}
            >
              <Table className="w-full min-w-[68rem] table-fixed border-collapse text-sm">
                <caption className="sr-only">
                  {t('trainingViews.weeklyCaption', { period: label })}
                </caption>
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-muted">
                    <th scope="col" className="w-32 p-3 text-left">
                      {t('trainingViews.horse')}
                    </th>
                    {period.days.map((day) => (
                      <th
                        scope="col"
                        key={day}
                        className="p-3 text-left"
                        aria-current={day === today ? 'date' : undefined}
                      >
                        {formatShortWeekdayDate(dateKeyToDate(day), locale)}{' '}
                        {formatShortDateKey(day, locale)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedHorses.map((horse) => (
                    <tr
                      key={horse._id}
                      className="border-b border-border-subtle last:border-b-0"
                    >
                      <th scope="row" className="p-3 text-left align-top">
                        {horse.name}
                      </th>
                      {period.days.map((day) => (
                        <td
                          key={day}
                          className="border-l border-border-subtle p-2 align-top"
                        >
                          <div className="grid gap-2">
                            {dayEntries(day, horse._id).map((entry) => (
                              <TrainingEntryLink
                                key={entry.key}
                                entry={entry}
                                stableId={stableId}
                                showHorseName={false}
                              />
                            ))}
                            {dayEntries(day, horse._id).length === 0 && (
                              <span className="text-xs text-muted-foreground">
                                {t('trainingViews.noRecorded')}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <CalendarShell
              className="hidden md:block"
              role="table"
              aria-label={t('trainingViews.monthly')}
            >
              <CalendarWeekdayRow role="row">
                {Array.from({ length: 7 }, (_, index) =>
                  formatShortWeekdayDate(new Date(2026, 8, 28 + index), locale),
                ).map((day) => (
                  <CalendarWeekdayCell role="columnheader" key={day}>
                    {day}
                  </CalendarWeekdayCell>
                ))}
              </CalendarWeekdayRow>
              <CalendarGrid role="rowgroup">
                {Array.from({ length: monthCells.length / 7 }, (_, row) => (
                  <div role="row" className="contents" key={row}>
                    {monthCells.slice(row * 7, row * 7 + 7).map((day, index) =>
                      day ? (
                        <CalendarDayCell
                          role="cell"
                          key={day}
                          isToday={day === today}
                        >
                          <CalendarDayHeader>
                            <Button
                              variant="subtle"
                              size="sm"
                              aria-label={t('trainingViews.inspectWeek', {
                                date: formatShortDateKey(day, locale),
                              })}
                              onClick={() => inspectWeek(day)}
                            >
                              <CalendarDayNumber isToday={day === today}>
                                {dateKeyToDate(day).getDate()}
                              </CalendarDayNumber>
                            </Button>
                          </CalendarDayHeader>
                          <CalendarDayEventList>
                            {dayEntries(day)
                              .slice(0, 2)
                              .map((entry) => (
                                <TrainingEntryLink
                                  key={entry.key}
                                  entry={entry}
                                  stableId={stableId}
                                />
                              ))}
                            {dayEntries(day).length > 2 && (
                              <CalendarMoreEventsButton
                                onClick={() => inspectWeek(day)}
                              >
                                {t('trainingViews.moreWeek', {
                                  count: dayEntries(day).length - 2,
                                })}
                              </CalendarMoreEventsButton>
                            )}
                          </CalendarDayEventList>
                        </CalendarDayCell>
                      ) : (
                        <CalendarDayCell
                          role="cell"
                          muted
                          key={`empty-${index}`}
                        />
                      ),
                    )}
                  </div>
                ))}
              </CalendarGrid>
            </CalendarShell>
          )}
        </>
      )}
    </DashboardSectionCard>
  )
}
