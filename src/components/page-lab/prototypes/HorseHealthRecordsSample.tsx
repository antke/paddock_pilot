import { memo, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Doc } from 'convex/_generated/dataModel'
import type { HorseDetailHorse } from '#/components/horses/HorseDetail'
import { HorseHealthIssuesCardView } from '#/components/horses/HorseHealthIssuesCard'
import { HorseMedicationRecordsCardView } from '#/components/horses/HorseMedicationRecordsCard'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { getTodayDateKey, formatDateKey } from '#/lib/dateDisplay'

type SampleProps = {
  horse: HorseDetailHorse
  onCreateActionChange?: (action: ReactNode) => void
}
type Kind = 'health' | 'medication'
export const HealthIssuesSample = memo(function HealthIssuesSampleView(
  props: SampleProps,
) {
  return <SampleControls key={props.horse._id} {...props} kind="health" />
})
export const MedicationRecordsSample = memo(
  function MedicationRecordsSampleView(props: SampleProps) {
    return <SampleControls key={props.horse._id} {...props} kind="medication" />
  },
)
function SampleControls(props: SampleProps & { kind: Kind }) {
  const [scenario, setScenario] = useState('populated')
  return (
    <div className="grid gap-5">
      <Field>
        <FieldLabel htmlFor={`${props.kind}-sample-state`}>
          Sample {props.kind} records
        </FieldLabel>
        <Select
          id={`${props.kind}-sample-state`}
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
        >
          <option value="populated">Populated</option>
          <option value="empty">Empty</option>
          <option value="viewer">Read-only</option>
        </Select>
      </Field>
      <LocalSample key={scenario} {...props} scenario={scenario} />
    </div>
  )
}
function LocalSample({
  horse,
  kind,
  scenario,
  onCreateActionChange,
}: SampleProps & { kind: Kind; scenario: string }) {
  const [outcome, setOutcome] = useState('success')
  const [delay, setDelay] = useState('150')
  const [pending, setPending] = useState(0)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const generation = useRef(0)
  const serial = useRef(0)
  useEffect(
    () => () => {
      generation.current += 1
    },
    [],
  )
  const common = {
    horseId: horse._id,
    stableId: horse.stableId,
    createdBy: horse.ownerId,
    _creationTime: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const [issues, setIssues] = useState<Array<Doc<'horseHealthIssues'>>>(() =>
    scenario === 'empty'
      ? []
      : ['Turnout follow-up', 'Hoof check', 'Resolved skin irritation'].map(
          (title, index) => ({
            ...common,
            _id: `sample-health-${index}` as Doc<'horseHealthIssues'>['_id'],
            title,
            description:
              'Sample care note. Discuss any changes with the named provider.',
            severity: index === 0 ? 'high' : 'medium',
            status: index === 2 ? 'resolved' : 'active',
            notedAt: Date.now(),
            resolvedAt: index === 2 ? Date.now() : undefined,
          }),
        ),
  )
  const [records, setRecords] = useState<Array<Doc<'horseMedicationRecords'>>>(
    () =>
      scenario === 'empty'
        ? []
        : [
            'Sample course A',
            'Sample course B',
            'Future sample course',
            'Completed sample course',
          ].map((medicationName, index) => ({
            ...common,
            _id: `sample-medication-${index}` as Doc<'horseMedicationRecords'>['_id'],
            medicationName,
            dosage: 'As prescribed',
            frequency: 'See prescription',
            startDate: offsetDate(index === 2 ? 4 : -7),
            endDate: index === 3 ? getTodayDateKey() : offsetDate(10),
            status: index === 3 ? 'completed' : 'active',
            reason: 'Illustrative record',
            notes: 'Sample data only; not treatment instructions.',
          })),
  )
  const apply = async (description: string, update: () => void) => {
    const current = generation.current
    setPending((count) => count + 1)
    setFailed(false)
    setMessage('Sample request pending. No change has been applied yet.')
    try {
      await new Promise((resolve) => setTimeout(resolve, Number(delay)))
      if (generation.current !== current) throw new Error('Sample changed')
      if (outcome === 'failure') {
        setOutcome('success')
        setFailed(true)
        setMessage(
          'Sample request failed. Your data is unchanged; retry the action.',
        )
        throw new Error('Sample failure')
      }
      update()
      setMessage(`${description} applied locally. No live records changed.`)
    } finally {
      if (generation.current === current) setPending((count) => count - 1)
    }
  }
  return (
    <>
      <p className="text-sm text-muted-foreground">
        Sample {kind} records. All actions affect this preview only.
      </p>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor={`${kind}-sample-outcome`}>
            Next sample result
          </FieldLabel>
          <Select
            id={`${kind}-sample-outcome`}
            value={outcome}
            disabled={pending > 0}
            onChange={(e) => setOutcome(e.target.value)}
          >
            <option value="success">Success</option>
            <option value="failure">Failure, then retry</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${kind}-sample-delay`}>
            Sample response time
          </FieldLabel>
          <Select
            id={`${kind}-sample-delay`}
            value={delay}
            disabled={pending > 0}
            onChange={(e) => setDelay(e.target.value)}
          >
            <option value="150">Quick response</option>
            <option value="3000">3 seconds — inspect pending</option>
          </Select>
        </Field>
      </FieldGrid>
      {message && (
        <p
          role={failed ? 'alert' : 'status'}
          className={
            failed ? 'text-sm text-destructive' : 'text-sm text-foreground'
          }
        >
          {message}
        </p>
      )}
      {kind === 'health' ? (
        <HorseHealthIssuesCardView
          horse={horse}
          issues={issues}
          canManage={scenario !== 'viewer'}
          onCreateActionChange={onCreateActionChange}
          onAdd={(values) =>
            apply('Sample health issue', () =>
              setIssues((items) => [
                {
                  ...common,
                  ...values,
                  _id: `sample-added-health-${++serial.current}` as Doc<'horseHealthIssues'>['_id'],
                  status: 'active',
                  notedAt: Date.now(),
                },
                ...items,
              ]),
            )
          }
          onResolve={(issue) =>
            apply('Sample resolution', () =>
              setIssues((items) =>
                items.map((item) =>
                  item._id === issue._id
                    ? { ...item, status: 'resolved', resolvedAt: Date.now() }
                    : item,
                ),
              ),
            )
          }
          onRemove={(issue) =>
            apply('Sample removal', () =>
              setIssues((items) =>
                items.filter((item) => item._id !== issue._id),
              ),
            )
          }
        />
      ) : (
        <HorseMedicationRecordsCardView
          horse={horse}
          records={records}
          canManage={scenario !== 'viewer'}
          onCreateActionChange={onCreateActionChange}
          onAdd={(values) =>
            apply('Sample medication', () =>
              setRecords((items) => [
                {
                  ...common,
                  ...values,
                  _id: `sample-added-medication-${++serial.current}` as Doc<'horseMedicationRecords'>['_id'],
                },
                ...items,
              ]),
            )
          }
          onComplete={(record) =>
            apply('Sample completion', () =>
              setRecords((items) =>
                items.map((item) =>
                  item._id === record._id
                    ? {
                        ...item,
                        status: 'completed',
                        endDate: getTodayDateKey(),
                      }
                    : item,
                ),
              ),
            )
          }
          onRemove={(record) =>
            apply('Sample removal', () =>
              setRecords((items) =>
                items.filter((item) => item._id !== record._id),
              ),
            )
          }
        />
      )}
    </>
  )
}
function offsetDate(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDateKey(date)
}
