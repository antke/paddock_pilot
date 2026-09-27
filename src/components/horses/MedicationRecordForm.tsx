import { useId, useRef } from 'react'
import { FormGroup, InlineForm } from '#/components/forms/FormLayout'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { Field, FieldError, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { getTodayDateKey } from '#/lib/dateDisplay'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import {
  medicationRecordFormSchema,
  medicationRecordStatuses,
} from 'shared/horses/medicationRecordSchema'
import type {
  MedicationRecordFormInput,
  MedicationRecordFormSchema,
  MedicationRecordStatus,
} from 'shared/horses/medicationRecordSchema'
import { horseMedicationStatusLabels } from './horseCareLabels'

type MedicationRecordFormProps = {
  disabled?: boolean
  onPendingChange?: (pending: boolean) => void
  onSubmit: (data: MedicationRecordFormSchema) => Promise<void>
}

const medicationStatusOptions = medicationRecordStatuses.map((status) => ({
  value: status,
  label: horseMedicationStatusLabels[status],
}))

const asMedicationStatus = (value: string) => value as MedicationRecordStatus

export function MedicationRecordForm({
  disabled = false,
  onPendingChange,
  onSubmit,
}: MedicationRecordFormProps) {
  const formId = useId()
  const submitting = useRef(false)
  const form = useForm<
    MedicationRecordFormInput,
    unknown,
    MedicationRecordFormSchema
  >({
    resolver: zodResolver(medicationRecordFormSchema),
    mode: 'onTouched',
    defaultValues: {
      medicationName: '',
      dosage: '',
      frequency: '',
      startDate: getTodayDateKey(),
      prescribedBy: '',
      reason: '',
      notes: '',
      status: 'active',
    },
  })

  const submitMedicationRecord = async (data: MedicationRecordFormSchema) => {
    if (submitting.current) return
    submitting.current = true
    form.clearErrors('root')
    onPendingChange?.(true)
    try {
      await onSubmit(data)
      form.reset({
        medicationName: '',
        dosage: '',
        frequency: '',
        startDate: getTodayDateKey(),
        prescribedBy: '',
        reason: '',
        notes: '',
        status: 'active',
      })
    } catch {
      form.setError('root', {
        message:
          'Could not save this record. Your entries are still here; please try again.',
      })
    } finally {
      submitting.current = false
      onPendingChange?.(false)
    }
  }

  return (
    <InlineForm onSubmit={form.handleSubmit(submitMedicationRecord)}>
      <FormGroup
        title="Course details"
        description="Record what is being given, how often, and for how long."
      >
        <Controller
          name="medicationName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Medication
              </FieldLabel>
              <Input
                aria-required={[
                  'title',
                  'medicationName',
                  'dosage',
                  'startDate',
                ].includes(field.name)}
                {...field}
                id={`${formId}-${field.name}`}
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                placeholder="Bute, antibiotics, supplement course..."
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError
                  id={`${formId}-${field.name}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />

        <FieldGrid breakpoint="sm">
          <Controller
            name="dosage"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Dosage
                </FieldLabel>
                <Input
                  aria-required={[
                    'title',
                    'medicationName',
                    'dosage',
                    'startDate',
                  ].includes(field.name)}
                  {...field}
                  id={`${formId}-${field.name}`}
                  disabled={disabled || form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `${formId}-${field.name}-error`
                      : undefined
                  }
                  placeholder="1 sachet, 10 ml, as directed..."
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError
                    id={`${formId}-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="frequency"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Frequency (optional)
                </FieldLabel>
                <Input
                  aria-required={[
                    'title',
                    'medicationName',
                    'dosage',
                    'startDate',
                  ].includes(field.name)}
                  {...field}
                  id={`${formId}-${field.name}`}
                  disabled={disabled || form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `${formId}-${field.name}-error`
                      : undefined
                  }
                  placeholder="Twice daily"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError
                    id={`${formId}-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </FieldGrid>

        <FieldGrid breakpoint="sm">
          <Controller
            name="startDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Start date
                </FieldLabel>
                <Input
                  aria-required={[
                    'title',
                    'medicationName',
                    'dosage',
                    'startDate',
                  ].includes(field.name)}
                  {...field}
                  id={`${formId}-${field.name}`}
                  type="date"
                  disabled={disabled || form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `${formId}-${field.name}-error`
                      : undefined
                  }
                />
                {fieldState.invalid && (
                  <FieldError
                    id={`${formId}-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="endDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  End date (optional)
                </FieldLabel>
                <Input
                  aria-required={[
                    'title',
                    'medicationName',
                    'dosage',
                    'startDate',
                  ].includes(field.name)}
                  id={`${formId}-${field.name}`}
                  ref={field.ref}
                  name={field.name}
                  type="date"
                  value={field.value ?? ''}
                  disabled={disabled || form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `${formId}-${field.name}-error`
                      : undefined
                  }
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.value)}
                />
                {fieldState.invalid && (
                  <FieldError
                    id={`${formId}-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </FieldGrid>

        <Controller
          name="status"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Status</FieldLabel>
              <ChoiceButtonGroup
                aria-label="Status"
                value={field.value}
                options={medicationStatusOptions}
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                onValueChange={(value) =>
                  field.onChange(asMedicationStatus(value))
                }
              />
              {fieldState.invalid && (
                <FieldError
                  id={`${formId}-${field.name}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
      </FormGroup>

      <FormGroup
        title="Clinical context"
        description="Add the prescriber, reason, and any safety or follow-up notes."
      >
        <FieldGrid>
          <Controller
            name="prescribedBy"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Prescribed by (optional)
                </FieldLabel>
                <Input
                  aria-required={[
                    'title',
                    'medicationName',
                    'dosage',
                    'startDate',
                  ].includes(field.name)}
                  {...field}
                  id={`${formId}-${field.name}`}
                  disabled={disabled || form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `${formId}-${field.name}-error`
                      : undefined
                  }
                  placeholder="Vet or clinic name"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError
                    id={`${formId}-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </FieldGrid>

        <FieldGrid>
          <Controller
            name="reason"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Reason (optional)
                </FieldLabel>
                <Textarea
                  {...field}
                  id={`${formId}-${field.name}`}
                  disabled={disabled || form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `${formId}-${field.name}-error`
                      : undefined
                  }
                  placeholder="Why this medication is being given..."
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError
                    id={`${formId}-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="notes"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Notes (optional)
                </FieldLabel>
                <Textarea
                  {...field}
                  id={`${formId}-${field.name}`}
                  disabled={disabled || form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `${formId}-${field.name}-error`
                      : undefined
                  }
                  placeholder="Administration notes, side effects, withdrawal period..."
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError
                    id={`${formId}-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </FieldGrid>
      </FormGroup>

      <FormSubmissionError message={form.formState.errors.root?.message} />

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting}
        disabled={disabled}
        submitLabel="Add medication"
        submittingLabel="Adding..."
      />
    </InlineForm>
  )
}
