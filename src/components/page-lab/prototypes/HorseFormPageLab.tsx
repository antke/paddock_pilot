import { useEffect, useId, useRef, useState } from 'react'
import type {
  DashboardLabData,
  DashboardLabHorse,
} from '#/components/dashboard-lab/dashboardLabTypes'
import type { Id } from 'convex/_generated/dataModel'
import { HorseProfileForm } from '#/components/horses/HorseProfileForm'
import { HorseDeletionActionsView } from '#/components/horses/HorseDeletionActions'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { Button } from '#/components/ui/button'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'

type SampleResult = 'success' | 'upload' | 'save' | 'open' | 'delete' | 'return'

export function HorseFormPageLab({ data }: { data: DashboardLabData }) {
  const [mode, setMode] = useState<'create' | 'edit'>(
    data.horses[0] ? 'edit' : 'create',
  )
  const [revision, setRevision] = useState(0)
  const modeId = useId()
  return (
    <div className="grid gap-6">
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor={modeId}>Sample form</FieldLabel>
          <Select
            id={modeId}
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as 'create' | 'edit')
            }
          >
            <option value="create">Add a horse</option>
            <option value="edit">Edit a horse</option>
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
      {mode === 'edit' && !data.horses[0] ? (
        <DashboardEmptyState>
          No horse is available for this sample form. Choose Add a horse to try
          an empty form.
        </DashboardEmptyState>
      ) : (
        <SampleHorseForm
          key={
            mode +
            ':' +
            data.stable._id +
            ':' +
            data.horses[0]?._id +
            ':' +
            revision
          }
          mode={mode}
          horse={data.horses[0]}
        />
      )}
    </div>
  )
}

function SampleHorseForm({
  mode,
  horse,
}: {
  mode: 'create' | 'edit'
  horse?: DashboardLabHorse
}) {
  const [result, setResult] = useState<SampleResult>('success')
  const resultRef = useRef<SampleResult>('success')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [removed, setRemoved] = useState(false)
  const [message, setMessage] = useState<string>()
  const [returned, setReturned] = useState(false)
  const resultId = useId()
  const timers = useRef(new Map<ReturnType<typeof setTimeout>, () => void>())
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    const active = timers.current
    return () => {
      alive.current = false
      active.forEach((cancel, timer) => {
        clearTimeout(timer)
        cancel()
      })
      active.clear()
    }
  }, [])
  const stage = (name: Exclude<SampleResult, 'success'>) =>
    new Promise<void>((resolve, reject) => {
      const fail = resultRef.current === name
      if (fail) {
        resultRef.current = 'success'
        setResult('success')
      }
      setMessage('Sample ' + name + ' pending. No live record is changing.')
      const timer = setTimeout(() => {
        timers.current.delete(timer)
        if (!alive.current) {
          reject(new Error('Sample interrupted'))
          return
        }
        if (fail) {
          setMessage(undefined)
          reject(new Error('Sample ' + name + ' failed'))
        } else {
          setMessage(undefined)
          resolve()
        }
      }, 700)
      timers.current.set(timer, () => reject(new Error('Sample interrupted')))
    })
  const sampleHorseId = (horse?._id ?? 'sample-new-horse') as Id<'horses'>
  return (
    <div className="grid gap-6">
      <Field>
        <FieldLabel htmlFor={resultId}>Next sample result</FieldLabel>
        <Select
          id={resultId}
          value={result}
          disabled={saving || deleting}
          onChange={(event) => {
            const next = event.target.value as SampleResult
            resultRef.current = next
            setResult(next)
          }}
        >
          <option value="success">Succeed locally</option>
          <option value="upload">Photo upload fails once</option>
          <option value="save">Save fails once</option>
          <option value="open">
            Save succeeds; opening profile fails once
          </option>
          {mode === 'edit' && (
            <>
              <option value="delete">Move horse fails once</option>
              <option value="return">
                Move succeeds; returning to horses fails once
              </option>
            </>
          )}
        </Select>
      </Field>
      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
      {returned ? (
        <DashboardEmptyState>
          The sample returned to the horse list. No live horse was deleted.
        </DashboardEmptyState>
      ) : (
        <>
          <HorseProfileForm
            mode={mode}
            initialValues={mode === 'edit' ? horse : undefined}
            disabled={deleting || removed}
            onPendingChange={setSaving}
            sampleNotice={
              <p className="text-sm text-muted-foreground">
                Sample record · Local-only preview. Photos, saves and deletion
                are simulated. No file is uploaded and no live horse is changed.
                Restart or switch forms to test interruption.
              </p>
            }
            uploadImage={async () => {
              await stage('upload')
              return 'sample-photo' as Id<'_storage'>
            }}
            save={async () => {
              await stage('save')
              return sampleHorseId
            }}
            onSaved={async () => {
              await stage('open')
              setMessage(
                'Sample profile opened locally. No live route was followed.',
              )
            }}
          />
          {mode === 'edit' && horse && (
            <HorseDeletionActionsView
              horse={horse}
              disabled={saving}
              onPendingChange={setDeleting}
              onAcknowledged={() => setRemoved(true)}
              onDelete={async () => {
                await stage('delete')
              }}
              onDeleted={async () => {
                await stage('return')
                setReturned(true)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
