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
  trainingActivityLabels,
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
      ? formatMonthYearDate(dateKeyToDate(anchor))
      : `${formatShortDateKey(period.start)} – ${formatShortDateKey(period.end)}`
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
          aria-label="Calendar navigation"
          className="flex items-center gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => move(-1)}
            aria-label={`Previous ${view}`}
          >
            <CaretLeftIcon aria-hidden="true" />
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAnchor(today)}>
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => move(1)}
            aria-label={`Next ${view}`}
          >
            Next
            <CaretRightIcon aria-hidden="true" />
          </Button>
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <ChoiceButtonGroup
            aria-label="Calendar view"
            className="w-auto"
            value={view}
            options={[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
            onValueChange={(value) => changeView(value)}
          />
          <ButtonLink
            to="/stables/$stableId/training/create"
            params={{ stableId }}
            search={{ horseIds: fixedHorseId ? [fixedHorseId] : selected }}
            action="create"
          >
            Add training session
          </ButtonLink>
        </div>
      </div>
      <div className="grid gap-4 rounded-row bg-surface p-4">
        <div
          className={`grid gap-3 ${fixedHorseId ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}
        >
          {!fixedHorseId && (
            <Field>
              <FieldLabel htmlFor={`${id}-horses`}>Find horses</FieldLabel>
              <Input
                id={`${id}-horses`}
                value={horseQuery}
                onChange={(e) => setHorseQuery(e.target.value)}
                placeholder="Search horses to select"
              />
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor={`${id}-activity`}>Type of work</FieldLabel>
            <Select
              id={`${id}-activity`}
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            >
              <option value="all">All activities</option>
              {trainingActivities.map((item) => (
                <option key={item} value={item}>
                  {trainingActivityLabels[item]}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-status`}>Status</FieldLabel>
            <Select
              id={`${id}-status`}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              {Object.entries(trainingStatusLabels).map(([value, name]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {!fixedHorseId && (
          <div
            role="group"
            aria-label="Filter by horses"
            className="flex flex-wrap gap-2"
          >
            <Button
              size="sm"
              variant={selected.length === 0 ? 'secondary' : 'outline'}
              aria-pressed={selected.length === 0}
              onClick={() => setSelected([])}
            >
              All horses
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
                Horses I manage
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
          aria-label="Activity colour legend"
        >
          {trainingActivities.map((item) => (
            <TrainingActivityTag key={item} activity={item} />
          ))}
        </div>
      </div>
      {horses.length === 0 ? (
        <DashboardEmptyState title="Add a horse to start a training log." />
      ) : (
        <>
          {entries.length === 0 && (
            <DashboardEmptyState
              chrome="flat"
              title="No training matches this period and these filters."
            >
              Empty days mean no training recorded. Adjust the filters or add a
              session.
            </DashboardEmptyState>
          )}
          {/* Small screens use the existing calendar's agenda pattern. */}
          <div className="grid gap-5 md:hidden" aria-label="Training agenda">
            {period.days
              .filter((day) => dayEntries(day).length > 0)
              .map((day) => (
                <section key={day} className="grid gap-2">
                  <h3 className="font-semibold">{formatShortDateKey(day)}</h3>
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
              aria-label="Weekly training by horse"
            >
              <Table className="w-full min-w-[68rem] table-fixed border-collapse text-sm">
                <caption className="sr-only">
                  {label}, training by horse and day
                </caption>
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-muted">
                    <th scope="col" className="w-32 p-3 text-left">
                      Horse
                    </th>
                    {period.days.map((day) => (
                      <th
                        scope="col"
                        key={day}
                        className="p-3 text-left"
                        aria-current={day === today ? 'date' : undefined}
                      >
                        {formatShortWeekdayDate(dateKeyToDate(day))}{' '}
                        {formatShortDateKey(day)}
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
                                No training recorded
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
              aria-label="Monthly training calendar"
            >
              <CalendarWeekdayRow role="row">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                  (day) => (
                    <CalendarWeekdayCell role="columnheader" key={day}>
                      {day}
                    </CalendarWeekdayCell>
                  ),
                )}
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
                              aria-label={`Inspect week of ${formatShortDateKey(day)}`}
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
                                +{dayEntries(day).length - 2} more · View week
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
