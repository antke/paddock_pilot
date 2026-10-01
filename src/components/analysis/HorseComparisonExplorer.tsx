import { useId, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
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
  stableId: string
  sampleRecords?: Array<HorseComparisonRecord>
  today?: string
}

export function HorseComparisonExplorer({
  horseId,
  stableId,
  sampleRecords,
  today = getTodayDateKey(),
}: ExplorerProps) {
  const t = useT()
  const id = useId()
  const [selection, setSelection] = useState<HorseComparisonSelection>(
    horseComparisonPresets.weightTraining,
  )
  const [period, setPeriod] = useState('90')
  const [range, setRange] = useState<ComparisonRange>(() => ({
    start: shiftDate(today, -89),
    end: today,
  }))
  const [showOthers, setShowOthers] = useState(false)
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
    selection,
    range,
    showOthers,
    onAround: (date: string) => {
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
      title={t('horseComparison.title')}
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
      <FieldLabel className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={showOthers}
          onCheckedChange={(checked) => setShowOthers(checked === true)}
        />
        {t('horseComparison.showOtherTraining')}
      </FieldLabel>
      {!invalid &&
        (sampleRecords !== undefined ? (
          <ComparisonResults
            key={`${range.start}:${range.end}:${JSON.stringify(selection)}:${showOthers}`}
            {...resultProps}
            records={sampleRecords}
            sample
          />
        ) : (
          <LiveComparisonResults
            key={`${range.start}:${range.end}:${JSON.stringify(selection)}:${showOthers}`}
            {...resultProps}
          />
        ))}
    </DashboardSection>
  )
}

type ResultProps = {
  horseId: string
  stableId: string
  selection: HorseComparisonSelection
  range: ComparisonRange
  showOthers: boolean
  onAround: (date: string) => void
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
  stableId,
  horseId,
  sample = false,
}: ResultProps & { records: Array<HorseComparisonRecord>; sample?: boolean }) {
  const t = useT()
  const { locale } = useLocale()
  const [selected, setSelected] = useState<TimeChartPoint | null>(null)
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
  const weights = data.records.filter(
    (record) => record.kind === 'weight' && record.value !== undefined,
  )
  const first = weights[0],
    last = weights.at(-1)
  const measuredSessions = data.completed.filter(
    (record) => record.durationMinutes !== undefined,
  )
  return (
    <div className="grid min-w-0 gap-4">
      {sample && (
        <p className="text-sm text-muted-foreground">
          {t('horseComparison.sample')}
        </p>
      )}
      <DashboardMetaList>
        {first && last && (
          <span>
            {t('horseComparison.weightSummary', {
              count: weights.length,
              first: number(first.value!),
              last: number(last.value!),
              start: formatMediumDateKey(first.date, locale),
              end: formatMediumDateKey(last.date, locale),
            })}
          </span>
        )}
        {data.hasTraining && (
          <span>
            {t('horseComparison.totals', {
              count: data.completed.length,
              minutes: number(
                measuredSessions.reduce(
                  (sum, record) => sum + record.durationMinutes!,
                  0,
                ),
              ),
            })}
          </span>
        )}
      </DashboardMetaList>
      <TimeComparisonChart
        rows={data.rows}
        range={range}
        selectedId={selected?.id}
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
      <div className="grid gap-1 text-sm text-muted-foreground">
        <p>{t('horseComparison.evidence')}</p>
        {data.hasTraining && (
          <p>
            {t('horseComparison.coverage', {
              recorded: measuredSessions.length,
              total: data.completed.length,
            })}
          </p>
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
      <div
        className="grid min-w-0 gap-3 border-t border-border-subtle pt-4"
        aria-live="polite"
      >
        <DashboardInlineHeader title={t('horseComparison.selected')} />
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
      <details className="min-w-0 border-t border-border-subtle pt-4">
        <summary className="cursor-pointer text-sm font-medium">
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
  stableId,
  horseId,
}: {
  record: HorseComparisonRecord
  stableId: string
  horseId: string
}) {
  const t = useT()
  if (record.eventId)
    return (
      <ButtonLink
        variant="ghost"
        size="sm"
        to={
          record.kind === 'training'
            ? '/stables/$stableId/training/$eventId'
            : '/stables/$stableId/events/$eventId'
        }
        params={{ stableId, eventId: record.eventId }}
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
          ? '/stables/$stableId/horses/$horseId/care'
          : '/stables/$stableId/horses/$horseId/nutrition'
      }
      params={{ stableId, horseId }}
      search={record.kind === 'health' ? { careView: 'health' } : {}}
    >
      {t('horseComparison.openSource')}
    </ButtonLink>
  )
}
