import { useRef, useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import type { Id } from 'convex/_generated/dataModel'
import { api } from 'convex/_generated/api'
import { RoutePending } from '#/components/layout/RoutePending'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Field, FieldLabel } from '#/components/ui/field'
import { UnsavedChangesGuard } from '#/components/forms/UnsavedChangesGuard'
import { useLocale } from '#/i18n/LocaleProvider'
import { formatMediumDateKey } from '#/lib/dateDisplay'
import { useOwnershipCopy } from './ownershipCopy'
import { useManagementCopy } from './managementCopy'
import { useOwnershipErrorMessage } from './ownershipErrors'

type Preview = {
  events: Array<{ _id: string; title: string; date: string }>
  reminders: Array<{ _id: Id<'careReminders'>; title: string }>
  revision: string
}
type Context = {
  horseName: string
  sourceStableName: string
  targetStableName?: string
  onCancel: () => void
  onDone: () => void
  onPendingChange?: (pending: boolean) => void
}

export function DepartureReview({
  horseId,
  targetStableId,
  ...context
}: Context & {
  horseId: Id<'horses'>
  targetStableId?: Id<'stables'>
}) {
  const preview = useQuery(api.horseTransitions.preview, { horseId })
  const depart = useMutation(api.horseTransitions.depart)
  if (!preview) return <RoutePending />
  return (
    <DepartureReviewView
      {...context}
      preview={preview}
      submit={(revision, carryReminderIds) =>
        depart({ horseId, targetStableId, revision, carryReminderIds })
      }
    />
  )
}

export function DepartureReviewView({
  preview,
  submit,
  horseName,
  sourceStableName,
  targetStableName,
  onCancel,
  onDone,
  onPendingChange,
}: Context & {
  preview: Preview
  submit: (
    revision: string,
    carryReminderIds: Array<Id<'careReminders'>>,
  ) => Promise<unknown>
}) {
  const c = useOwnershipCopy()
  const m = useManagementCopy()
  const errorMessage = useOwnershipErrorMessage()
  const [selected, setSelected] = useState<Array<Id<'careReminders'>>>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const busy = useRef(false)
  const acknowledged = useRef(false)
  // Retain only available choices when another contributor changes the plan.
  const currentSelection = selected.filter((id) =>
    preview.reminders.some((row) => row._id === id),
  )
  return (
    <div className="grid gap-4 border-t border-border-subtle pt-4">
      <UnsavedChangesGuard
        shouldBlock={() => !acknowledged.current && selected.length > 0}
      />
      <h3 className="font-display text-xl">{m.moveTitle(horseName)}</h3>
      <dl className="grid gap-2 text-sm">
        <div>
          <dt className="font-semibold">{m.from}</dt>
          <dd>{sourceStableName}</dd>
        </div>
        <div>
          <dt className="font-semibold">{m.to}</dt>
          <dd>{targetStableName ?? c.personal}</dd>
        </div>
      </dl>
      <p>{c.departureHelp}</p>
      {targetStableName && <p>{c.connectHelp}</p>}
      <DepartureChecklist
        preview={preview}
        selected={currentSelection}
        onChange={setSelected}
        disabled={pending}
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          aria-busy={pending || undefined}
          disabled={pending}
          onClick={async () => {
            if (busy.current) return
            busy.current = true
            setPending(true)
            onPendingChange?.(true)
            setError('')
            try {
              await submit(preview.revision, currentSelection)
              acknowledged.current = true
              onDone()
            } catch (cause) {
              setError(errorMessage(cause))
            } finally {
              busy.current = false
              setPending(false)
              onPendingChange?.(false)
            }
          }}
        >
          {pending
            ? c.moving
            : targetStableName
              ? m.moveConfirm(targetStableName)
              : m.leaveConfirm}
        </Button>
        <Button variant="outline" disabled={pending} onClick={onCancel}>
          {m.cancelReview}
        </Button>
      </div>
    </div>
  )
}

export function DepartureChecklist({
  preview,
  selected,
  onChange,
  disabled = false,
}: {
  preview: Pick<Preview, 'events' | 'reminders'>
  selected: Array<Id<'careReminders'>>
  onChange: (ids: Array<Id<'careReminders'>>) => void
  disabled?: boolean
}) {
  const c = useOwnershipCopy()
  const m = useManagementCopy()
  const { locale } = useLocale()
  return (
    <>
      <h3 className="font-display text-xl">{c.future}</h3>
      {preview.events.length ? (
        <ul className="list-disc pl-5">
          {preview.events.map((event) => (
            <li key={event._id}>
              {event.title} · {formatMediumDateKey(event.date, locale)}
            </li>
          ))}
        </ul>
      ) : (
        <p>{c.noEvents}</p>
      )}
      <fieldset className="grid gap-3" disabled={disabled}>
        <legend className="mb-3 font-display text-xl">{c.tasks}</legend>
        <p className="text-sm text-muted-foreground">{m.tasksHelp}</p>
        {preview.reminders.length ? (
          preview.reminders.map((reminder) => (
            <Field key={reminder._id} orientation="horizontal">
              <Checkbox
                id={`carry-${reminder._id}`}
                checked={selected.includes(reminder._id)}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  onChange(
                    checked
                      ? [...selected, reminder._id]
                      : selected.filter((id) => id !== reminder._id),
                  )
                }
              />
              <FieldLabel htmlFor={`carry-${reminder._id}`}>
                {reminder.title}
              </FieldLabel>
            </Field>
          ))
        ) : (
          <p>{c.noTasks}</p>
        )}
      </fieldset>
    </>
  )
}
