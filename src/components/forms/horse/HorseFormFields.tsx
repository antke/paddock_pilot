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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Controller, type Control } from 'react-hook-form'
import type { HorseFormSchema } from './horseFormSchema'

type Props = {
  control: Control<HorseFormSchema>
  disabled?: boolean
}

export function HorseFormFields({ control, disabled = false }: Props) {
  return (
    <Tabs defaultValue="basics">
      <TabsList>
        <TabsTrigger value="basics">Basics</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>

      <TabsContent keepMounted value="basics" className="flex flex-col gap-4">
        <FieldSet>
          <FieldLegend>Horse basics</FieldLegend>

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

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
      </TabsContent>

      <TabsContent keepMounted value="details" className="flex flex-col gap-4">
        <FieldSet>
          <FieldLegend>Horse details</FieldLegend>

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

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldSet>
      </TabsContent>
    </Tabs>
  )
}
