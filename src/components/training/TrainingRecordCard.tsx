import { CreatorByline } from '#/components/events/CreatorByline'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { getUserFacingErrorCode } from 'shared/i18n/errors'
import type { UserFacingErrorCode } from 'shared/i18n/errors'
import { formatMediumTimestampDateTime } from '#/lib/dateDisplay'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { CheckCircleIcon } from '@phosphor-icons/react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  DetailReferenceField,
  DetailReferenceList,
} from '#/components/dashboard/DetailReference'
import { InlineForm } from '#/components/forms/FormLayout'
import { useEffect, useRef, useState } from 'react'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { UnsavedChangesGuard } from '#/components/forms/UnsavedChangesGuard'
import { hasDraftChanges } from '#/components/forms/hasDraftChanges'
import { formStickyActionsClassName } from '#/components/forms/RouteFormCard'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
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
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { TrainingFormFields } from './TrainingFormFields'
import { TrainingActivityTag, TrainingStatusBadge } from './TrainingBadges'
import { TrainingCompletionControl } from './TrainingCompletionControl'
import { editEventEditorValues } from '#/components/forms/event/eventEditorValues'
import type {
  EventFormInput,
  EventFormSchema,
} from '#/components/forms/event/eventFormSchema'
import type { TrainingEntry } from './trainingCalendarData'

