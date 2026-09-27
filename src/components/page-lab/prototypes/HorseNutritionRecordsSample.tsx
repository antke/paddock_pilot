import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { HorseDetailHorse } from '#/components/horses/HorseDetail'
import type { HorseDetailCreateActionChange } from '#/components/horses/useHorseDetailCreateAction'
import { HorseWeightRecordsView } from '#/components/horses/HorseWeightRecordsCard'
import { HorseNutritionLogsView } from '#/components/horses/HorseNutritionLogsCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { Button } from '#/components/ui/button'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { compareWeightRecordsNewestFirst } from 'shared/horses/weightRecordOrder'
import { dateKeyToTimestamp, formatDateKey } from '#/lib/dateDisplay'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import type { WeightRecordFormSchema } from 'shared/horses/weightRecordSchema'
import type { NutritionLogFormSchema } from 'shared/horses/nutritionLogSchema'

type SampleProps = {
  horse: HorseDetailHorse
  onCreateActionChange?: HorseDetailCreateActionChange
}

const sampleDate = (daysAgo: number) =>
  dateKeyToTimestamp(formatDateKey(new Date(2026, 8, 18 - daysAgo)))

function weightSamples(
  horse: HorseDetailHorse,
  count = 3,
): Array<Doc<'horseWeightRecords'>> {
  return Array.from({ length: count }, (_, index) => ({
    _id: `sample-weight-${index}` as Id<'horseWeightRecords'>,
    _creationTime: 0,
    horseId: horse._id,
    stableId: horse.stableId,
    createdBy: horse.ownerId,
    createdAt: sampleDate(index),
    measuredAt: sampleDate(index * 7),
    weight: index % 2 ? 1100 + index : 500 + index,
    unit: index % 2 ? 'lb' : 'kg',
    bodyConditionScore: index % 2 ? undefined : 5,
    notes:
      index === 0
        ? 'Sample weighbridge reading. Fictional values for interface review.'
        : 'Sample tape measurement; compare method before interpreting changes.',
  }))
}
function nutritionSamples(
  horse: HorseDetailHorse,
  count = 2,
): Array<Doc<'horseNutritionLogs'>> {
  return Array.from({ length: count }, (_, index) => ({
    _id: `sample-nutrition-${index}` as Id<'horseNutritionLogs'>,
    _creationTime: 0,
    horseId: horse._id,
    stableId: horse.stableId,
    createdBy: horse.ownerId,
    createdAt: sampleDate(index),
    changedAt: sampleDate(index * 7),
    summary:
      index === 0
        ? 'Sample autumn feeding review'
        : `Sample historical feeding review ${index + 1}`,
    feedingRoutineSnapshot:
      'Fictional historical routine for testing. This record does not update the current feeding plan.',
    recommendedSnapshot: [
      'Sample forage note',
      'Sample water access note',
      'A longer sample monitoring note to check wrapping and list readability on narrow screens',
    ],
    avoidSnapshot: index % 2 ? [] : ['Sample avoid item'],
    notes: 'Sample history only; not feeding advice.',
  }))
}

function useSampleRequests() {
  const [pending, setPending] = useState(0)
  const [outcome, setOutcome] = useState('success')
  const outcomeRef = useRef('success')
  const [duration, setDuration] = useState('1200')
  const durationRef = useRef('1200')
  const [message, setMessage] = useState(
    'Sample records only. Requests update this preview; no live horse record or current feeding plan will change.',
  )
  const epoch = useRef(0)
  useEffect(() => {
    epoch.current += 1
    return () => {
      epoch.current += 1
    }
  }, [])
  const simulate = useCallback(
    async (apply: () => void, successMessage: string) => {
      const requestEpoch = epoch.current
      const nextOutcome = outcomeRef.current
      outcomeRef.current = 'success'
      setOutcome('success')
      setPending((count) => count + 1)
      setMessage('Sample request pending. No change has been applied yet.')
      try {
        await new Promise((resolve) =>
          window.setTimeout(resolve, Number(durationRef.current)),
        )
        if (requestEpoch !== epoch.current)
          throw new Error('Sample changed before completion')
        if (nextOutcome === 'failure') {
          setMessage(
            'Sample request failed. No record changed. The next attempt will succeed.',
          )
          throw new Error('Sample rejected request')
        }
        apply()
        setMessage(successMessage)
      } finally {
        if (requestEpoch === epoch.current) setPending((count) => count - 1)
      }
    },
    [],
  )
  return {
    pending,
    outcome,
    setOutcome: (value: string) => {
      outcomeRef.current = value
      setOutcome(value)
    },
    duration,
    setDuration: (value: string) => {
      durationRef.current = value
      setDuration(value)
    },
    message,
    setMessage,
    simulate,
  }
}

