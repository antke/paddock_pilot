import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useT } from '#/i18n/LocaleProvider'
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
import { createNutritionLogSchemas } from 'shared/horses/nutritionLogSchema'
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

function createNutritionDraftSchema(
  nutritionLogFormSchema: ReturnType<
    typeof createNutritionLogSchemas
  >['nutritionLogFormSchema'],
) {
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

  return nutritionLogDraftSchema
}
type NutritionLogDraft = z.input<ReturnType<typeof createNutritionDraftSchema>>
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
  const t = useT()

  const { nutritionLogFormSchema } = createNutritionLogSchemas((key) =>
    t(`careValidation.${key}`),
  )
  const nutritionLogDraftSchema = createNutritionDraftSchema(
    nutritionLogFormSchema,
  )
  const formId = useId()
  const pending = useRef(false)
  const [isPending, setIsPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const form = useForm<NutritionLogDraft, unknown, NutritionLogFormSchema>({
    resolver: zodResolver(nutritionLogDraftSchema),
    mode: 'onTouched',
    defaultValues: getDefaults(horse),
  })

  useLocalizedValidation(form)

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
    <InlineForm noValidate onSubmit={form.handleSubmit(submitNutritionLog)}>
      <FormGroup
        title={t('careRecords.change')}
        description={t('careRecords.changeHelp')}
      >
        <FieldGrid breakpoint="sm" template="trailing-md">
          <Controller
            name="summary"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${formId}-${field.name}`}>
                  {t('careRecords.changeSummary')}
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
                  placeholder={t('careRecords.changeExample')}
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
                  {t('careRecords.changedDate')}
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
        title={t('careRecords.historicalSnapshot')}
        description={t('careRecords.historicalHelp')}
      >
        <Controller
          name="feedingRoutineSnapshot"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={`${formId}-${field.name}`}>
                {t('careRecords.routineSnapshot')}
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
                placeholder={t('careRecords.routineExample')}
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
                  {t('careRecords.recommendedAfter')}
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
                  placeholder={t('careRecords.onePerLine')}
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
                  {t('careRecords.avoidAfter')}
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
                  placeholder={t('careRecords.onePerLine')}
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
                {t('careRecords.notesOptional')}
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
                placeholder={t('careRecords.changeNotesExample')}
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
        message={failed ? t('careRecords.nutritionSaveFailed') : undefined}
      />

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting || isPending}
        disabled={disabled}
        submitLabel={t('careRecords.addNutrition')}
        submittingLabel={t('careRecords.adding')}
      />
    </InlineForm>
  )
}
