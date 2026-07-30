import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import { Textarea } from '#/components/ui/textarea'
import { Controller } from 'react-hook-form'
import type { Control, FieldPath } from 'react-hook-form'
import type { HorseFormInput, HorseFormSchema } from './horseFormSchema'

type HorseStringListFieldProps = {
  control: Control<HorseFormInput, unknown, HorseFormSchema>
  name: FieldPath<HorseFormInput>
  label: string
  placeholder: string
  disabled?: boolean
}

const toTextareaValue = (items: unknown) =>
  Array.isArray(items) ? items.join('\n') : ''

const toStringList = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

export function HorseStringListField({
  control,
  name,
  label,
  placeholder,
  disabled = false,
}: HorseStringListFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

          <Textarea
            id={field.name}
            name={field.name}
            value={toTextareaValue(field.value)}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
            placeholder={placeholder}
            autoComplete="off"
            onBlur={field.onBlur}
            onChange={(event) =>
              field.onChange(toStringList(event.target.value))
            }
          />

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
