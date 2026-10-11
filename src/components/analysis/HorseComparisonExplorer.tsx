import { useId, useRef } from 'react'
import {
  useAnalysisSessionState,
  decodeAnalysisRange,
  decodeComparisonSelection,
  decodePeriodChoice,
  decodePreviousRange,
  decodeBoolean,
  decodeSelectedPoint,
  encodeSelectedPoint,
} from './analysisSessionState'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import {
  DetailKeyValueList,
  DetailKeyValueRow,
} from '#/components/dashboard/DetailBlocks'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { Button, ButtonLink } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { DateRangeControl } from '#/components/ui/date-range-control'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { ScrollableList } from '#/components/ui/scrollable-list'
import { TimeComparisonChart } from '#/components/charts/TimeComparisonChart'
import type { TimeChartPoint } from '#/components/charts/TimeComparisonChart'
import {
  formatMediumDateKey,
  formatShortDateKey,
  getTodayDateKey,
} from '#/lib/dateDisplay'
import { formatDecimal } from '#/lib/numberDisplay'
import { isDateKey } from 'shared/training/trainingSchema'
import {
  dateNumber,
  dayMilliseconds,
  shiftDate,
} from 'shared/analysis/horseComparison'
import type {
  ComparisonKind,
  ComparisonRange,
  HorseComparisonRecord,
} from 'shared/analysis/horseComparison'
import {
  comparisonRecordLabel,
  contextKinds,
  createComparisonRows,
  horseComparisonPresets,
  horseMeasures,
  trainingStatusLabel,
} from './horseComparisonData'
import type {
  HorseComparisonPreset,
  HorseComparisonSelection,
  HorseMeasure,
} from './horseComparisonData'

type ExplorerProps = {
  horseId: string
  stableId?: string
  sampleRecords?: Array<HorseComparisonRecord>
  today?: string
  range?: ComparisonRange
  onRangeChange?: (range: ComparisonRange) => void
  persistenceKey?: string
}

