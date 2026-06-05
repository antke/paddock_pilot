import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Doc } from 'convex/_generated/dataModel'
import { Controller, useForm } from 'react-hook-form'
import {
  nutritionLogFormSchema
  
} from 'shared/horses/nutritionLogSchema'
import type {NutritionLogFormSchema} from 'shared/horses/nutritionLogSchema';

type NutritionLogFormProps = {
  disabled?: boolean
  horse: Doc<'horses'>
  onSubmit: (data: NutritionLogFormSchema) => Promise<void>
}

const todayDateKey = () => new Date().toISOString().slice(0, 10)

const toTextareaValue = (items: Array<string> | undefined) => items?.join('\n') ?? ''

const toStringList = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

const getDefaults = (horse: Doc<'horses'>): NutritionLogFormSchema => ({
  changedDate: todayDateKey(),
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
  const form = useForm<NutritionLogFormSchema>({
    resolver: zodResolver(nutritionLogFormSchema),
    mode: 'onTouched',
    defaultValues: getDefaults(horse),
  })

  const submitNutritionLog = async (data: NutritionLogFormSchema) => {
    await onSubmit(data)
    form.reset(getDefaults(horse))
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(submitNutritionLog)}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="feedingRoutineSnapshot"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Feeding routine snapshot</FieldLabel>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="recommendedSnapshot"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Recommended after change</FieldLabel>
              <Textarea
                id={field.name}
                name={field.name}
                value={toTextareaValue(field.value)}
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                placeholder="One item per line"
                autoComplete="off"
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(toStringList(event.target.value))}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                onChange={(event) => field.onChange(toStringList(event.target.value))}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

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

      <div className="flex justify-end">
        <Button type="submit" disabled={disabled || form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Adding...' : 'Add nutrition log'}
        </Button>
      </div>
    </form>
  )
}
