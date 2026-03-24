import { Controller, type Control } from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '#/components/ui/field'
import type { HorseFormSchema } from './horseFormSchema'
import { Input } from '#/components/ui/input'

type Props = {
  control: Control<HorseFormSchema>
  disabled?: boolean
}

export function HorseFormFields({ control, disabled = false }: Props) {
  return (
    <>
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Horse Name</FieldLabel>

            <Input
              {...field}
              id={field.name}
              type="text"
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              placeholder="Secretariat"
              autoComplete="off"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="age"
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Horse Age</FieldLabel>

            <Input
              {...field}
              id={field.name}
              type="number"
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              autoComplete="off"
              onChange={(e) => {
                const val = e.target.value
                field.onChange(val === '' ? undefined : e.target.valueAsNumber)
              }}
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="breed"
        control={control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel>Breed</FieldLabel>

            <Input
              {...field}
              id={field.name}
              type="text"
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              placeholder="Paint"
              autoComplete="off"
            />

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  )
}
