import { FormGroup, InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { Field, FieldError, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { getTodayDateKey } from '#/lib/dateDisplay'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Doc } from 'convex/_generated/dataModel'
import { Controller, useForm } from 'react-hook-form'
import { useId, useRef, useState } from 'react'
import z from 'zod'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { nutritionLogFormSchema } from 'shared/horses/nutritionLogSchema'
import type { NutritionLogFormSchema } from 'shared/horses/nutritionLogSchema'

type NutritionLogFormProps = {
  disabled?: boolean
  onPendingChange?: (pending: boolean) => void
  horse: Doc<'horses'>
  onSubmit: (data: NutritionLogFormSchema) => Promise<void>
}

const toTextareaValue = (items: Array<string> | undefined) =>
  items?.join('\n') ?? ''

const toStringList = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

const nutritionListDraftSchema = z
  .string()
  .transform(toStringList)
  .superRefine((items, context) => {
    const result =
      nutritionLogFormSchema.shape.recommendedSnapshot.safeParse(items)
    if (!result.success)
      for (const issue of result.error.issues)
        context.addIssue({ code: 'custom', message: issue.message })
  })
const nutritionLogDraftSchema = nutritionLogFormSchema.extend({
  recommendedSnapshot: nutritionListDraftSchema,
  avoidSnapshot: nutritionListDraftSchema,
})
type NutritionLogDraft = z.input<typeof nutritionLogDraftSchema>
const getDefaults = (horse: Doc<'horses'>): NutritionLogDraft => ({
  changedDate: getTodayDateKey(),
  summary: '',
  feedingRoutineSnapshot: horse.feedingRoutine ?? '',
  recommendedSnapshot: toTextareaValue(horse.nutritionRecommended),
  avoidSnapshot: toTextareaValue(horse.nutritionAvoid),
  notes: '',
})

export function NutritionLogForm({
  disabled = false,
  horse,
  onSubmit,
  onPendingChange,
}: NutritionLogFormProps) {
  const formId = useId()
  const pending = useRef(false)
  const [isPending, setIsPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const form = useForm<NutritionLogDraft, unknown, NutritionLogFormSchema>({
    resolver: zodResolver(nutritionLogDraftSchema),
    mode: 'onTouched',
    defaultValues: getDefaults(horse),
  })

  const submitNutritionLog = async (data: NutritionLogFormSchema) => {
    if (pending.current || disabled) return
    pending.current = true
    setIsPending(true)
    setFailed(false)
    onPendingChange?.(true)
    try {
      await onSubmit(data)
      form.reset(getDefaults(horse))
    } catch {
      setFailed(true)
    } finally {
      pending.current = false
      setIsPending(false)
      onPendingChange?.(false)
    }
  }

  return (
    <InlineForm onSubmit={form.handleSubmit(submitNutritionLog)}>
      <FormGroup
        title="Change"
        description="Summarise what changed and when the new plan started."
      >
        <FieldGrid breakpoint="sm" template="trailing-md">
          <Controller
            name="summary"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Change summary
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-${field.name}`}
                  disabled={
                    disabled || form.formState.isSubmitting || isPending
                  }
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `${formId}-${field.name}-error`
                      : undefined
                  }
                  placeholder="Moved to soaked hay only"
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
            name="changedDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Changed date
                </FieldLabel>
                <Input
                  {...field}
                  id={`${formId}-${field.name}`}
                  type="date"
                  disabled={
                    disabled || form.formState.isSubmitting || isPending
                  }
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
        </FieldGrid>
      </FormGroup>

      <FormGroup
        title="Historical plan snapshot"
        description="This adds a history entry only. It does not change the horse’s current feeding plan."
      >
        <Controller
          name="feedingRoutineSnapshot"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                Feeding routine snapshot
              </FieldLabel>
              <Textarea
                {...field}
                id={`${formId}-${field.name}`}
                disabled={disabled || form.formState.isSubmitting || isPending}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                placeholder="The routine after this change..."
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
            name="recommendedSnapshot"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Recommended after change
                </FieldLabel>
                <Textarea
                  ref={field.ref}
                  id={`${formId}-${field.name}`}
                  name={field.name}
                  value={field.value}
                  disabled={
                    disabled || form.formState.isSubmitting || isPending
                  }
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `${formId}-${field.name}-error`
                      : undefined
                  }
                  placeholder="One item per line"
                  autoComplete="off"
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

          <Controller
            name="avoidSnapshot"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  Avoid after change
                </FieldLabel>
                <Textarea
                  ref={field.ref}
                  id={`${formId}-${field.name}`}
                  name={field.name}
                  value={field.value}
                  disabled={
                    disabled || form.formState.isSubmitting || isPending
                  }
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `${formId}-${field.name}-error`
                      : undefined
                  }
                  placeholder="One item per line"
                  autoComplete="off"
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
                  fieldState.invalid
                    ? `${formId}-${field.name}-error`
                    : undefined
                }
                placeholder="Why it changed, what to monitor, transition details..."
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
      </FormGroup>

      <FormSubmissionError
        message={
          failed
            ? 'Could not add this nutrition log. Your notes are still here. Please try again.'
            : undefined
        }
      />

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting || isPending}
        disabled={disabled}
        submitLabel="Add nutrition log"
        submittingLabel="Adding..."
      />
    </InlineForm>
  )
}
