import { FormGroup, InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { Field, FieldError, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { getTodayDateKey } from '#/lib/dateDisplay'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Doc } from 'convex/_generated/dataModel'
import { Controller, useForm } from 'react-hook-form'
import { nutritionLogFormSchema } from 'shared/horses/nutritionLogSchema'
import type {
  NutritionLogFormInput,
  NutritionLogFormSchema,
} from 'shared/horses/nutritionLogSchema'

type NutritionLogFormProps = {
  disabled?: boolean
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

const getDefaults = (horse: Doc<'horses'>): NutritionLogFormSchema => ({
  changedDate: getTodayDateKey(),
  summary: '',
  feedingRoutineSnapshot: horse.feedingRoutine ?? '',
  recommendedSnapshot: horse.nutritionRecommended ?? [],
  avoidSnapshot: horse.nutritionAvoid ?? [],
  notes: '',
})

export function NutritionLogForm({
  disabled = false,
  horse,
  onSubmit,
}: NutritionLogFormProps) {
  const form = useForm<
    NutritionLogFormInput,
    unknown,
    NutritionLogFormSchema
  >({
    resolver: zodResolver(nutritionLogFormSchema),
    mode: 'onTouched',
    defaultValues: getDefaults(horse),
  })

  const submitNutritionLog = async (data: NutritionLogFormSchema) => {
    await onSubmit(data)
    form.reset(getDefaults(horse))
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
                <FieldLabel htmlFor={field.name}>Change summary</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  disabled={disabled || form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                  placeholder="Moved to soaked hay only"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="changedDate"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Changed date</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="date"
                  disabled={disabled || form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGrid>
      </FormGroup>

      <FormGroup
        title="Updated plan"
        description="Capture the complete feeding plan after this change."
      >
        <Controller
          name="feedingRoutineSnapshot"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Feeding routine snapshot
              </FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                placeholder="The routine after this change..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <FieldGrid breakpoint="sm">
          <Controller
            name="recommendedSnapshot"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Recommended after change
                </FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={toTextareaValue(field.value)}
                  disabled={disabled || form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                  placeholder="One item per line"
                  autoComplete="off"
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(toStringList(event.target.value))
                  }
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="avoidSnapshot"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Avoid after change</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={toTextareaValue(field.value)}
                  disabled={disabled || form.formState.isSubmitting}
                  aria-invalid={fieldState.invalid}
                  placeholder="One item per line"
                  autoComplete="off"
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(toStringList(event.target.value))
                  }
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
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
              <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                placeholder="Why it changed, what to monitor, transition details..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FormGroup>

      <FormSubmitActions
        isSubmitting={form.formState.isSubmitting}
        disabled={disabled}
        submitLabel="Add nutrition log"
        submittingLabel="Adding..."
      />
    </InlineForm>
  )
}
