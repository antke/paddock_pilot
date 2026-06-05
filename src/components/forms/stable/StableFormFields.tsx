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
import { Controller  } from 'react-hook-form'
import type {Control} from 'react-hook-form';
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
        <TabsTrigger value="address">Address</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="operations">Operations</TabsTrigger>
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

      <TabsContent keepMounted value="address" className="flex flex-col gap-4">
        <FieldSet>
          <FieldLegend>Postal address</FieldLegend>

          <FieldGroup>
            <Controller
              name="addressLine1"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Address line 1</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Yard name or street address"
                    autoComplete="address-line1"
                  />

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="addressLine2"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Address line 2</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Village, town, or county"
                    autoComplete="address-line2"
                  />

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="postcode"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Postcode</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="text"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      placeholder="Postcode"
                      autoComplete="postal-code"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="country"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Country</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="text"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      placeholder="Country"
                      autoComplete="country-name"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
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

      <TabsContent keepMounted value="operations" className="flex flex-col gap-4">
        <FieldSet>
          <FieldLegend>Operational contacts</FieldLegend>

          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="contactName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Contact name</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="text"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      placeholder="Yard manager"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="contactPhone"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Contact phone</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="tel"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      placeholder="+48 123 456 789"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="emergencyPhone"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Emergency phone</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="tel"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Emergency stable contact"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="openingHours"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Opening hours</FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Weekdays 7:00-20:00, weekends by arrangement"
                    autoComplete="off"
                    className="min-h-m"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="yardRules"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Yard rules</FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Shared rules for visiting, turnout, gates, equipment, or parking"
                    autoComplete="off"
                    className="min-h-m"
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
    </Tabs>
  )
}
