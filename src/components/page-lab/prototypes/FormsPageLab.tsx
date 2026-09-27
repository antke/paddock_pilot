import { useEffect, useId, useRef, useState } from 'react'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { EventEditor } from '#/components/forms/event/EventEditor'
import {
  createEventEditorValues,
  editEventEditorValues,
} from '#/components/forms/event/eventEditorValues'
import { Button } from '#/components/ui/button'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

const fixtureProviders = [
  {
    _id: 'lab-provider-vet' as Id<'stableProviders'>,
    type: 'vet' as const,
    name: 'Dr. Halley Morse',
    phone: '(555) 014-3300',
  },
  {
    _id: 'lab-provider-farrier' as Id<'stableProviders'>,
    type: 'farrier' as const,
    name: 'Ben Carter',
    phone: '(555) 014-1902',
  },
]

type SampleMode = 'create' | 'edit' | 'recurring'
type SampleOutcome = 'success' | 'save' | 'open'

export function FormsPageLab({ data }: { data: DashboardLabData }) {
  const sampleMode = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sampleMode) {
    return (
      <DashboardEmptyState>
        Event form simulations are available only with development sample data.
      </DashboardEmptyState>
    )
  }
  return <SampleControls key={data.stable._id} data={data} />
}

function SampleControls({ data }: { data: DashboardLabData }) {
  const [mode, setMode] = useState<SampleMode>('edit')
  const [revision, setRevision] = useState(0)
  const modeId = useId()
  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground">
        Sample event · Local-only preview of the production editor. Creating,
        updating and opening an event are simulated; no live event is changed.
      </p>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor={modeId}>Sample form</FieldLabel>
          <Select
            id={modeId}
            value={mode}
            onChange={(event) => setMode(event.target.value as SampleMode)}
          >
            <option value="edit">Edit a sample event</option>
            <option value="create">Create an event from empty fields</option>
            <option value="recurring">Edit a recurring event</option>
          </Select>
        </Field>
        <Button
          type="button"
          variant="outline"
          onClick={() => setRevision((value) => value + 1)}
        >
          Restart sample
        </Button>
      </FieldGrid>
      <LocalEventEditor key={mode + ':' + revision} data={data} mode={mode} />
    </div>
  )
}

function LocalEventEditor({
  data,
  mode,
}: {
  data: DashboardLabData
  mode: SampleMode
}) {
  const [outcome, setOutcome] = useState<SampleOutcome>('success')
  const outcomeRef = useRef<SampleOutcome>('success')
  const [delay, setDelay] = useState('150')
  const [pending, setPending] = useState(false)
  const outcomeId = useId()
  const delayId = useId()
  const timers = useRef(new Map<ReturnType<typeof setTimeout>, () => void>())
  useEffect(() => {
    const active = timers.current
    return () => {
      active.forEach((cancel, timer) => {
        clearTimeout(timer)
        cancel()
      })
      active.clear()
    }
  }, [])

  const stage = (name: 'save' | 'open') =>
    new Promise<void>((resolve, reject) => {
      const fail = outcomeRef.current === name
      if (fail) {
        outcomeRef.current = 'success'
        setOutcome('success')
      }
      const timer = setTimeout(() => {
        timers.current.delete(timer)
        if (fail) reject(new Error('Sample ' + name + ' failed'))
        else resolve()
      }, Number(delay))
      timers.current.set(timer, () => reject(new Error('Sample interrupted')))
    })
  const sampleEvent: Doc<'events'> = {
    _id: 'lab-event-editor' as Id<'events'>,
    _creationTime: 0,
    stableId: data.stable._id,
    createdBy: data.stable.ownerId,
    horseIds: data.horses[0] ? [data.horses[0]._id] : [],
    title: 'Summer shoeing visit',
    type: 'hoof_trimming',
    date: '2026-07-24',
    time: '10:30',
    location: 'Main yard',
    providerName: 'Ben Carter',
    providerPhone: '(555) 014-1902',
    totalCost: 240,
    costPerHorse: 80,
    status: 'planned',
    recurrence:
      mode === 'recurring'
        ? {
            frequency: 'monthly',
            interval: 2,
            monthlyMode: 'weekdayPattern',
            ordinal: 'last',
            weekday: 5,
            end: { type: 'after_occurrences', count: 6 },
          }
        : undefined,
  }

  return (
    <div className="grid gap-6">
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor={outcomeId}>Next sample result</FieldLabel>
          <Select
            id={outcomeId}
            value={outcome}
            disabled={pending}
            onChange={(event) => {
              outcomeRef.current = event.target.value as SampleOutcome
              setOutcome(outcomeRef.current)
            }}
          >
            <option value="success">Success</option>
            <option value="save">Save fails once</option>
            <option value="open">Save succeeds, opening fails once</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={delayId}>Sample response time</FieldLabel>
          <Select
            id={delayId}
            value={delay}
            disabled={pending}
            onChange={(event) => setDelay(event.target.value)}
          >
            <option value="150">Quick response</option>
            <option value="3000">3 seconds per phase</option>
          </Select>
        </Field>
      </FieldGrid>
      <EventEditor
        mode={mode === 'create' ? 'create' : 'edit'}
        initialValues={
          mode === 'create'
            ? createEventEditorValues(data.stable._id)
            : editEventEditorValues(sampleEvent, [])
        }
        horses={data.horses}
        providers={fixtureProviders}
        onPendingChange={setPending}
        onSave={async () => {
          await stage('save')
          return sampleEvent._id
        }}
        onSaved={async () => {
          await stage('open')
        }}
        completionMessage="Sample changes applied locally. Opening was simulated; no live event was saved."
      />
    </div>
  )
}
