import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import {
  weightRecordFormSchema,
  weightUnits
  
  
} from 'shared/horses/weightRecordSchema'
import type {WeightRecordFormSchema, WeightUnit} from 'shared/horses/weightRecordSchema';

type WeightRecordFormProps = {
  disabled?: boolean
  onSubmit: (data: WeightRecordFormSchema) => Promise<void>
}

const weightUnitLabels = {
  kg: 'kg',
  lb: 'lb',
} satisfies Record<WeightUnit, string>

const todayDateKey = () => new Date().toISOString().slice(0, 10)

const asWeightUnit = (value: string) => value as WeightUnit

export function WeightRecordForm({
  disabled = false,
  onSubmit,
}: WeightRecordFormProps) {
  const form = useForm<WeightRecordFormSchema>({
    resolver: zodResolver(weightRecordFormSchema),
    mode: 'onTouched',
    defaultValues: {
      unit: 'kg',
      measuredDate: todayDateKey(),
      notes: '',
    },
  })

  const submitWeightRecord = async (data: WeightRecordFormSchema) => {
    await onSubmit(data)
    form.reset({
      unit: data.unit,
      measuredDate: todayDateKey(),
      notes: '',
    })
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(submitWeightRecord)}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Controller
          name="weight"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Weight</FieldLabel>
              <Input
                id={field.name}
                type="number"
                min="0"
                step="0.1"
                value={field.value ?? ''}
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                placeholder="520"
                onBlur={field.onBlur}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === '' ? undefined : Number(event.target.value),
                  )
                }
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="unit"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Unit</FieldLabel>
              <ToggleGroup
                type="single"
                value={field.value}
                onValueChange={(value) => value && field.onChange(asWeightUnit(value))}
                variant="outline"
                className="justify-start"
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
              >
                {weightUnits.map((unit) => (
                  <ToggleGroupItem key={unit} value={unit}>
                    {weightUnitLabels[unit]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="measuredDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Measured date</FieldLabel>
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
        name="bodyConditionScore"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Body condition score</FieldLabel>
            <Input
              id={field.name}
              type="number"
              min="1"
              max="9"
              step="0.5"
              value={field.value ?? ''}
              disabled={disabled || form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
              placeholder="Optional, 1-9"
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(
                  event.target.value === '' ? undefined : Number(event.target.value),
                )
              }
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

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
              placeholder="Tape method, body condition notes, feed context..."
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={disabled || form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Adding...' : 'Add weight record'}
        </Button>
      </div>
    </form>
  )
}
