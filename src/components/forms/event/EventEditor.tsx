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
import { eventFormSchema } from './eventFormSchema'
import type { EventFormInput, EventFormSchema } from './eventFormSchema'

type Props = {
  mode: 'create' | 'edit'
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
  initialValues,
  horses,
  providers,
  onSave,
  onSaved,
  onAcknowledged,
  onPendingChange,
  completionMessage = 'Event saved.',
}: Props) {
  const formId = useId()
  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
    mode: 'onTouched',
    defaultValues: initialValues,
  })
  const save = useAcknowledgedFormSave({
    save: onSave,
    onSaved,
    onAcknowledged,
    onPendingChange,
    saveError:
      'Could not save event. Your entries are still here. Please try again.',
    continueError:
      'Event saved, but its page could not be opened. Open the event to continue; your changes do not need to be saved again.',
  })
  const pending = save.pending || form.formState.isSubmitting

  return (
    <RouteFormCard
      formId={formId}
      title={mode === 'create' ? 'Add event' : 'Edit event'}
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
            submitLabel={save.completed ? 'Event saved' : 'Open event'}
            submittingLabel="Opening event…"
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
                    title: 'Reset event changes?',
                    description:
                      'Your unsaved entries will be replaced with the values from when you opened this form.',
                    confirmLabel: 'Reset changes',
                  }
                : undefined
            }
            submitLabel={mode === 'create' ? 'Create event' : 'Update event'}
            submittingLabel={mode === 'create' ? 'Creating…' : 'Saving…'}
          />
        )
      }
    >
      <EventFormFields
        control={form.control}
        setValue={form.setValue}
        horses={horses}
        providers={providers}
        disabled={pending || save.acknowledged}
      />
      <FormSubmissionError message={save.error} />
      {save.completed ? (
        <p role="status" className="text-sm text-foreground">
          {completionMessage}
        </p>
      ) : null}
    </RouteFormCard>
  )
}