export function HorseComparisonExplorer({
  horseId,
  stableId,
  sampleRecords,
  today = getTodayDateKey(),
  range: controlledRange,
  onRangeChange,
  persistenceKey,
}: ExplorerProps) {
  const t = useT()
  const { locale } = useLocale()
  const id = useId()
  const sessionField = (field: string) =>
    persistenceKey ? `${persistenceKey}:${field}` : undefined
  const [selection, setSelection] =
    useAnalysisSessionState<HorseComparisonSelection>(
      sessionField('comparison'),
      horseComparisonPresets.trainingHealth,
      decodeComparisonSelection,
    )
  const [ownRange, setOwnRange] = useAnalysisSessionState<ComparisonRange>(
    sessionField('range'),
    () => ({
      start: shiftDate(today, -89),
      end: today,
    }),
    decodeAnalysisRange,
  )
  const range = controlledRange ?? ownRange
  const rangeKey = `${range.start}:${range.end}`
  const inferredPeriod =
    range.end === today
      ? (['30', '90', '180', '365'].find(
          (days) => range.start === shiftDate(today, 1 - Number(days)),
        ) ?? 'custom')
      : 'custom'
  const [periodChoice, setPeriodChoice] = useAnalysisSessionState(
    sessionField('periodChoice'),
    () => ({ value: inferredPeriod, rangeKey }),
    decodePeriodChoice,
  )
  // Keep an explicit Custom selection while its dates are unchanged. A range
  // received from stable navigation derives its own matching preset.
  const period =
    periodChoice.rangeKey === rangeKey ? periodChoice.value : inferredPeriod
  const setPeriod = (value: string) => setPeriodChoice({ value, rangeKey })
  const setRange = (next: ComparisonRange) => {
    setOwnRange(next)
    onRangeChange?.(next)
  }
  const [previousRange, setPreviousRange] = useAnalysisSessionState<{
    range: ComparisonRange
    period: string
  } | null>(sessionField('previousRange'), null, decodePreviousRange)
  const [showOthers, setShowOthers] = useAnalysisSessionState(
    sessionField('otherTraining'),
    false,
    decodeBoolean,
  )
  const [customizeOpen, setCustomizeOpen] = useAnalysisSessionState(
    sessionField('customizeOpen'),
    false,
    decodeBoolean,
  )
  const preset = (
    Object.keys(horseComparisonPresets) as Array<HorseComparisonPreset>
  ).find((key) => {
    const p = horseComparisonPresets[key]
    return (
      p.measure === selection.measure &&
      p.context === selection.context &&
      p.extra === selection.extra
    )
  })
  const invalid =
    !isDateKey(range.start) ||
    !isDateKey(range.end) ||
    range.start > range.end ||
    dateNumber(range.end) - dateNumber(range.start) > 3660 * dayMilliseconds
  const resultProps = {
    horseId,
    stableId,
    persistenceKey,
    selection,
    range,
    showOthers,
    onFit: (next: ComparisonRange) => {
      setPreviousRange({ range, period })
      setPeriod('custom')
      setRange(next)
    },
    onAround: (date: string) => {
      setPreviousRange({ range, period })
      setPeriod('custom')
      setRange({ start: shiftDate(date, -28), end: shiftDate(date, 28) })
    },
  }
  const selectContext = (key: 'context' | 'extra', value: string) =>
    setSelection((current) => ({
      ...current,
      [key]: value as ComparisonKind | 'none',
    }))
  return (
    <DashboardSection
      title={
        preset
          ? t(`horseComparison.questions.${preset}`)
          : t('horseComparison.title')
      }
      description={t('horseComparison.help')}
      span="xl3"
      size="panel"
      className="min-w-0"
      gap="roomy"
    >
      <ChoiceButtonGroup
        value={preset}
        aria-label={t('horseComparison.preset')}
        options={(
          Object.keys(horseComparisonPresets) as Array<HorseComparisonPreset>
        ).map((value) => ({
          value,
          label: t(`horseComparison.presets.${value}`),
        }))}
        onValueChange={(value) => setSelection(horseComparisonPresets[value])}
      />
      <DateRangeControl
        start={range.start}
        end={range.end}
        preset={period}
        invalid={invalid}
        onChange={(next) => {
          setPeriod('custom')
          setRange(next)
        }}
        onPresetChange={(value) => {
          setPeriod(value)
          if (value !== 'custom')
            setRange({ start: shiftDate(today, 1 - Number(value)), end: today })
        }}
        presets={[
          ...['30', '90', '180'].map((value) => ({
            value,
            label: t('horseComparison.days', { count: Number(value) }),
          })),
          { value: '365', label: t('horseComparison.year') },
          { value: 'custom', label: t('horseComparison.custom') },
        ]}
        labels={{
          period: t('horseComparison.period'),
          start: t('horseComparison.start'),
          end: t('horseComparison.end'),
          error: t('horseComparison.rangeError'),
        }}
      />
      <p className="text-sm text-muted-foreground">
        {t('horseComparison.scope', {
          start: isDateKey(range.start)
            ? formatMediumDateKey(range.start, locale)
            : range.start,
          end: isDateKey(range.end)
            ? formatMediumDateKey(range.end, locale)
            : range.end,
        })}
      </p>
      {previousRange && (
        <Button
          variant="ghost"
          size="sm"
          className="justify-self-start"
          onClick={() => {
            setRange(previousRange.range)
            setPeriod(previousRange.period)
            setPreviousRange(null)
          }}
        >
          {t('horseComparison.returnRange')}
        </Button>
      )}
      <details
        className="min-w-0"
        open={customizeOpen}
        onToggle={(event) => setCustomizeOpen(event.currentTarget.open)}
      >
        <summary className="app-disclosure-trigger cursor-pointer text-sm font-medium">
          {t('horseComparison.customize')}
        </summary>
        <div className="grid gap-3 pt-3">
          <div className="grid min-w-0 gap-3 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor={`${id}-measure`}>
                {t('horseComparison.measure')}
              </FieldLabel>
              <Select
                id={`${id}-measure`}
                value={selection.measure}
                onChange={(event) =>
                  setSelection((current) => ({
                    ...current,
                    measure: event.target.value as HorseMeasure,
                  }))
                }
              >
                {horseMeasures.map((value) => (
                  <option key={value} value={value}>
                    {t(`horseComparison.measures.${value}`)}
                  </option>
                ))}
              </Select>
            </Field>
            {(['context', 'extra'] as const).map((key) => (
              <Field key={key}>
                <FieldLabel htmlFor={`${id}-${key}`}>
                  {t(`horseComparison.${key}`)}
                </FieldLabel>
                <Select
                  id={`${id}-${key}`}
                  value={selection[key]}
                  onChange={(event) => selectContext(key, event.target.value)}
                >
                  <option value="none">{t('horseComparison.none')}</option>
                  {contextKinds.map((kind) => (
                    <option key={kind} value={kind}>
                      {t(`horseComparison.kinds.${kind}`)}
                    </option>
                  ))}
                </Select>
              </Field>
            ))}
          </div>
          <FieldLabel className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={showOthers}
              onCheckedChange={(checked) => setShowOthers(checked === true)}
            />
            {t('horseComparison.showOtherTraining')}
          </FieldLabel>
        </div>
      </details>
      {!invalid &&
        (sampleRecords !== undefined ? (
          <ComparisonResults {...resultProps} records={sampleRecords} sample />
        ) : (
          <LiveComparisonResults {...resultProps} />
        ))}
    </DashboardSection>
  )
}

