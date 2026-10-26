import { Select } from '#/components/ui/select'
import { Field, FieldLabel, FieldDescription } from '#/components/ui/field'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '#/components/ui/alert-dialog'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import type { FunctionReturnType } from 'convex/server'
import type { api } from 'convex/_generated/api'
import { createRequestId } from '#/lib/createRequestId'
import { ScheduledTrainingChoices } from '#/components/sharing/ScheduledTrainingChoices'
import { NewRecordAudience } from '#/components/sharing/RecordAudience'
import { getUserFacingErrorCode } from 'shared/i18n/errors'
import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { createEventSchemas } from 'shared/events/eventSchema'
import { useT } from '#/i18n/LocaleProvider'
import { useId, useRef, useState } from 'react'
import type { ComponentProps } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { Id } from 'convex/_generated/dataModel'
import {
  RouteFormActions,
  RouteFormCard,
} from '#/components/forms/RouteFormCard'
import { FormSubmitButtons } from '#/components/forms/FormSubmitActions'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { useAcknowledgedFormSave } from '#/components/forms/useAcknowledgedFormSave'
import { UnsavedChangesGuard } from '#/components/forms/UnsavedChangesGuard'
import { hasDraftChanges } from '#/components/forms/hasDraftChanges'
import { EventFormFields } from './EventFormFields'
import type { EventFormInput, EventFormSchema } from './eventFormSchema'
import { getEventEditorDefaults } from './eventEditorValues'
import { useMobileTaskReturn } from '#/components/layout/mobileTaskNavigation'

type Props = {
  onDestinationChange?: (stableId: string | undefined) => void
  destinations?: FunctionReturnType<typeof api.events.creationOptions>
  mode: 'create' | 'edit'
  audienceEnabled?: boolean
  scheduleOnly?: boolean
  eventContext?: 'stable' | 'personal'
  feature?: 'events' | 'training'
  initialValues: EventFormInput
  horses: ComponentProps<typeof EventFormFields>['horses']
  providers?: ComponentProps<typeof EventFormFields>['providers']
  riderSuggestions?: ComponentProps<typeof EventFormFields>['riderSuggestions']
  onSave: (values: EventFormSchema) => Promise<Id<'events'>>
  onSaved: (eventId: Id<'events'>) => void | Promise<void>
  onAcknowledged?: (eventId: Id<'events'>, values: EventFormSchema) => void
  onPendingChange?: (pending: boolean) => void
  completionMessage?: string
}

