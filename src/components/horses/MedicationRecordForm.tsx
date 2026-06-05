import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import {
  medicationRecordFormSchema,
  medicationRecordStatuses
  
  
} from 'shared/horses/medicationRecordSchema'
import type {MedicationRecordFormSchema, MedicationRecordStatus} from 'shared/horses/medicationRecordSchema';

type MedicationRecordFormProps = {
  disabled?: boolean
  onSubmit: (data: MedicationRecordFormSchema) => Promise<void>
}

const medicationStatusLabels = {
  active: 'Active',
  completed: 'Completed',
} satisfies Record<MedicationRecordStatus, string>

const todayDateKey = () => new Date().toISOString().slice(0, 10)

const asMedicationStatus = (value: string) => value as MedicationRecordStatus

export function MedicationRecordForm({
  disabled = false,
  onSubmit,
}: MedicationRecordFormProps) {
  const form = useForm<MedicationRecordFormSchema>({
    resolver: zodResolver(medicationRecordFormSchema),
    mode: 'onTouched',
    defaultValues: {
      medicationName: '',
      dosage: '',
      frequency: '',
      startDate: todayDateKey(),
      prescribedBy: '',
      reason: '',
      notes: '',
      status: 'active',
    },
  })

  const submitMedicationRecord = async (data: MedicationRecordFormSchema) => {
    await onSubmit(data)
    form.reset({
      medicationName: '',
      dosage: '',
      frequency: '',
      startDate: todayDateKey(),
      prescribedBy: '',
      reason: '',
      notes: '',
      status: 'active',
    })
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(submitMedicationRecord)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="medicationName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Medication</FieldLabel>
              <Input
                {...field}
                id={field.name}
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                placeholder="Bute, antibiotics, supplement course..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="dosage"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Dosage</FieldLabel>
              <Input
                {...field}
                id={field.name}
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                placeholder="1 sachet, 10 ml, as directed..."
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Controller
          name="frequency"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Frequency</FieldLabel>
              <Input
                {...field}
                id={field.name}
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                placeholder="Twice daily"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="startDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Start date</FieldLabel>
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

        <Controller
          name="endDate"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>End date</FieldLabel>
              <Input
                id={field.name}
                type="date"
                value={field.value ?? ''}
                disabled={disabled || form.formState.isSubmitting}
                aria-invalid={fieldState.invalid}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(event.target.value)}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Controller
        name="status"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Status</FieldLabel>
            <ToggleGroup
              type="single"
              value={field.value}
              onValueChange={(value) => value && field.onChange(asMedicationStatus(value))}
              variant="outline"
              className="justify-start"
              disabled={disabled || form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
            >
              {medicationRecordStatuses.map((status) => (
                <ToggleGroupItem key={status} value={status}>
                  {medicationStatusLabels[status]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="prescribedBy"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Prescribed by</FieldLabel>
            <Input
              {...field}
              id={field.name}
              disabled={disabled || form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
              placeholder="Vet or clinic name"
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="reason"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Reason</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              disabled={disabled || form.formState.isSubmitting}
              aria-invalid={fieldState.invalid}
              placeholder="Why this medication is being given..."
              autoComplete="off"
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
              placeholder="Administration notes, side effects, withdrawal period..."
              autoComplete="off"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={disabled || form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Adding...' : 'Add medication'}
        </Button>
      </div>
    </form>
  )
}