export function TrainingRecordCard({
  entry,
  showCompletion = true,
}: {
  entry: TrainingEntry
  showCompletion?: boolean
}) {
  const t = useT()
  const { locale } = useLocale()

  const [editing, setEditing] = useState(false)
  const recordAction = useRef<HTMLButtonElement>(null)
  const wasEditing = useRef(false)
  useEffect(() => {
    if (wasEditing.current && !editing) recordAction.current?.focus()
    wasEditing.current = editing
  }, [editing])
  const [saved, setSaved] = useState(false)
  const { horse, details, record, status } = entry
  const { today } = useLocalDateContext()
  const hasNotes = Boolean(
    details.focus || record?.outcome || details.nextFocus,
  )
  return (
    <DashboardSectionCard
      headerContent={
        <header className="grid min-w-0 gap-3">
          <div className="flex min-w-0 items-center justify-between gap-4">
            <h2 className="min-w-0 font-sans text-xl font-semibold leading-snug wrap-anywhere">
              <Link
                to="/horses/$horseId"
                params={{ horseId: horse._id }}
                className="app-control-focus rounded-control underline-offset-4 hover:underline"
              >
                {getHorseDisplayName(horse)}
              </Link>
            </h2>
            {!editing && <TrainingStatusBadge status={status} />}
          </div>
          {(record || (!editing && showCompletion)) && (
            <div className="flex min-w-0 items-center justify-between gap-4">
              <div className="min-w-0">
                {record && <CreatorByline name={record.createdByName} />}
              </div>
              {!editing && showCompletion && (
                <TrainingCompletionControl entry={entry} labelled />
              )}
            </div>
          )}
        </header>
      }
      footer={
        !editing && (record || horse.canRecord) ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
            {record && (
              <p className="text-xs text-muted-foreground">
                {t('trainingViews.lastRecorded', {
                  date: formatMediumTimestampDateTime(record.updatedAt, locale),
                })}
              </p>
            )}
            {horse.canRecord && (
              <Button
                ref={recordAction}
                variant="outline"
                onClick={() => {
                  setEditing(true)
                  setSaved(false)
                }}
              >
                {record
                  ? t('trainingViews.updateRecord')
                  : t(
                      entry.occurrence.startDate <= today
                        ? 'trainingViews.recordCompleted'
                        : 'trainingViews.record',
                    )}
              </Button>
            )}
          </div>
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
          <DetailReferenceList mobileColumns={2}>
            <DetailReferenceField
              label={t('trainingViews.workType')}
              value={
                <span className="flex flex-wrap gap-1.5">
                  {details.activities.map((activity) => (
                    <TrainingActivityTag key={activity} activity={activity} />
                  ))}
                </span>
              }
            />
            <DetailReferenceField
              label={t('trainingViews.duration')}
              value={
                details.durationMinutes !== undefined
                  ? t('training.minutes', { count: details.durationMinutes })
                  : undefined
              }
              missingValue={t('horseDetail.notRecorded')}
            />
            <DetailReferenceField
              label={t('trainingViews.format')}
              value={t(`training.formats.${details.format}`)}
            />
            <DetailReferenceField
              label={t('eventForm.rider')}
              value={details.rider}
            />
          </DetailReferenceList>
          {hasNotes && (
            <div className="border-t border-border-subtle pt-4">
              <DetailReferenceList>
                <DetailReferenceField
                  label={t('trainingViews.focus')}
                  value={details.focus}
                  multiline
                  fullWidth
                />
                <DetailReferenceField
                  label={t('trainingViews.outcome')}
                  value={record?.outcome}
                  multiline
                  fullWidth
                />
                <DetailReferenceField
                  label={t('trainingViews.nextFocus')}
                  value={details.nextFocus}
                  multiline
                  fullWidth
                />
              </DetailReferenceList>
            </div>
          )}
          {!horse.canRecord && (
            <p className="text-sm text-muted-foreground">
              {t('trainingViews.permission')}
            </p>
          )}
          {saved && (
            <p role="status" className="flex items-center gap-2 text-primary">
              <CheckCircleIcon
                className="app-success-feedback size-5 shrink-0"
                weight="fill"
                aria-hidden="true"
              />
              {t('trainingViews.saved')}
            </p>
          )}
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
  const navigate = useNavigate()
  const [recordDate, setRecordDate] = useState(entry.occurrence.startDate)
  const { today } = useLocalDateContext()
  const defaultStatus =
    entry.record?.status ??
    (entry.occurrence.startDate <= today ? 'completed' : 'planned')
  const [discardOpen, setDiscardOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const acknowledged = useRef(false)
  const submitting = useRef(false)
  const [status, setStatus] =
    useState<Doc<'trainingRecords'>['status']>(defaultStatus)
  const [outcome, setOutcome] = useState(entry.record?.outcome ?? '')
  const [error, setError] = useState<TrainingValidationKey | 'save'>()
  const [serverErrorCode, setServerErrorCode] = useState<UserFacingErrorCode>()
  const { trainingRecordFormSchema } = createTrainingSchemas((key) => key)
  const [pending, setPending] = useState(false)
  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    defaultValues: {
      ...editEventEditorValues(entry.occurrence.event, []),
      training: entry.details,
    },
  })
  const initialDraft = useRef({
    training: entry.details,
    status: defaultStatus,
    outcome: entry.record?.outcome ?? '',
    date: entry.occurrence.startDate,
  })
  const isDirty = () =>
    !acknowledged.current &&
    hasDraftChanges(
      {
        training: form.getValues('training'),
        status,
        outcome,
        date: recordDate,
      },
      initialDraft.current,
    )
  return (
    <InlineForm
      data-mobile-inline-edit="true"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault()
        if (submitting.current) return
        form.clearErrors()
        setServerErrorCode(undefined)
        const parsed = trainingRecordFormSchema.safeParse({
          ...form.getValues('training'),
          status,
          outcome,
        })
        if (!parsed.success) {
          setDetailsOpen(true)
          for (const issue of parsed.error.issues) {
            const key = issue.path[0]
            if (
              key === 'activities' ||
              key === 'format' ||
              key === 'durationMinutes' ||
              key === 'rider' ||
              key === 'focus' ||
              key === 'nextFocus'
            )
              form.setError(
                `training.${key}`,
                {
                  message: t(
                    `trainingValidation.${issue.message as TrainingValidationKey}`,
                  ),
                },
                { shouldFocus: true },
              )
          }
          setError(parsed.error.issues[0]?.message as TrainingValidationKey)
          return
        }
        const {
          status: nextStatus,
          outcome: nextOutcome,
          ...details
        } = parsed.data
        submitting.current = true
        setPending(true)
        setError(undefined)
        try {
          await saveRecord({
            errorFormat: 'structured',
            eventId: entry.occurrence.event._id,
            horseId: entry.horse._id,
            date: entry.occurrence.startDate,
            newDate: recordDate,
            status: nextStatus,
            details,
            outcome: nextOutcome,
          })
          acknowledged.current = true
          onSaved()
          if (recordDate !== entry.occurrence.startDate) {
            await navigate({
              to: '/events/$eventId',
              params: { eventId: entry.occurrence.event._id },
              search: {
                date: recordDate,
                horseId: entry.horse._id,
                participationId: entry.occurrence.event.contextParticipationId,
              },
            })
          }
        } catch (reason) {
          console.error('Could not save training record', reason)
          setServerErrorCode(getUserFacingErrorCode(reason))
          setError('save')
        } finally {
          submitting.current = false
          setPending(false)
        }
      }}
    >
      <UnsavedChangesGuard shouldBlock={isDirty} />
      {entry.record && (
        <Field>
          <FieldLabel htmlFor={`record-date-${entry.horse._id}`}>
            {t('eventForm.date')}
          </FieldLabel>
          <Input
            id={`record-date-${entry.horse._id}`}
            type="date"
            value={recordDate}
            required
            disabled={pending}
            onChange={(event) => setRecordDate(event.target.value)}
          />
        </Field>
      )}
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
              <option
                key={value}
                value={value}
                disabled={
                  value === 'completed' && entry.occurrence.startDate > today
                }
              >
                {t(`training.status.${value}`)}
              </option>
            ),
          )}
        </Select>
      </Field>
      <TrainingFormFields
        control={form.control}
        disabled={pending}
        fields="duration"
      />
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
      <details
        open={detailsOpen}
        onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
      >
        <summary className="app-control-focus min-h-11 cursor-pointer py-3 font-semibold">
          {t('trainingViews.changeDetails')}
        </summary>
        <div
          hidden={!detailsOpen}
          className={detailsOpen ? 'grid gap-5 pt-3' : 'hidden'}
        >
          <TrainingFormFields
            control={form.control}
            disabled={pending}
            fields="adjustments"
            horseIds={[entry.horse._id]}
          />
        </div>
      </details>
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
      <div className={`${formStickyActionsClassName} flex flex-wrap gap-2`}>
        <Button type="submit" disabled={pending}>
          {pending ? t('trainingViews.saving') : t('trainingViews.saveRecord')}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => (isDirty() ? setDiscardOpen(true) : onCancel())}
        >
          {t('trainingViews.cancel')}
        </Button>
      </div>
      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.unsavedTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.unsavedHelp')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.keepEditing')}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={onCancel}>
              {t('common.leaveWithoutSaving')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </InlineForm>
  )
}
