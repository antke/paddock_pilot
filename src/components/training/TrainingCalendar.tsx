import { MotionDisclosure } from '#/components/motion/MotionDisclosure'
import { useChangeMotion } from '#/components/motion/useChangeMotion'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { Table } from '#/components/ui/table'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Doc } from 'convex/_generated/dataModel'
import {
  CaretLeftIcon,
  CaretRightIcon,
  FunnelSimpleIcon,
  XIcon,
} from '@phosphor-icons/react'
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
  isDateKey,
  trainingActivities,
  trainingStatusLabels,
} from 'shared/training/trainingSchema'
import { getTrainingEntries, trainingWindow } from './trainingCalendarData'
import type { TrainingHorse } from './trainingCalendarData'
import { TrainingEntryLink } from './TrainingEntryLink'
import { TrainingMonthCalendar } from './TrainingMonthCalendar'
import { useSessionState } from '#/lib/useSessionState'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { MobileActionBar } from '#/components/layout/MobileActionBar'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'

type Props = {
  stableId?: string
  events: Array<Doc<'events'>>
  records: Array<Doc<'trainingRecords'>>
  horses: Array<TrainingHorse>
  fixedHorseId?: string
  initialHorseIds?: Array<string>
  initialDate?: string
  initialView?: 'week' | 'month'
  renderMobileActions?: (canRecord: boolean) => ReactNode
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
  renderMobileActions,
}: Props) {
  const t = useT()
  const { locale } = useLocale()
  const small = useSmallScreen()
  const taskState = useTaskOriginState()
  const stateKey = initialDate
    ? undefined
    : `paddock:training:${stableId ?? 'personal'}:${fixedHorseId ?? 'all'}`
  const key = (field: string) => (stateKey ? `${stateKey}:${field}` : undefined)
  const decodeText = (v: unknown) =>
    typeof v === 'string' && v.length < 1000 ? v : undefined

  const { today } = useLocalDateContext()
  const id = useId()
  const [view, setView] = useState<'week' | 'month'>(initialView ?? 'week')
  const [anchor, setAnchor] = useSessionState(
    key('date'),
    initialDate ?? today,
    (v) => (typeof v === 'string' && isDateKey(v) ? v : undefined),
  )
  const [selected, setSelected] = useSessionState(
    key(`horses:${initialHorseIds.join(',')}`),
    initialHorseIds,
    (v) =>
      Array.isArray(v) &&
      v.length < 1000 &&
      v.every((horseId) => typeof horseId === 'string')
        ? v
        : undefined,
  )
  const [horseQuery, setHorseQuery] = useState('')
  const [activity, setActivity] = useSessionState(
    key('activity'),
    'all',
    (v) =>
      v === 'all' ||
      trainingActivities.includes(v as (typeof trainingActivities)[number])
        ? (v as string)
        : undefined,
  )
  const [status, setStatus] = useSessionState(key('status'), 'all', (v) =>
    decodeText(v) &&
    (v === 'all' || Object.hasOwn(trainingStatusLabels, v as string))
      ? (v as string)
      : undefined,
  )
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterToggle = useRef<HTMLButtonElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const returnToResults = useRef(false)
  useEffect(() => {
    if (!filtersOpen && returnToResults.current) {
      returnToResults.current = false
      resultsRef.current?.focus({ preventScroll: true })
      resultsRef.current?.scrollIntoView({ block: 'start' })
    }
  }, [filtersOpen])
  const activeFilterCount =
    Number(selected.length > 0 && !fixedHorseId) +
    Number(activity !== 'all') +
    Number(status !== 'all')
  const filterSummary = [
    !fixedHorseId && selected.length
      ? horses
          .filter((horse) => selected.includes(horse._id))
          .map((horse) => getHorseDisplayName(horse))
          .join(', ')
      : undefined,
    activity !== 'all'
      ? t(
          `training.activities.${activity as (typeof trainingActivities)[number]}`,
        )
      : undefined,
    status !== 'all'
      ? t(`training.status.${status as keyof typeof trainingStatusLabels}`)
      : undefined,
  ]
    .filter(Boolean)
    .join(' · ')
  useEffect(() => {
    if (initialView) return
    try {
      const saved = localStorage.getItem('training-calendar-view')
      if (saved === 'week' || saved === 'month') setView(saved)
    } catch {
      /* Storage is optional. */
    }
  }, [initialView])
  const periodMotion = useChangeMotion<HTMLDivElement>(`${view}-${anchor}`)
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

  const viewControl = (
    <ChoiceButtonGroup
      aria-label={t('trainingViews.view')}
      layout={small ? 'segmented' : 'compact'}
      className={
        small
          ? '[&>button]:min-h-11 [&>button]:px-3 [&>button]:text-sm'
          : 'grid w-auto grid-cols-2 [&>button]:h-(--control-height) [&>button]:px-3 [&>button]:text-sm [&>button]:pointer-coarse:min-h-11'
      }
      value={view}
      options={[
        { value: 'week', label: t('trainingViews.week') },
        { value: 'month', label: t('trainingViews.month') },
      ]}
      onValueChange={(value) => changeView(value)}
    />
  )
  const filterControl = (
    <Button
      ref={filterToggle}
      variant="outline"
      size="control"
      className={small ? 'min-h-11 px-2' : undefined}
      aria-expanded={filtersOpen}
      aria-controls={`${id}-filters`}
      onClick={() => setFiltersOpen((open) => !open)}
    >
      <FunnelSimpleIcon aria-hidden="true" />
      {t('listControls.filters')}
      {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
    </Button>
  )

  return (
    <DashboardSectionCard
      title={small ? undefined : label}
      contentGap="comfortable"
    >
      {small ? (
        <div className="grid gap-3">
          <div
            role="group"
            aria-label={t('trainingViews.navigation')}
            className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem_auto] items-center gap-1"
          >
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => move(-1)}
              aria-label={t(
                view === 'week'
                  ? 'trainingViews.previousWeek'
                  : 'trainingViews.previousMonth',
              )}
            >
              <CaretLeftIcon aria-hidden="true" />
            </Button>
            <h2
              className="min-w-0 text-center font-display text-lg font-semibold leading-tight"
              aria-live="polite"
              aria-atomic="true"
            >
              {label}
            </h2>
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => move(1)}
              aria-label={t(
                view === 'week'
                  ? 'trainingViews.nextWeek'
                  : 'trainingViews.nextMonth',
              )}
            >
              <CaretRightIcon aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="control"
              className="min-h-11 px-2"
              onClick={() => setAnchor(today)}
            >
              {t('trainingViews.today')}
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {viewControl}
            {filterControl}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label={t('trainingViews.navigation')}
            className="grid max-w-full grid-cols-3 items-center gap-2 [&>button]:px-2 [&>button]:whitespace-nowrap sm:[&>button]:px-3"
          >
            <Button
              variant="outline"
              size="control"
              onClick={() => move(-1)}
              aria-label={t(
                view === 'week'
                  ? 'trainingViews.previousWeek'
                  : 'trainingViews.previousMonth',
              )}
            >
              <CaretLeftIcon aria-hidden="true" className="hidden sm:block" />
              {t('trainingViews.previous')}
            </Button>
            <Button
              variant="outline"
              size="control"
              onClick={() => setAnchor(today)}
            >
              {t('trainingViews.today')}
            </Button>
            <Button
              variant="outline"
              size="control"
              onClick={() => move(1)}
              aria-label={t(
                view === 'week'
                  ? 'trainingViews.nextWeek'
                  : 'trainingViews.nextMonth',
              )}
            >
              {t('trainingViews.next')}
              <CaretRightIcon aria-hidden="true" className="hidden sm:block" />
            </Button>
          </div>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            {viewControl}
            {horses.some((horse) => horse.canRecord) &&
              (stableId && !fixedHorseId ? (
                <ButtonLink
                  size="control"
                  to="/stables/$stableId/training/create"
                  params={{ stableId }}
                  search={{
                    horseIds: fixedHorseId ? [fixedHorseId] : undefined,
                  }}
                  state={taskState}
                  variant="default"
                  action="create"
                >
                  {t('trainingViews.addSession')}
                </ButtonLink>
              ) : (
                <ButtonLink
                  size="control"
                  to="/events/create"
                  search={{ horseId: fixedHorseId, training: true }}
                  state={taskState}
                  variant="default"
                  action="create"
                >
                  {t('trainingViews.addSession')}
                </ButtonLink>
              ))}
          </div>
        </div>
      )}
      {small &&
        (renderMobileActions
          ? renderMobileActions(horses.some((horse) => horse.canRecord))
          : horses.some((horse) => horse.canRecord) && (
              <MobileActionBar>
                {stableId && !fixedHorseId ? (
                  <ButtonLink
                    action="record"
                    to="/stables/$stableId/training/create"
                    params={{ stableId }}
                    search={{
                      intent: 'record',
                      horseIds: fixedHorseId ? [fixedHorseId] : undefined,
                    }}
                    state={taskState}
                  >
                    {t('trainingViews.recordCompleted')}
                  </ButtonLink>
                ) : (
                  <ButtonLink
                    action="record"
                    to="/events/create"
                    search={{
                      horseId: fixedHorseId,
                      training: true,
                      intent: 'record',
                    }}
                    state={taskState}
                  >
                    {t('trainingViews.recordCompleted')}
                  </ButtonLink>
                )}
              </MobileActionBar>
            ))}
      {(!small || activeFilterCount > 0) && (
        <div className="flex flex-wrap items-center gap-3">
          {!small && filterControl}
          {activeFilterCount > 0 && (
            <>
              <span className="min-w-0 flex-1 text-sm [overflow-wrap:anywhere]">
                {filterSummary}
              </span>
              <Button
                variant="ghost"
                size="control"
                onClick={() => {
                  setSelected([])
                  setActivity('all')
                  setStatus('all')
                  setHorseQuery('')
                }}
              >
                {t('listControls.clear')}
              </Button>
            </>
          )}
        </div>
      )}
      <MotionDisclosure
        id={`${id}-filters`}
        open={filtersOpen}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            setFiltersOpen(false)
            filterToggle.current?.focus()
          }
        }}
      >
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
                size="control"
                variant={selected.length === 0 ? 'secondary' : 'outline'}
                aria-pressed={selected.length === 0}
                onClick={() => setSelected([])}
              >
                {t('trainingViews.allHorses')}
              </Button>
              {horses.some((h) => h.canRecord) && (
                <Button
                  size="control"
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
                    getHorseDisplayName(horse)
                      .toLocaleLowerCase()
                      .includes(horseQuery.toLocaleLowerCase()) ||
                    selected.includes(horse._id),
                )
                .map((horse) => (
                  <Button
                    key={horse._id}
                    size="control"
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
                    {getHorseDisplayName(horse)}
                    {selected.includes(horse._id) && (
                      <XIcon aria-hidden="true" />
                    )}
                  </Button>
                ))}
            </div>
          )}
          {small && (
            <Button
              variant="secondary"
              className="min-h-11 w-full"
              onClick={() => {
                returnToResults.current = true
                setFiltersOpen(false)
              }}
            >
              {t('trainingViews.showResults')}
            </Button>
          )}
        </div>
      </MotionDisclosure>
      <div
        ref={resultsRef}
        role={small ? 'region' : undefined}
        aria-label={small ? t('trainingViews.agenda') : undefined}
        tabIndex={small ? -1 : undefined}
        className="grid min-w-0 scroll-mt-4 gap-5"
      >
        {horses.length === 0 ? (
          <DashboardEmptyState title={t('trainingViews.addHorse')} />
        ) : (
          <div ref={periodMotion} className="grid min-w-0 gap-5">
            {entries.length === 0 && (!small || view === 'week') && (
              <DashboardEmptyState
                chrome="flat"
                title={t('trainingViews.noMatches')}
              >
                {t('trainingViews.noMatchesHelp')}
              </DashboardEmptyState>
            )}
            {small &&
              (view === 'month' ? (
                <TrainingMonthCalendar
                  days={period.days}
                  entries={entries}
                  selectedDate={anchor}
                  today={today}
                  onSelectDate={setAnchor}
                />
              ) : (
                <div className="grid gap-5">
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
              ))}
            {!small &&
              (view === 'week' ? (
                <div
                  className="app-panel-strong hidden overflow-hidden md:block"
                  tabIndex={0}
                  role="region"
                  aria-label={t('trainingViews.weekly')}
                >
                  <Table className="w-full min-w-[76rem] table-fixed border-collapse text-sm">
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
                            {getHorseDisplayName(horse)}
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
                                    variant="week"
                                  />
                                ))}
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
                  className="hidden overflow-x-auto md:block"
                  tabIndex={0}
                  role="table"
                  aria-label={t('trainingViews.monthly')}
                >
                  <CalendarWeekdayRow role="row" className="min-w-[56rem]">
                    {Array.from({ length: 7 }, (_, index) =>
                      formatShortWeekdayDate(
                        new Date(2026, 8, 28 + index),
                        locale,
                      ),
                    ).map((day) => (
                      <CalendarWeekdayCell role="columnheader" key={day}>
                        {day}
                      </CalendarWeekdayCell>
                    ))}
                  </CalendarWeekdayRow>
                  <CalendarGrid
                    period={anchor.slice(0, 7)}
                    role="rowgroup"
                    className="min-w-[56rem]"
                  >
                    {Array.from({ length: monthCells.length / 7 }, (_, row) => (
                      <div role="row" className="contents" key={row}>
                        {monthCells
                          .slice(row * 7, row * 7 + 7)
                          .map((day, index) =>
                            day ? (
                              <CalendarDayCell
                                role="cell"
                                className="h-auto min-h-64 md:pointer-coarse:h-auto"
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
                                        variant="month"
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
                                className="h-auto min-h-64 md:pointer-coarse:h-auto"
                                muted
                                key={`empty-${index}`}
                              />
                            ),
                          )}
                      </div>
                    ))}
                  </CalendarGrid>
                </CalendarShell>
              ))}
          </div>
        )}
      </div>
    </DashboardSectionCard>
  )
}