function SampleControls({
  state,
  canManage,
  onPermissionChange,
  onEmpty,
  onReset,
  onMany,
}: {
  state: ReturnType<typeof useSampleRequests>
  canManage: boolean
  onPermissionChange: (value: boolean) => void
  onEmpty: () => void
  onReset: () => void
  onMany: () => void
}) {
  const id = useId()
  return (
    <DashboardInlinePanel chrome="flat" padding="none" stack="default">
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor={`${id}-outcome`}>Next sample request</FieldLabel>
          <Select
            id={`${id}-outcome`}
            value={state.outcome}
            disabled={state.pending > 0}
            onChange={(event) => state.setOutcome(event.target.value)}
          >
            <option value="success">Success</option>
            <option value="failure">Failure, then retry</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-duration`}>
            Sample response time
          </FieldLabel>
          <Select
            id={`${id}-duration`}
            value={state.duration}
            disabled={state.pending > 0}
            onChange={(event) => state.setDuration(event.target.value)}
          >
            <option value="100">0.1 seconds</option>
            <option value="1200">1.2 seconds</option>
            <option value="6000">6 seconds — inspect pending state</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-access`}>Sample permissions</FieldLabel>
          <Select
            id={`${id}-access`}
            value={canManage ? 'manager' : 'viewer'}
            disabled={state.pending > 0}
            onChange={(event) =>
              onPermissionChange(event.target.value === 'manager')
            }
          >
            <option value="manager">Manage records</option>
            <option value="viewer">View only</option>
          </Select>
        </Field>
      </FieldGrid>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={state.pending > 0}
          onClick={onEmpty}
        >
          Show empty sample
        </Button>
        <Button
          variant="outline"
          disabled={state.pending > 0}
          onClick={onReset}
        >
          Reset sample records
        </Button>
        <Button variant="outline" disabled={state.pending > 0} onClick={onMany}>
          Show long history
        </Button>
      </div>
      <p role="status">{state.message}</p>
    </DashboardInlinePanel>
  )
}

