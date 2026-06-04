import { FormHelpTooltip } from '#/components/forms/FormHelpTooltip'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Controller, type Control } from 'react-hook-form'
import type { HorseFormSchema } from './horseFormSchema'

type Props = {
  control: Control<HorseFormSchema>
  disabled?: boolean
}

export function HorseFormFields({ control, disabled = false }: Props) {
  return (
    <FieldSet>
      <FieldLegend>Horse information</FieldLegend>

      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Horse name</FieldLabel>

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
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Horse age</FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="number"
                min={1}
                max={100}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                onChange={(e) => {
                  const val = e.target.value
                  field.onChange(
                    val === '' ? undefined : e.target.valueAsNumber,
                  )
                }}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="ownerName"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Owner name</FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="text"
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                placeholder="Penny Chenery"
                autoComplete="off"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="breed"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-1">
                <FieldLabel htmlFor={field.name}>Breed</FieldLabel>
                <FormHelpTooltip label="About horse breed">
                  Breed is optional. Leave it empty if you do not track it.
                </FormHelpTooltip>
              </div>

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

        <Controller
          name="profileImage"
          control={control}
          render={({ field: { name, onBlur, onChange, ref } }) => (
            <Field>
              <div className="flex items-center gap-1">
                <FieldLabel htmlFor={name}>Profile picture</FieldLabel>
                <FormHelpTooltip label="About horse profile picture">
                  Upload an optional image to show on horse cards.
                </FormHelpTooltip>
              </div>

              <Input
                id={name}
                name={name}
                type="file"
                accept="image/*"
                disabled={disabled}
                autoComplete="off"
                ref={ref}
                onBlur={onBlur}
                onChange={(event) => onChange(event.target.files)}
              />
            </Field>
          )}
        />
      </FieldGroup>
    </FieldSet>
  )
}
