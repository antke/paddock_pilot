import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { Field, FieldError, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { getTodayDateKey } from '#/lib/dateDisplay'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useId, useRef, useState } from 'react'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import {
  weightRecordFormSchema,
  weightUnits,
} from 'shared/horses/weightRecordSchema'
import type {
  WeightRecordFormInput,
  WeightRecordFormSchema,
  WeightUnit,
} from 'shared/horses/weightRecordSchema'

type WeightRecordFormProps = {
  disabled?: boolean
  onPendingChange?: (pending: boolean) => void
  onSubmit: (data: WeightRecordFormSchema) => Promise<void>
}

const weightUnitLabels = {
  kg: 'kg',
  lb: 'lb',
} satisfies Record<WeightUnit, string>

const weightUnitOptions = weightUnits.map((unit) => ({
  value: unit,
  label: weightUnitLabels[unit],
}))

const asWeightUnit = (value: string) => value as WeightUnit

export function WeightRecordForm({
  disabled = false,
  onSubmit,
  onPendingChange,
}: WeightRecordFormProps) {
  const formId = useId()
  const pending = useRef(false)
  const [isPending, setIsPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const form = useForm<WeightRecordFormInput, unknown, WeightRecordFormSchema>({
    resolver: zodResolver(weightRecordFormSchema),
    mode: 'onTouched',
    defaultValues: {
      unit: 'kg',
      measuredDate: getTodayDateKey(),
      notes: '',
    },
  })

  const submitWeightRecord = async (data: WeightRecordFormSchema) => {
    if (pending.current || disabled) return
    pending.current = true
    setIsPending(true)
    setFailed(false)
    onPendingChange?.(true)
    try {
      await onSubmit(data)
      form.reset({
        weight: undefined,
        bodyConditionScore: undefined,
        unit: data.unit,
        measuredDate: getTodayDateKey(),
        notes: '',
      })
    } catch {
      setFailed(true)
    } finally {
      pending.current = false
      setIsPending(false)
      onPendingChange?.(false)
    }
  }

  return (
    <InlineForm onSubmit={form.handleSubmit(submitWeightRecord)}>
      <FieldGrid breakpoint="sm" template="trailing-sm">
        <Controller
          name="weight"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Weight
              </FieldLabel>
              <Input
                ref={field.ref}
                name={field.name}
                id={`${formId}-${field.name}`}
                type="number"
                min="0"
                step="0.1"
                value={field.value ?? ''}
                disabled={disabled || form.formState.isSubmitting || isPending}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                placeholder="520"
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === ''
                      ? undefined
                      : Number(event.target.value),
                  )
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
          name="unit"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Unit</FieldLabel>
              <ChoiceButtonGroup
                aria-label="Weight unit"
                value={field.value}
                options={weightUnitOptions}
                disabled={disabled || form.formState.isSubmitting || isPending}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                onValueChange={(value) => field.onChange(asWeightUnit(value))}
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
          name="measuredDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Measured date
              </FieldLabel>
              <Input
                {...field}
                id={`${formId}-${field.name}`}
                type="date"
                disabled={disabled || form.formState.isSubmitting || isPending}
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
          name="bodyConditionScore"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Body condition score (optional)
              </FieldLabel>
              <Input
                ref={field.ref}
                name={field.name}
                id={`${formId}-${field.name}`}
                type="number"
                min="1"
                max="9"
                step="0.5"
                value={field.value ?? ''}
                disabled={disabled || form.formState.isSubmitting || isPending}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                placeholder="Optional, 1-9"
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === ''
                      ? undefined
                      : Number(event.target.value),
                  )
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
      </FieldGrid>

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
              disabled={disabled || form.formState.isSubmitting || isPending}
              aria-invalid={fieldState.invalid}
              aria-describedby={
                fieldState.invalid ? `${formId}-${field.name}-error` : undefined
              }
              placeholder="Tape method, body condition notes, feed context..."
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

      <FormSubmissionError
        message={
          failed
            ? 'Could not add this weight record. Your measurement is still here. Please try again.'
            : undefined
        }
      />

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting || isPending}
        disabled={disabled}
        submitLabel="Add weight record"
        submittingLabel="Adding..."
      />
    </InlineForm>
  )
}
