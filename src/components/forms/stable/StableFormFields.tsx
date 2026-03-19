import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Controller, type Control } from 'react-hook-form'
import type { StableFormSchema } from './stableFormSchema'

type Props = {
  control: Control<StableFormSchema>
  disabled?: boolean
}

export function StableFormFields({ control, disabled = false }: Props) {
  return (
    <>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Stable Name</FieldLabel>

            <Input
              {...field}
              id={field.name}
              type="text"
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              placeholder="Wild Unicorn Ranch"
              autoComplete="off"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="location"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Address</FieldLabel>

            <Input
              {...field}
              id={field.name}
              type="text"
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              placeholder="Sunshine Street 123"
              autoComplete="off"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Description</FieldLabel>

            <Textarea
              {...field}
              id={field.name}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              placeholder="Share something about the stable"
              autoComplete="off"
              className="min-h-m"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  )
}
