import { FormHelpTooltip } from '#/components/forms/FormHelpTooltip'
import { FormGroup } from '#/components/forms/FormLayout'
import {
  Field,
  FieldError,
  FieldGrid,
  FieldLabel,
  FieldLabelRow,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { StableFormSchema } from './stableFormSchema'

type Props = {
  headingLevel?: 2 | 3 | 4
  control: Control<StableFormSchema>
  disabled?: boolean
}

export function StableFormFields({
  control,
  disabled = false,
  headingLevel = 3,
}: Props) {
  return (
    <div className="grid gap-8">
      <FormGroup
        headingLevel={headingLevel}
        title="Stable basics"
        description="Stable name and location are required. All other details are optional."
      >
        <FieldGrid>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Stable name</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  aria-required="true"
                  type="text"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `stable-${field.name}-error`
                      : undefined
                  }
                  placeholder="Cedar Ridge Barn"
                  autoComplete="off"
                />

                {fieldState.invalid && (
                  <FieldError
                    id={`stable-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
          <Controller
            name="location"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Location</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  aria-required="true"
                  type="text"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid
                      ? `stable-${field.name}-error`
                      : undefined
                  }
                  placeholder="Town, area, or familiar yard location"
                  autoComplete="off"
                />

                {fieldState.invalid && (
                  <FieldError
                    id={`stable-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </FieldGrid>
      </FormGroup>

      <FormGroup
        headingLevel={headingLevel}
        title="Postal address"
        description="Use the complete address for documents, visits, and directions."
      >
        <FieldGrid>
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
                  aria-describedby={
                    fieldState.invalid
                      ? `stable-${field.name}-error`
                      : undefined
                  }
                  placeholder="Yard name or street address"
                  autoComplete="address-line1"
                />

                {fieldState.invalid && (
                  <FieldError
                    id={`stable-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
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
                  aria-describedby={
                    fieldState.invalid
                      ? `stable-${field.name}-error`
                      : undefined
                  }
                  placeholder="Village, town, or county"
                  autoComplete="address-line2"
                />

                {fieldState.invalid && (
                  <FieldError
                    id={`stable-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </FieldGrid>

        <FieldGrid>
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
                  aria-describedby={
                    fieldState.invalid
                      ? `stable-${field.name}-error`
                      : undefined
                  }
                  placeholder="Postcode"
                  autoComplete="postal-code"
                />

                {fieldState.invalid && (
                  <FieldError
                    id={`stable-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
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
                  aria-describedby={
                    fieldState.invalid
                      ? `stable-${field.name}-error`
                      : undefined
                  }
                  placeholder="Country"
                  autoComplete="country-name"
                />

                {fieldState.invalid && (
                  <FieldError
                    id={`stable-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </FieldGrid>
      </FormGroup>

      <FormGroup
        headingLevel={headingLevel}
        title="Stable profile"
        description="Add optional context that helps members recognise the yard."
      >
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabelRow>
                <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                <FormHelpTooltip label="About stable description">
                  Description is optional. Use it for notes that help identify
                  the stable.
                </FormHelpTooltip>
              </FieldLabelRow>

              <Textarea
                {...field}
                id={field.name}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid ? `stable-${field.name}-error` : undefined
                }
                placeholder="Share something about the stable"
                autoComplete="off"
                minHeight="relaxed"
              />

              {fieldState.invalid && (
                <FieldError
                  id={`stable-${field.name}-error`}
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
      </FormGroup>

      <FormGroup
        headingLevel={headingLevel}
        title="Operations"
        description="Keep the everyday and emergency contact details in one place."
      >
        <FieldGrid>
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
                  aria-describedby={
                    fieldState.invalid
                      ? `stable-${field.name}-error`
                      : undefined
                  }
                  placeholder="Yard manager"
                  autoComplete="off"
                />

                {fieldState.invalid && (
                  <FieldError
                    id={`stable-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
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
                  aria-describedby={
                    fieldState.invalid
                      ? `stable-${field.name}-error`
                      : undefined
                  }
                  placeholder="+48 123 456 789"
                  autoComplete="off"
                />

                {fieldState.invalid && (
                  <FieldError
                    id={`stable-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </FieldGrid>

        <FieldGrid>
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
                  aria-describedby={
                    fieldState.invalid
                      ? `stable-${field.name}-error`
                      : undefined
                  }
                  placeholder="Emergency stable contact"
                  autoComplete="off"
                />

                {fieldState.invalid && (
                  <FieldError
                    id={`stable-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </FieldGrid>

        <FieldGrid>
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
                  aria-describedby={
                    fieldState.invalid
                      ? `stable-${field.name}-error`
                      : undefined
                  }
                  placeholder="Weekdays 7:00-20:00, weekends by arrangement"
                  autoComplete="off"
                  minHeight="relaxed"
                />

                {fieldState.invalid && (
                  <FieldError
                    id={`stable-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
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
                  aria-describedby={
                    fieldState.invalid
                      ? `stable-${field.name}-error`
                      : undefined
                  }
                  placeholder="Shared rules for visiting, turnout, gates, equipment, or parking"
                  autoComplete="off"
                  minHeight="relaxed"
                />

                {fieldState.invalid && (
                  <FieldError
                    id={`stable-${field.name}-error`}
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </FieldGrid>
      </FormGroup>
    </div>
  )
}
