import { getUserFacingErrorCode } from 'shared/i18n/errors'
import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { createEventSchemas } from 'shared/events/eventSchema'
import { useT } from '#/i18n/LocaleProvider'
import { useId } from 'react'
import type { ComponentProps } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Id } from 'convex/_generated/dataModel'
import {
  RouteFormActions,
  RouteFormCard,
} from '#/components/forms/RouteFormCard'
import { FormSubmitButtons } from '#/components/forms/FormSubmitActions'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { useAcknowledgedFormSave } from '#/components/forms/useAcknowledgedFormSave'
import { EventFormFields } from './EventFormFields'
import type { EventFormInput, EventFormSchema } from './eventFormSchema'

type Props = {
  mode: 'create' | 'edit'
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
  const { eventFormSchema } = createEventSchemas(
    (key) => t(`eventValidation.${key}`),
    (key) => t(`trainingValidation.${key}`),
  )
  const formId = useId()
  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
    mode: 'onTouched',
    defaultValues: initialValues,
  })
  useLocalizedValidation(form)
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
    onSaved,
    onAcknowledged,
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
            ? 'eventEditor.addTraining'
            : 'eventEditor.editTraining'
          : mode === 'create'
            ? 'eventEditor.addEvent'
            : 'eventEditor.editEvent',
      )}
      stickyActions
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
              form.formState.isDirty
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
                  ? 'eventEditor.createTraining'
                  : 'eventEditor.updateTraining'
                : mode === 'create'
                  ? 'eventEditor.createEvent'
                  : 'eventEditor.updateEvent',
            )}
            submittingLabel={
              mode === 'create'
                ? t('eventEditor.creating')
                : t('eventEditor.saving')
            }
          />
        )
      }
    >
      <EventFormFields
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
