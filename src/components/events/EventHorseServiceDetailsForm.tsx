import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useT } from '#/i18n/LocaleProvider'
import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { Field, FieldError, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { useId, useRef, useState } from 'react'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { useForm } from 'react-hook-form'
import { createEventHorseDetailsSchemas } from 'shared/events/eventHorseDetailsSchema'
import type {
  EventHorseDetailsFormInput,
  EventHorseDetailsFormSchema,
} from 'shared/events/eventHorseDetailsSchema'

type EventHorseServiceDetailsFormProps = {
  defaultValues: EventHorseDetailsFormSchema
  onSubmit: (values: EventHorseDetailsFormSchema) => Promise<void>
  onCancel: () => void
}

export function EventHorseServiceDetailsForm({
  defaultValues,
  onSubmit,
  onCancel,
}: EventHorseServiceDetailsFormProps) {
  const t = useT()

  const { eventHorseDetailsFormSchema } = createEventHorseDetailsSchemas(
    (key) => t(`eventViews.validation.${key}`),
  )
  const formId = useId()
  const submitting = useRef(false)
  const [saveError, setSaveError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const form = useForm<
    EventHorseDetailsFormInput,
    unknown,
    EventHorseDetailsFormSchema
  >({
    resolver: zodResolver(eventHorseDetailsFormSchema),
    mode: 'onTouched',
    defaultValues,
  })

  useLocalizedValidation(form)
  const submit = async (values: EventHorseDetailsFormSchema) => {
    if (submitting.current) return
    submitting.current = true
    setIsSaving(true)
    setSaveError(false)
    try {
      await onSubmit(values)
    } catch {
      setSaveError(true)
    } finally {
      submitting.current = false
      setIsSaving(false)
    }
  }

  return (
    <InlineForm noValidate gap="compact" onSubmit={form.handleSubmit(submit)}>
      {saveError && (
        <RouteStatusAlert
          tone="danger"
          title={t('eventViews.saveFailed')}
          description={t('eventViews.saveFailedHelp')}
        />
      )}
      <Field
        data-invalid={Boolean(form.formState.errors.requestedServiceNotes)}
      >
        <FieldLabel htmlFor={`${formId}-requestedServiceNotes`}>
          {t('eventViews.requestedNotes')}
        </FieldLabel>
        <Textarea
          autoFocus
          id={`${formId}-requestedServiceNotes`}
          {...form.register('requestedServiceNotes')}
          disabled={isSaving || form.formState.isSubmitting}
          aria-invalid={Boolean(form.formState.errors.requestedServiceNotes)}
          aria-describedby={
            form.formState.errors.requestedServiceNotes
              ? `${formId}-requestedServiceNotes-error`
              : undefined
          }
          placeholder={t('eventViews.requestedPlaceholder')}
        />
        <FieldError
          id={`${formId}-requestedServiceNotes-error`}
          errors={[form.formState.errors.requestedServiceNotes]}
        />
      </Field>

      <Field data-invalid={Boolean(form.formState.errors.completionNotes)}>
        <FieldLabel htmlFor={`${formId}-completionNotes`}>
          {t('eventViews.outcomeNotes')}
        </FieldLabel>
        <Textarea
          id={`${formId}-completionNotes`}
          {...form.register('completionNotes')}
          disabled={isSaving || form.formState.isSubmitting}
          aria-invalid={Boolean(form.formState.errors.completionNotes)}
          aria-describedby={
            form.formState.errors.completionNotes
              ? `${formId}-completionNotes-error`
              : undefined
          }
          placeholder={t('eventViews.outcomePlaceholder')}
        />
        <FieldError
          id={`${formId}-completionNotes-error`}
          errors={[form.formState.errors.completionNotes]}
        />
      </Field>

      <FieldGrid>
        <Field data-invalid={Boolean(form.formState.errors.costShare)}>
          <FieldLabel htmlFor={`${formId}-costShare`}>
            {t('eventViews.costShare')}
          </FieldLabel>
          <Input
            id={`${formId}-costShare`}
            type="number"
            min={0}
            step="0.01"
            disabled={isSaving || form.formState.isSubmitting}
            aria-invalid={Boolean(form.formState.errors.costShare)}
            aria-describedby={
              form.formState.errors.costShare
                ? `${formId}-costShare-error`
                : undefined
            }
            placeholder={t('eventViews.costPlaceholder')}
            {...form.register('costShare', { valueAsNumber: true })}
          />
          <FieldError
            id={`${formId}-costShare-error`}
            errors={[form.formState.errors.costShare]}
          />
        </Field>
      </FieldGrid>

      <FormSubmitActions
        isSubmitting={isSaving || form.formState.isSubmitting}
        onCancel={onCancel}
        submitLabel={t('eventViews.saveDetails')}
        submittingLabel={t('eventViews.saving')}
      />
    </InlineForm>
  )
}
