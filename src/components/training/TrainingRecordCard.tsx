import { getUserFacingErrorCode } from 'shared/i18n/errors'
import type { UserFacingErrorCode } from 'shared/i18n/errors'
import { formatMediumTimestampDateTime } from '#/lib/dateDisplay'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'
import { InlineForm } from '#/components/forms/FormLayout'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { createTrainingSchemas } from 'shared/training/trainingSchema'
import type { TrainingValidationKey } from 'shared/training/trainingSchema'
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
  const t = useT()
  const { locale } = useLocale()

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
            {record
              ? t('trainingViews.updateRecord')
              : t('trainingViews.record')}
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
            <span>{t(`training.formats.${details.format}`)}</span>
            {details.durationMinutes && (
              <span className="tabular-nums">
                {t('training.minutes', { count: details.durationMinutes })}
              </span>
            )}
            {details.rider && (
              <span>{t('training.rider', { name: details.rider })}</span>
            )}
          </DashboardMetaList>
          <dl className="grid max-w-prose gap-5 text-sm leading-6 [overflow-wrap:anywhere]">
            {details.focus && (
              <div className="grid gap-1">
                <dt className="text-xs font-medium leading-5 text-muted-foreground">
                  {t('trainingViews.focus')}
                </dt>
                <dd className="whitespace-pre-wrap">{details.focus}</dd>
              </div>
            )}
            {record?.outcome && (
              <div className="grid gap-1">
                <dt className="text-xs font-medium leading-5 text-muted-foreground">
                  {t('trainingViews.outcome')}
                </dt>
                <dd className="whitespace-pre-wrap">{record.outcome}</dd>
              </div>
            )}
            {details.nextFocus && (
              <div className="grid gap-1">
                <dt className="text-xs font-medium leading-5 text-muted-foreground">
                  {t('trainingViews.nextFocus')}
                </dt>
                <dd className="whitespace-pre-wrap">{details.nextFocus}</dd>
              </div>
            )}
          </dl>
          {record && (
            <p className="text-xs text-muted-foreground">
              {t('trainingViews.lastRecorded', {
                date: formatMediumTimestampDateTime(record.updatedAt, locale),
              })}
            </p>
          )}
          {!horse.canRecord && (
            <p className="text-sm text-muted-foreground">
              {t('trainingViews.permission')}
            </p>
          )}
          {saved && <p role="status">{t('trainingViews.saved')}</p>}
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
  const t = useT()

  const saveRecord = useMutation(api.training.saveRecord)
  const [status, setStatus] = useState<Doc<'trainingRecords'>['status']>(
    entry.record?.status ??
      (entry.status === 'completed' ? 'completed' : 'planned'),
  )
  const [outcome, setOutcome] = useState(entry.record?.outcome ?? '')
  const [error, setError] = useState<TrainingValidationKey | 'save'>()
  const [serverErrorCode, setServerErrorCode] = useState<UserFacingErrorCode>()
  const { trainingRecordSchema } = createTrainingSchemas((key) => key)
  const [pending, setPending] = useState(false)
  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    defaultValues: {
      ...editEventEditorValues(entry.occurrence.event, []),
      training: entry.details,
    },
  })
  return (
    <InlineForm
      noValidate
      onSubmit={async (event) => {
        event.preventDefault()
        if (pending) return
        setServerErrorCode(undefined)
        const parsed = trainingRecordSchema.safeParse({
          ...form.getValues('training'),
          status,
          outcome,
        })
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message as TrainingValidationKey)
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
            errorFormat: 'structured',
            eventId: entry.occurrence.event._id,
            horseId: entry.horse._id,
            date: entry.occurrence.startDate,
            status: nextStatus,
            details,
            outcome: nextOutcome,
          })
          onSaved()
        } catch (reason) {
          console.error('Could not save training record', reason)
          setServerErrorCode(getUserFacingErrorCode(reason))
          setError('save')
        } finally {
          setPending(false)
        }
      }}
    >
      <Field>
        <FieldLabel htmlFor={`status-${entry.horse._id}`}>
          {t('trainingViews.statusForHorse')}
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
                {t(`training.status.${value}`)}
              </option>
            ),
          )}
        </Select>
      </Field>
      <TrainingFormFields control={form.control} disabled={pending} />
      <Field>
        <FieldLabel htmlFor={`outcome-${entry.horse._id}`}>
          {t('trainingViews.outcomeField')}
        </FieldLabel>
        <Textarea
          id={`outcome-${entry.horse._id}`}
          maxLength={1000}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          disabled={pending}
        />
      </Field>
      <FormSubmissionError
        message={
          error === 'save'
            ? serverErrorCode
              ? t(`serverErrors.${serverErrorCode}`)
              : t('trainingViews.saveFailed')
            : error
              ? t(`trainingValidation.${error}`)
              : undefined
        }
      />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? t('trainingViews.saving') : t('trainingViews.saveRecord')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
        >
          {t('trainingViews.cancel')}
        </Button>
      </div>
    </InlineForm>
  )
}
