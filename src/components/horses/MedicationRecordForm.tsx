import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useT } from '#/i18n/LocaleProvider'
import { useId, useRef, useState } from 'react'
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
  createMedicationRecordSchemas,
  medicationRecordStatuses,
} from 'shared/horses/medicationRecordSchema'
import type {
  MedicationRecordFormInput,
  MedicationRecordFormSchema,
  MedicationRecordStatus,
} from 'shared/horses/medicationRecordSchema'

type MedicationRecordFormProps = {
  disabled?: boolean
  onPendingChange?: (pending: boolean) => void
  onSubmit: (data: MedicationRecordFormSchema) => Promise<void>
}

const asMedicationStatus = (value: string) => value as MedicationRecordStatus

export function MedicationRecordForm({
  disabled = false,
  onPendingChange,
  onSubmit,
}: MedicationRecordFormProps) {
  const t = useT()

  const { medicationRecordFormSchema } = createMedicationRecordSchemas((key) =>
    t(`careValidation.${key}`),
  )
  const medicationStatusOptions = medicationRecordStatuses.map((status) => ({
    value: status,
    label: t(`careLabels.medicationStatus.${status}`),
  }))
  const formId = useId()

  const submitting = useRef(false)
  const [failed, setFailed] = useState(false)
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

  useLocalizedValidation(form)

  const submitMedicationRecord = async (data: MedicationRecordFormSchema) => {
    if (submitting.current) return
    submitting.current = true
    setFailed(false)
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
      setFailed(true)
    } finally {
      submitting.current = false
      onPendingChange?.(false)
    }
  }

  return (
    <InlineForm noValidate onSubmit={form.handleSubmit(submitMedicationRecord)}>
      <FormGroup
        title={t('careRecords.courseDetails')}
        description={t('careRecords.courseHelp')}
      >
        <Controller
          name="medicationName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                {t('careRecords.medicationField')}
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
                placeholder={t('careRecords.medicationExample')}
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
                  {t('careRecords.dosage')}
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
                  placeholder={t('careRecords.dosageExample')}
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
                  {t('careRecords.frequencyOptional')}
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
                  placeholder={t('careRecords.frequencyExample')}
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
                  {t('careRecords.startDate')}
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
                  {t('careRecords.endDateOptional')}
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
              <FieldLabel>{t('careRecords.status')}</FieldLabel>
              <ChoiceButtonGroup
                aria-label={t('careRecords.status')}
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
        title={t('careRecords.clinicalContext')}
        description={t('careRecords.clinicalHelp')}
      >
        <FieldGrid>
          <Controller
            name="prescribedBy"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  {t('careRecords.prescriberOptional')}
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
                  placeholder={t('careRecords.prescriberExample')}
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
                  {t('careRecords.reasonOptional')}
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
                  placeholder={t('careRecords.reasonExample')}
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
                  {t('careRecords.notesOptional')}
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
                  placeholder={t('careRecords.medicationNotesExample')}
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

      <FormSubmissionError
        message={failed ? t('careRecords.saveFailed') : undefined}
      />

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting}
        disabled={disabled}
        submitLabel={t('careRecords.addMedication')}
        submittingLabel={t('careRecords.adding')}
      />
    </InlineForm>
  )
}
