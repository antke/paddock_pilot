import { getUserFacingErrorCode } from 'shared/i18n/errors'
import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { createEventSchemas } from 'shared/events/eventSchema'
import { useT } from '#/i18n/LocaleProvider'
import { useId, useRef } from 'react'
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
import { useMobileTaskReturn } from '#/components/layout/mobileTaskNavigation'

type Props = {
  mode: 'create' | 'edit'
  scheduleOnly?: boolean
  eventContext?: 'stable' | 'personal'
  feature?: 'events' | 'training'
  initialValues: EventFormInput
  horses: ComponentProps<typeof EventFormFields>['horses']
  providers?: ComponentProps<typeof EventFormFields>['providers']
  onSave: (values: EventFormSchema) => Promise<Id<'events'>>
  onSaved: (eventId: Id<'events'>) => void | Promise<void>
  onAcknowledged?: (eventId: Id<'events'>, values: EventFormSchema) => void
  onPendingChange?: (pending: boolean) => void
  completionMessage?: string
}

/** Callers key this editor by stable/event identity; reactive updates preserve a draft. */
export function EventEditor({
  mode,
  scheduleOnly = false,
  eventContext = 'stable',
  feature = 'events',
  initialValues,
  horses,
  providers,
  onSave,
  onSaved,
  onAcknowledged,
  onPendingChange,
  completionMessage,
}: Props) {
  const t = useT()

  const isTraining = feature === 'training'
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
  )
  const formId = useId()
  const initialDraft = useRef(initialValues)
  const resolve = zodResolver(eventFormSchema)
  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    resolver: (values, context, options) =>
      resolve(
        isTraining && !values.title.trim()
          ? {
              ...values,
              title:
                values.training?.activities
                  .map((activity) => t(`training.activities.${activity}`))
                  .join(' · ') || t('trainingViews.log'),
            }
          : values,
        context,
        options,
      ),
    mode: 'onTouched',
    defaultValues: initialValues,
  })
  const currentDraft = useWatch({ control: form.control })
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
    save: onSave,
    onSaved: (id) => {
      if (mode === 'create') {
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
            onReset={() => {
              if (pending) return
              form.reset()
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
            submitLabel={t(
              isTraining
                ? mode === 'create'
                  ? recording
                    ? 'trainingViews.saveRecord'
                    : 'eventEditor.createTraining'
                  : 'eventEditor.updateTraining'
                : mode === 'create'
                  ? 'eventEditor.createEvent'
                  : 'eventEditor.updateEvent',
            )}
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
      <EventFormFields
        eventContext={eventContext}
        scheduleOnly={scheduleOnly}
        trainingMode={isTraining ? mode : undefined}
        control={form.control}
        setValue={form.setValue}
        horses={horses}
        providers={providers}
        disabled={pending || save.acknowledged}
      />
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