/** Callers key this editor by stable/event identity; reactive updates preserve a draft. */
export function EventEditor({
  mode,
  destinations,
  onDestinationChange,
  audienceEnabled = false,
  scheduleOnly = false,
  eventContext = 'stable',
  feature = 'events',
  initialValues,
  horses,
  providers,
  riderSuggestions,
  onSave,
  onSaved,
  onAcknowledged,
  onPendingChange,
  completionMessage,
}: Props) {
  const t = useT()

  const [selectedType, setSelectedType] = useState(initialValues.type)
  const [switchTo, setSwitchTo] = useState<string | null>(null)
  const isTraining = feature === 'training' || selectedType === 'training'
  const returnFromTask = useMobileTaskReturn(
    initialValues.stableId
      ? `/stables/${initialValues.stableId}/${isTraining ? 'training' : 'events'}`
      : isTraining
        ? '/training'
        : '/events',
  )
  const { eventFormSchema } = createEventSchemas(
    (key) => t(`eventValidation.${key}`),
    (key) => t(`trainingValidation.${key}`),
    { allowEmptyHorses: mode === 'edit' },
  )
  const formId = useId()
  const requestId = useRef(createRequestId())
  const initialDraft = useRef(
    getEventEditorDefaults(initialValues, isTraining && !scheduleOnly),
  )
  const resolve = zodResolver(eventFormSchema)
  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    resolver: (values, context, options) =>
      resolve(
        isTraining && !values.title.trim()
          ? {
              ...values,
              title:
                values.training?.activities
                  ?.map((activity) => t(`training.activities.${activity}`))
                  .join(' · ') || t('trainingViews.log'),
            }
          : values,
        context,
        options,
      ),
    mode: 'onTouched',
    defaultValues: initialDraft.current,
  })
  const currentDraft = useWatch({ control: form.control })
  const destination = currentDraft.stableId ?? ''
  const destinationHorses = (value: string) =>
    value
      ? (destinations?.stables.find((stable) => stable.id === value)?.horses ??
        [])
      : (destinations?.personal ?? [])
  const availableHorses = destinations ? destinationHorses(destination) : horses
  const selectedHorses = availableHorses.filter((h) =>
    currentDraft.horseIds?.includes(h._id),
  )
  const invitationCount = selectedHorses.filter(
    (h) => h.requiresApproval,
  ).length
  const incompatible =
    switchTo === null
      ? []
      : availableHorses.filter(
          (h) =>
            currentDraft.horseIds?.includes(h._id) &&
            !destinationHorses(switchTo).some((next) => next._id === h._id),
        )
  const switchDestination = (value: string) => {
    form.setValue('stableId', value || undefined, { shouldDirty: true })
    onDestinationChange?.(value || undefined)
    form.setValue(
      'horseIds',
      (form.getValues('horseIds') ?? []).filter((id) =>
        destinationHorses(value).some((h) => h._id === id),
      ),
      { shouldDirty: true },
    )
    form.setValue('sharing', undefined, { shouldDirty: true })
    setSwitchTo(null)
  }
  const hasChanges = hasDraftChanges(currentDraft, initialDraft.current)
  const recording =
    isTraining && mode === 'create' && currentDraft.status === 'completed'
  useLocalizedValidation(form)
  const saved = useRef(false)
  const save = useAcknowledgedFormSave({
    formatSaveError: (error) => {
      const code = getUserFacingErrorCode(error)
      return code
        ? t(`serverErrors.${code}`)
        : t(
            isTraining
              ? 'eventEditor.trainingSaveFailed'
              : 'eventEditor.eventSaveFailed',
          )
    },
    save: (values: EventFormSchema) =>
      onSave(
        mode === 'create'
          ? { ...values, requestId: requestId.current }
          : values,
      ),
    onSaved: (id) => {
      if (mode === 'create' && !destinations) {
        const returning = returnFromTask()
        if (returning) return returning === true ? undefined : returning
      }
      return onSaved(id)
    },
    onAcknowledged: (id, values) => {
      saved.current = true
      onAcknowledged?.(id, values)
    },
    onPendingChange,
    saveError: t(
      isTraining
        ? 'eventEditor.trainingSaveFailed'
        : 'eventEditor.eventSaveFailed',
    ),
    continueError: isTraining
      ? t('eventEditor.trainingContinueFailed')
      : t('eventEditor.eventContinueFailed'),
  })
  const pending = save.pending || form.formState.isSubmitting

  return (
    <RouteFormCard
      noValidate
      formId={formId}
      title={t(
        isTraining
          ? mode === 'create'
            ? recording
              ? 'trainingViews.recordCompleted'
              : 'eventEditor.addTraining'
            : 'eventEditor.editTraining'
          : mode === 'create'
            ? 'eventEditor.addEvent'
            : 'eventEditor.editEvent',
      )}
      stickyActions
      cancelDisabled={pending}
      onCancel={() => {
        if (!pending) returnFromTask(true)
      }}
      onSubmit={(event) => {
        if (pending || save.completed) {
          event.preventDefault()
          return
        }
        if (save.acknowledged) {
          event.preventDefault()
          void save.retryContinuation()
          return
        }
        void form.handleSubmit(save.submit)(event)
      }}
      actions={
        save.acknowledged ? (
          <FormSubmitButtons
            confirmed={save.completed}
            confirmedLabel={
              isTraining
                ? t('eventEditor.trainingSaved')
                : t('eventEditor.eventSaved')
            }
            isSubmitting={pending}
            disabled={save.completed}
            submitLabel={
              save.completed
                ? isTraining
                  ? t('eventEditor.trainingSaved')
                  : t('eventEditor.eventSaved')
                : t(
                    isTraining
                      ? 'eventEditor.openTraining'
                      : 'eventEditor.openEvent',
                  )
            }
            submittingLabel={
              isTraining
                ? t('eventEditor.openingTraining')
                : t('eventEditor.openingEvent')
            }
          />
        ) : (
          <RouteFormActions
            isSubmitting={pending}
            disabled={Boolean(recording && invitationCount)}
            onReset={() => {
              if (pending) return
              form.reset()
              onDestinationChange?.(initialValues.stableId)
              setSelectedType(initialValues.type)
              save.clearError()
            }}
            resetConfirmation={
              hasChanges
                ? {
                    title: t(
                      isTraining
                        ? 'eventEditor.resetTraining'
                        : 'eventEditor.resetEvent',
                    ),
                    description: t('eventEditor.resetHelp'),
                    confirmLabel: t('eventEditor.reset'),
                  }
                : undefined
            }
            submitLabel={
              destinations && mode === 'create'
                ? destination
                  ? t('eventEditor.createStable', {
                      stable:
                        destinations.stables.find((s) => s.id === destination)
                          ?.name ?? '',
                    })
                  : t(
                      isTraining
                        ? 'eventEditor.createPrivateTraining'
                        : 'eventEditor.createPrivateEvent',
                    )
                : t(
                    isTraining
                      ? mode === 'create'
                        ? recording
                          ? 'trainingViews.saveRecord'
                          : 'eventEditor.createTraining'
                        : 'eventEditor.updateTraining'
                      : mode === 'create'
                        ? 'eventEditor.createEvent'
                        : 'eventEditor.updateEvent',
                  )
            }
            submittingLabel={
              mode === 'create' && !recording
                ? t('eventEditor.creating')
                : t('eventEditor.saving')
            }
          />
        )
      }
    >
      <UnsavedChangesGuard
        shouldBlock={() =>
          !saved.current &&
          hasDraftChanges(form.getValues(), initialDraft.current)
        }
      />
      {destinations && mode === 'create' && (
        <Field>
          <FieldLabel htmlFor={`${formId}-destination`}>
            {t('eventEditor.createIn')}
          </FieldLabel>
          <Select
            id={`${formId}-destination`}
            value={destination}
            disabled={pending || save.acknowledged}
            aria-describedby={`${formId}-visibility`}
            onChange={(event) => {
              const next = event.target.value
              const conflicts = (form.getValues('horseIds') ?? []).some(
                (id) => !destinationHorses(next).some((h) => h._id === id),
              )
              if (conflicts) setSwitchTo(next)
              else switchDestination(next)
            }}
          >
            <option value="">{t('eventEditor.personal')}</option>
            {destinations.stables.map((stable) => (
              <option key={stable.id} value={stable.id}>
                {stable.name}
              </option>
            ))}
          </Select>
          <FieldDescription id={`${formId}-visibility`}>
            {t(
              destination
                ? 'eventEditor.stableHelp'
                : 'eventEditor.personalHelp',
            )}
          </FieldDescription>
          <AlertDialog
            open={switchTo !== null}
            onOpenChange={(open) => {
              if (!open) setSwitchTo(null)
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('eventEditor.switchTitle')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('eventEditor.switchHelp', {
                    horses: incompatible
                      .map((h) => getHorseDisplayName(h))
                      .join(', '),
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t('eventEditor.keepSpace')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (switchTo !== null) switchDestination(switchTo)
                  }}
                >
                  {t('eventEditor.switchConfirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Field>
      )}
      {mode === 'create' && audienceEnabled && !destinations ? (
        <NewRecordAudience
          horseIds={
            currentDraft.horseIds?.filter((id): id is string => Boolean(id)) ??
            []
          }
          choices={
            currentDraft.sharing as
              Array<{ horseId: string; enabled: boolean }> | undefined
          }
          onChange={(choices) =>
            form.setValue('sharing', choices, { shouldDirty: true })
          }
          disabled={pending || save.acknowledged}
        />
      ) : null}
      {recording && audienceEnabled ? (
        <ScheduledTrainingChoices
          horseIds={
            currentDraft.horseIds?.filter((id): id is string => Boolean(id)) ??
            []
          }
          date={currentDraft.date ?? ''}
        />
      ) : null}
      <EventFormFields
        eventContext={
          destinations ? (destination ? 'stable' : 'personal') : eventContext
        }
        allowTypeChange={feature === 'events' && mode === 'create'}
        onTypeChange={setSelectedType}
        scheduleOnly={scheduleOnly}
        trainingMode={isTraining ? mode : undefined}
        control={form.control}
        setValue={form.setValue}
        horses={availableHorses}
        providers={providers}
        riderSuggestions={riderSuggestions}
        disabled={pending || save.acknowledged}
      />
      {destinations && selectedHorses.length > 0 && (
        <p role="status" className="text-sm text-muted-foreground">
          {t('eventEditor.summary', {
            confirmed: selectedHorses.length - invitationCount,
            invited: invitationCount,
          })}
        </p>
      )}
      {recording && invitationCount > 0 && (
        <p role="alert" className="text-sm text-destructive">
          {t('eventEditor.recordPermission')}
        </p>
      )}
      <FormSubmissionError message={save.error} />
      {save.completed ? (
        <p role="status" className="text-sm text-foreground">
          {completionMessage ??
            t(
              isTraining
                ? 'eventEditor.trainingSavedSentence'
                : 'eventEditor.eventSavedSentence',
            )}
        </p>
      ) : null}
    </RouteFormCard>
  )
}