type ResultProps = {
  horseId: string
  stableId?: string
  selection: HorseComparisonSelection
  range: ComparisonRange
  showOthers: boolean
  onAround: (date: string) => void
  onFit?: (range: ComparisonRange) => void
  persistenceKey?: string
}
function LiveComparisonResults(props: ResultProps) {
  const t = useT()
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const query = useQuery(
    convexQuery(api.stableAnalysis.getHorseComparisons, {
      horseId: props.horseId as Id<'horses'>,
      ...props.range,
      timeZone,
    }),
  )
  if (query.isPending)
    return <p role="status">{t('horseComparison.loading')}</p>
  if (query.isError)
    return (
      <DashboardEmptyState
        actions={
          <Button variant="outline" onClick={() => void query.refetch()}>
            {t('horseComparison.retry')}
          </Button>
        }
      >
        <span role="alert">{t('horseComparison.error')}</span>
      </DashboardEmptyState>
    )
  if (!query.data.hasAccess)
    return (
      <DashboardEmptyState>{t('horseComparison.locked')}</DashboardEmptyState>
    )
  return <ComparisonResults {...props} records={query.data.records} />
}

export function ComparisonResults({
  records,
  selection,
  range,
  showOthers,
  onAround,
  onFit,
  stableId,
  horseId,
  sample = false,
  persistenceKey,
}: ResultProps & { records: Array<HorseComparisonRecord>; sample?: boolean }) {
  const t = useT()
  const { locale } = useLocale()
  const [selected, setSelected] =
    useAnalysisSessionState<TimeChartPoint | null>(
      persistenceKey ? `${persistenceKey}:selected` : undefined,
      null,
      decodeSelectedPoint,
      encodeSelectedPoint,
    )
  const plotRef = useRef<HTMLDivElement>(null)
  const inspectorRef = useRef<HTMLDivElement>(null)
  const data = createComparisonRows(
    records,
    selection,
    range,
    locale,
    showOthers,
  )
  const selectedRecords = data.records.filter((record) =>
    selected?.recordIds.includes(record.id),
  )
  const number = (value: number) =>
    formatDecimal(Math.round(value * 10) / 10, locale)
  const recordingDates = data.records.map((record) => record.date).sort()
  const recordingStart = recordingDates[0]
  const fitEnd = data.records
    .map((record) =>
      record.endUnknown ? range.end : (record.endDate ?? record.date),
    )
    .sort()
    .at(-1)
  if (data.records.length === 0)
    return (
      <DashboardEmptyState>
        <p>{t('horseComparison.noRecords')}</p>
        <p className="mt-2">{t('horseComparison.emptyHelp')}</p>
        <ButtonLink
          variant="outline"
          className="mt-4"
          to="/horses/$horseId"
          params={{ horseId }}
        >
          {t('horseComparison.openSource')}
        </ButtonLink>
      </DashboardEmptyState>
    )
  return (
    <div className="grid min-w-0 gap-4">
      {sample && (
        <p className="text-sm text-muted-foreground">
          {t('horseComparison.sample')}
        </p>
      )}
      {onFit &&
        recordingStart &&
        (recordingStart > range.start ||
          (fitEnd !== undefined && fitEnd < range.end)) && (
          <Button
            variant="ghost"
            size="sm"
            className="justify-self-start"
            onClick={() =>
              onFit({
                start:
                  recordingStart < range.start ? range.start : recordingStart,
                end: fitEnd && fitEnd < range.end ? fitEnd : range.end,
              })
            }
          >
            {t('horseComparison.fit')}
          </Button>
        )}
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div
          ref={plotRef}
          tabIndex={-1}
          className="min-w-0 scroll-mt-32 rounded-panel bg-[var(--analysis-surface)] p-3"
        >
          {selectedRecords.length > 0 && (
            <Button
              className="mb-3 lg:hidden"
              variant="outline"
              onClick={() => {
                inspectorRef.current?.scrollIntoView({ block: 'start' })
                inspectorRef.current?.focus({ preventScroll: true })
              }}
            >
              {t('horseComparison.inspectSelection', {
                count: selectedRecords.length,
              })}
            </Button>
          )}
          <TimeComparisonChart
            rows={data.rows}
            range={range}
            selectedId={selected?.id}
            focusedDate={selected?.date}
            clusterLabel={(count, start, end) =>
              t('horseComparison.nearbyRecords', {
                count,
                start: formatShortDateKey(start, locale),
                end: formatShortDateKey(end, locale),
              })
            }
            onSelect={setSelected}
            formatDate={(date) =>
              range.start.slice(0, 4) !== range.end.slice(0, 4)
                ? formatMediumDateKey(date, locale)
                : formatShortDateKey(date, locale)
            }
            minTickSpacing={
              range.start.slice(0, 4) !== range.end.slice(0, 4) ? 120 : 80
            }
            formatNumber={number}
            emptyLabel={t('horseComparison.noRecords')}
            axisLabel={t('horseComparison.calendarDate')}
            ariaLabel={t('horseComparison.title')}
          />
        </div>
        <div
          ref={inspectorRef}
          tabIndex={-1}
          className="grid min-w-0 scroll-mt-32 gap-3 border-t border-border-subtle pt-4 lg:sticky lg:top-24 lg:border-t-0 lg:pt-0"
          aria-live="polite"
        >
          <DashboardInlineHeader title={t('horseComparison.selected')} />
          <Button
            variant="ghost"
            className="justify-self-start lg:hidden"
            onClick={() => {
              plotRef.current?.scrollIntoView({ block: 'start' })
              plotRef.current?.focus({ preventScroll: true })
            }}
          >
            {t('horseComparison.backToChart')}
          </Button>
          {selectedRecords.length ? (
            <ScrollableList
              ariaLabel={t('horseComparison.selected')}
              itemCount={selectedRecords.length}
              visibleItemLimit={3}
              estimatedItemHeightRem={12}
            >
              {selectedRecords.map((record) => (
                <div className="grid min-w-0 gap-3 py-2" key={record.id}>
                  <p className="break-words font-medium">
                    {comparisonRecordLabel(record, locale)}
                  </p>
                  <DetailKeyValueList>
                    {record.originalUnit === 'lb' && (
                      <DetailKeyValueRow
                        label={t('horseComparison.recorded')}
                        value={`${number(record.originalValue!)} lb`}
                      />
                    )}
                    {record.status && record.kind !== 'training' && (
                      <DetailKeyValueRow
                        label={t('horseComparison.type')}
                        value={trainingStatusLabel(record.status, locale)}
                      />
                    )}
                    {record.endDate && (
                      <DetailKeyValueRow
                        label={t('horseComparison.end')}
                        value={formatMediumDateKey(record.endDate, locale)}
                      />
                    )}
                    {record.details?.map((field) => (
                      <DetailKeyValueRow
                        key={field.label}
                        className="flex-col items-start gap-1"
                        label={t(`horseComparison.fields.${field.label}`)}
                        value={field.value}
                      />
                    ))}
                  </DetailKeyValueList>
                  {record.notes && (
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {record.notes}
                    </p>
                  )}
                  {record.endUnknown && (
                    <p className="text-sm text-muted-foreground">
                      {t('horseComparison.openEnd')}
                    </p>
                  )}
                  {record.date < range.start && (
                    <p className="text-sm text-muted-foreground">
                      {t('horseComparison.continuesBefore')}
                    </p>
                  )}
                  {record.endDate && record.endDate > range.end && (
                    <p className="text-sm text-muted-foreground">
                      {t('horseComparison.continuesAfter')}
                    </p>
                  )}
                  <DashboardActions align="start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAround(record.date)}
                    >
                      {t('horseComparison.around')}
                    </Button>
                    {!sample && (
                      <SourceLink
                        record={record}
                        stableId={stableId}
                        horseId={horseId}
                      />
                    )}
                  </DashboardActions>
                </div>
              ))}
            </ScrollableList>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t('horseComparison.chooseRecord')}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-1 text-sm text-muted-foreground">
        <p>{t('horseComparison.evidence')}</p>
        {data.rows.some((row) => row.id === 'condition') && (
          <p>{t('horseComparison.conditionHelp')}</p>
        )}
        {data.rows.some((row) => row.id === 'health') && (
          <p>{t('horseComparison.recordedResolution')}</p>
        )}
        {data.rows.some((row) => row.id === 'medication') && (
          <p>{t('horseComparison.recordedCourse')}</p>
        )}
        {data.rows.some((row) => row.id === 'care') && (
          <p>{t('horseComparison.completedVisits')}</p>
        )}
      </div>
      <details className="min-w-0 border-t border-border-subtle pt-4">
        <summary className="app-disclosure-trigger cursor-pointer text-sm font-medium">
          {t('horseComparison.table')} ({data.records.length})
        </summary>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('horseComparison.date')}</TableHead>
              <TableHead>{t('horseComparison.type')}</TableHead>
              <TableHead>{t('horseComparison.value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  {formatMediumDateKey(record.date, locale)}
                </TableCell>
                <TableCell>
                  {t(`horseComparison.kinds.${record.kind}`)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSelected({
                        id: record.id,
                        date: record.date,
                        recordIds: [record.id],
                        label: comparisonRecordLabel(record, locale),
                      })
                    }
                  >
                    {comparisonRecordLabel(record, locale)}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!data.records.length && (
          <DashboardEmptyState>
            {t('horseComparison.noRecords')}
          </DashboardEmptyState>
        )}
      </details>
    </div>
  )
}

function SourceLink({
  record,
  horseId,
}: {
  record: HorseComparisonRecord
  stableId?: string
  horseId: string
}) {
  const t = useT()
  if (record.eventId)
    return (
      <ButtonLink
        variant="ghost"
        size="sm"
        to="/events/$eventId"
        params={{ eventId: record.eventId }}
        search={{
          date: record.kind === 'training' ? record.date : undefined,
          horseId,
        }}
      >
        {t('horseComparison.openSource')}
      </ButtonLink>
    )
  return (
    <ButtonLink
      variant="ghost"
      size="sm"
      to={
        record.kind === 'health'
          ? '/horses/$horseId/care'
          : '/horses/$horseId/nutrition'
      }
      params={{ horseId }}
      search={
        record.kind === 'health'
          ? { careView: 'health' }
          : record.kind === 'weight'
            ? { nutritionView: 'weight' }
            : record.kind === 'medication'
              ? { nutritionView: 'medication' }
              : {}
      }
    >
      {t('horseComparison.openSource')}
    </ButtonLink>
  )
}