export function WeightRecordsSample(props: SampleProps) {
  const sampleMode = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sampleMode)
    return (
      <DashboardEmptyState>
        Weight samples require development sample data.
      </DashboardEmptyState>
    )
  return <LocalWeightRecords key={props.horse._id} {...props} />
}
function LocalWeightRecords({ horse, onCreateActionChange }: SampleProps) {
  const [records, setRecords] = useState(() => weightSamples(horse))
  const [canManage, setCanManage] = useState(true)
  const [revision, setRevision] = useState(0)
  const nextId = useRef(0)
  const state = useSampleRequests()
  const { simulate } = state
  const onAdd = useCallback(
    (values: WeightRecordFormSchema) =>
      simulate(() => {
        const now = Date.now()
        const record: Doc<'horseWeightRecords'> = {
          _id: `sample-weight-new-${++nextId.current}` as Id<'horseWeightRecords'>,
          _creationTime: now,
          horseId: horse._id,
          stableId: horse.stableId,
          createdBy: horse.ownerId,
          createdAt: now,
          weight: values.weight,
          unit: values.unit,
          measuredAt: dateKeyToTimestamp(values.measuredDate),
          bodyConditionScore: values.bodyConditionScore,
          notes: values.notes,
        }
        setRecords((current) =>
          [record, ...current].sort(compareWeightRecordsNewestFirst),
        )
      }, 'Weight record added to this sample only.'),
    [simulate, horse._id, horse.stableId, horse.ownerId],
  )
  const onRemove = useCallback(
    (record: Doc<'horseWeightRecords'>) =>
      simulate(
        () =>
          setRecords((current) =>
            current.filter((item) => item._id !== record._id),
          ),
        'Weight record removed from this sample only.',
      ),
    [simulate],
  )
  const reset = (count: number) => {
    setRecords(weightSamples(horse, count))
    setRevision((value) => value + 1)
    state.setMessage(
      `${count} sample weight records loaded. No live record changed.`,
    )
  }
  return (
    <>
      <SampleControls
        state={state}
        canManage={canManage}
        onPermissionChange={setCanManage}
        onEmpty={() => reset(0)}
        onReset={() => reset(3)}
        onMany={() => reset(30)}
      />
      <HorseWeightRecordsView
        key={revision}
        horse={horse}
        records={records}
        canManage={canManage}
        onAdd={onAdd}
        onRemove={onRemove}
        onCreateActionChange={onCreateActionChange}
      />
    </>
  )
}

export function NutritionLogsSample(props: SampleProps) {
  const sampleMode = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sampleMode)
    return (
      <DashboardEmptyState>
        Nutrition samples require development sample data.
      </DashboardEmptyState>
    )
  return <LocalNutritionLogs key={props.horse._id} {...props} />
}
function LocalNutritionLogs({ horse, onCreateActionChange }: SampleProps) {
  const [logs, setLogs] = useState(() => nutritionSamples(horse))
  const [canManage, setCanManage] = useState(true)
  const [revision, setRevision] = useState(0)
  const nextId = useRef(0)
  const state = useSampleRequests()
  const { simulate } = state
  const onAdd = useCallback(
    (values: NutritionLogFormSchema) =>
      simulate(() => {
        const now = Date.now()
        const log: Doc<'horseNutritionLogs'> = {
          _id: `sample-nutrition-new-${++nextId.current}` as Id<'horseNutritionLogs'>,
          _creationTime: now,
          horseId: horse._id,
          stableId: horse.stableId,
          createdBy: horse.ownerId,
          createdAt: now,
          changedAt: dateKeyToTimestamp(values.changedDate),
          summary: values.summary,
          feedingRoutineSnapshot: values.feedingRoutineSnapshot,
          recommendedSnapshot: values.recommendedSnapshot,
          avoidSnapshot: values.avoidSnapshot,
          notes: values.notes,
        }
        setLogs((current) =>
          [log, ...current].sort((a, b) => b.changedAt - a.changedAt),
        )
      }, 'History snapshot added locally. The horse’s current feeding plan is unchanged.'),
    [simulate, horse._id, horse.stableId, horse.ownerId],
  )
  const onRemove = useCallback(
    (log: Doc<'horseNutritionLogs'>) =>
      simulate(
        () =>
          setLogs((current) => current.filter((item) => item._id !== log._id)),
        'Nutrition history entry removed from this sample only.',
      ),
    [simulate],
  )
  const reset = (count: number) => {
    setLogs(nutritionSamples(horse, count))
    setRevision((value) => value + 1)
    state.setMessage(
      `${count} sample nutrition history entries loaded. Current feeding plan unchanged.`,
    )
  }
  return (
    <>
      <SampleControls
        state={state}
        canManage={canManage}
        onPermissionChange={setCanManage}
        onEmpty={() => reset(0)}
        onReset={() => reset(2)}
        onMany={() => reset(12)}
      />
      <HorseNutritionLogsView
        key={revision}
        horse={horse}
        logs={logs}
        canManage={canManage}
        onAdd={onAdd}
        onRemove={onRemove}
        onCreateActionChange={onCreateActionChange}
      />
    </>
  )
}
