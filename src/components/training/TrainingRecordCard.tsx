import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import { InlineForm } from '#/components/forms/FormLayout'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import {
  trainingFormatLabels,
  trainingRecordSchema,
  trainingStatusLabels,
} from 'shared/training/trainingSchema'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Field, FieldLabel } from '#/components/ui/field'
import { Button } from '#/components/ui/button'
import { Select } from '#/components/ui/select'
import { Textarea } from '#/components/ui/textarea'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { TrainingFormFields } from './TrainingFormFields'
import { TrainingActivityTag, TrainingStatusBadge } from './TrainingBadges'
import { editEventEditorValues } from '#/components/forms/event/eventEditorValues'
import type {
  EventFormInput,
  EventFormSchema,
} from '#/components/forms/event/eventFormSchema'
import type { TrainingEntry } from './trainingCalendarData'

export function TrainingRecordCard({ entry }: { entry: TrainingEntry }) {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const { horse, details, record, status } = entry
  return (
    <DashboardSectionCard
      title={horse.name}
      badges={<TrainingStatusBadge status={status} />}
      actions={
        horse.canRecord && !editing ? (
          <Button
            variant="outline"
            onClick={() => {
              setEditing(true)
              setSaved(false)
            }}
          >
            {record ? 'Update training record' : 'Record training'}
          </Button>
        ) : undefined
      }
    >
      {editing ? (
        <TrainingRecordEditor
          entry={entry}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            setSaved(true)
          }}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {details.activities.map((activity) => (
              <TrainingActivityTag key={activity} activity={activity} />
            ))}
          </div>
          <DashboardMetaList size="sm" separator="dot" gap="compact">
            <span>{trainingFormatLabels[details.format]}</span>
            {details.durationMinutes && (
              <span className="tabular-nums">
                {details.durationMinutes} minutes
              </span>
            )}
            {details.rider && <span>Rider: {details.rider}</span>}
          </DashboardMetaList>
          <dl className="grid max-w-prose gap-5 text-sm leading-6 [overflow-wrap:anywhere]">
            {details.focus && (
              <div className="grid gap-1">
                <dt className="text-xs font-medium leading-5 text-muted-foreground">
                  Exercises / focus
                </dt>
                <dd className="whitespace-pre-wrap">{details.focus}</dd>
              </div>
            )}
            {record?.outcome && (
              <div className="grid gap-1">
                <dt className="text-xs font-medium leading-5 text-muted-foreground">
                  What happened
                </dt>
                <dd className="whitespace-pre-wrap">{record.outcome}</dd>
              </div>
            )}
            {details.nextFocus && (
              <div className="grid gap-1">
                <dt className="text-xs font-medium leading-5 text-muted-foreground">
                  Focus next time
                </dt>
                <dd className="whitespace-pre-wrap">{details.nextFocus}</dd>
              </div>
            )}
          </dl>
          {record && (
            <p className="text-xs text-muted-foreground">
              Last recorded {new Date(record.updatedAt).toLocaleString()}
            </p>
          )}
          {!horse.canRecord && (
            <p className="text-sm text-muted-foreground">
              The horse owner or stable admin can record this horse’s training.
            </p>
          )}
          {saved && <p role="status">Training record saved.</p>}
        </>
      )}
    </DashboardSectionCard>
  )
}

function TrainingRecordEditor({
  entry,
  onCancel,
  onSaved,
}: {
  entry: TrainingEntry
  onCancel: () => void
  onSaved: () => void
}) {
  const saveRecord = useMutation(api.training.saveRecord)
  const [status, setStatus] = useState<Doc<'trainingRecords'>['status']>(
    entry.record?.status ??
      (entry.status === 'completed' ? 'completed' : 'planned'),
  )
  const [outcome, setOutcome] = useState(entry.record?.outcome ?? '')
  const [error, setError] = useState<string>()
  const [pending, setPending] = useState(false)
  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    defaultValues: {
      ...editEventEditorValues(entry.occurrence.event, []),
      training: entry.details,
    },
  })
  return (
    <InlineForm
      onSubmit={async (event) => {
        event.preventDefault()
        if (pending) return
        const parsed = trainingRecordSchema.safeParse({
          ...form.getValues('training'),
          status,
          outcome,
        })
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message)
          return
        }
        const {
          status: nextStatus,
          outcome: nextOutcome,
          ...details
        } = parsed.data
        setPending(true)
        setError(undefined)
        try {
          await saveRecord({
            eventId: entry.occurrence.event._id,
            horseId: entry.horse._id,
            date: entry.occurrence.startDate,
            status: nextStatus,
            details,
            outcome: nextOutcome,
          })
          onSaved()
        } catch (reason) {
          setError(
            reason instanceof Error
              ? reason.message
              : 'Could not save training. Please try again.',
          )
        } finally {
          setPending(false)
        }
      }}
    >
      <Field>
        <FieldLabel htmlFor={`status-${entry.horse._id}`}>
          Status for this horse and date
        </FieldLabel>
        <Select
          id={`status-${entry.horse._id}`}
          value={status}
          disabled={pending}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          {(['planned', 'completed', 'cancelled', 'skipped'] as const).map(
            (value) => (
              <option key={value} value={value}>
                {trainingStatusLabels[value]}
              </option>
            ),
          )}
        </Select>
      </Field>
      <TrainingFormFields control={form.control} disabled={pending} />
      <Field>
        <FieldLabel htmlFor={`outcome-${entry.horse._id}`}>
          What happened / what went well
        </FieldLabel>
        <Textarea
          id={`outcome-${entry.horse._id}`}
          maxLength={1000}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          disabled={pending}
        />
      </Field>
      <FormSubmissionError message={error} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save training record'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </InlineForm>
  )
}
