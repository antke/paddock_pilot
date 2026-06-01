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
import { Textarea } from '#/components/ui/textarea'
import { Controller, type Control } from 'react-hook-form'
import type { StableFormSchema } from './stableFormSchema'

type Props = {
  control: Control<StableFormSchema>
  disabled?: boolean
}

export function StableFormFields({ control, disabled = false }: Props) {
  return (
    <Tabs defaultValue="basics">
      <TabsList>
        <TabsTrigger value="basics">Basics</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
      </TabsList>

      <TabsContent keepMounted value="basics" className="flex flex-col gap-4">
        <FieldSet>
          <FieldLegend>Stable basics</FieldLegend>

          <FieldGroup>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Stable name</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Wild Unicorn Ranch"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>
      </TabsContent>

      <TabsContent keepMounted value="about" className="flex flex-col gap-4">
        <FieldSet>
          <FieldLegend>Stable profile</FieldLegend>

          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center gap-1">
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <FormHelpTooltip label="About stable description">
                    Description is optional. Use it for notes that help identify
                    the stable.
                  </FormHelpTooltip>
                </div>

                <Textarea
                  {...field}
                  id={field.name}
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  placeholder="Share something about the stable"
                  autoComplete="off"
                  className="min-h-m"
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
