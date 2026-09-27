import { useEffect, useRef, useState } from 'react'
import type { Id } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { StableProfileForm } from '#/components/stables/StableProfileForm'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { Button } from '#/components/ui/button'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

type SampleMode = 'create' | 'edit'

export function StableFormPageLab({ data }: { data: DashboardLabData }) {
  const sampleMode = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sampleMode)
    return (
      <DashboardEmptyState>
        Stable form samples require development sample data.
      </DashboardEmptyState>
    )
  return <StableFormSample key={data.stable._id} data={data} />
}

function StableFormSample({ data }: { data: DashboardLabData }) {
  const [mode, setMode] = useState<SampleMode>('edit')
  const [revision, setRevision] = useState(0)
  return (
    <div className="grid gap-6">
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor="stable-form-sample-mode">Sample form</FieldLabel>
          <Select
            id="stable-form-sample-mode"
            value={mode}
            onChange={(event) => setMode(event.target.value as SampleMode)}
          >
            <option value="edit">Edit the sample stable</option>
            <option value="create">Create a stable from empty fields</option>
          </Select>
        </Field>
        <Button
          type="button"
          variant="outline"
          onClick={() => setRevision((current) => current + 1)}
        >
          Restart sample
        </Button>
      </FieldGrid>
      <LocalStableForm key={`${mode}-${revision}`} data={data} mode={mode} />
    </div>
  )
}

function LocalStableForm({
  data,
  mode,
}: {
  data: DashboardLabData
  mode: SampleMode
}) {
  const [outcome, setOutcome] = useState('success')
  const [delay, setDelay] = useState('150')
  const [pending, setPending] = useState(false)
  const [finished, setFinished] = useState(false)
  const cancellations = useRef(new Set<() => void>())
  useEffect(() => {
    const active = cancellations.current
    return () => {
      for (const cancel of active) cancel()
    }
  }, [])
  const wait = async (phase: 'save' | 'continue') => {
    const fail =
      outcome === (phase === 'save' ? 'failure' : 'continuation-failure')
    if (fail) setOutcome('success')
    await new Promise<void>((resolve, reject) => {
      const cancel = () => {
        clearTimeout(timer)
        cancellations.current.delete(cancel)
        reject(new DOMException('Sample cancelled', 'AbortError'))
      }
      const timer = setTimeout(() => {
        cancellations.current.delete(cancel)
        resolve()
      }, Number(delay))
      cancellations.current.add(cancel)
    })
    if (fail) throw new Error('Sample operation failed')
  }
  return (
    <div className="grid gap-6">
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor="stable-sample-outcome">
            Next sample result
          </FieldLabel>
          <Select
            id="stable-sample-outcome"
            value={outcome}
            disabled={pending}
            onChange={(event) => setOutcome(event.target.value)}
          >
            <option value="success">Success</option>
            <option value="failure">Failure, then retry</option>
            <option value="continuation-failure">
              Save succeeds; opening fails once
            </option>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="stable-sample-delay">
            Sample response time
          </FieldLabel>
          <Select
            id="stable-sample-delay"
            value={delay}
            disabled={pending}
            onChange={(event) => setDelay(event.target.value)}
          >
            <option value="150">Quick response</option>
            <option value="3000">3 seconds — inspect pending state</option>
          </Select>
        </Field>
      </FieldGrid>
      {finished ? (
        <DashboardEmptyState title="Sample continuation complete">
          {mode === 'create'
            ? 'The real app would now open stable setup.'
            : 'The real app would now open the stable overview.'}{' '}
          No live stable was saved or navigation performed. Restart the sample
          to edit again.
        </DashboardEmptyState>
      ) : (
        <StableProfileForm
          mode={mode}
          initialValues={mode === 'edit' ? data.stable : undefined}
          onPendingChange={setPending}
          sampleNotice={
            <p className="text-sm text-muted-foreground">
              Sample stable · Local-only preview. Changes are not saved to a
              live stable.
            </p>
          }
          save={async () => {
            await wait('save')
            return mode === 'edit'
              ? data.stable._id
              : ('sample-created-stable' as Id<'stables'>)
          }}
          onSaved={async () => {
            await wait('continue')
            setFinished(true)
          }}
        />
      )}
    </div>
  )
}
