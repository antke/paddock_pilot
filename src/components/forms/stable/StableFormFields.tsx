import { useT } from '#/i18n/LocaleProvider'
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
import { PersonNameField } from '#/components/forms/PersonNameField'
import { Textarea } from '#/components/ui/textarea'
import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { StableFormSchema } from './stableFormSchema'

/**
 * Focused stable edits open only the fields their section shows, so the pencil
 * on "Yard information" or "Yard contacts" leads straight to those fields.
 */
export const stableFormSections = {
  information: [
    'location',
    'addressLine1',
    'addressLine2',
    'postcode',
    'country',
    'openingHours',
    'yardRules',
    'description',
  ],
  contacts: ['contactName', 'contactPhone', 'emergencyPhone'],
} as const satisfies Record<string, ReadonlyArray<keyof StableFormSchema>>

export type StableFormSection = keyof typeof stableFormSections

type Props = {
  /** Render only one focused section's fields; the full form otherwise. */
  section?: StableFormSection
  headingLevel?: 2 | 3 | 4
  control: Control<StableFormSchema>
  disabled?: boolean
  stableId?: string
}

export function StableFormFields({
  control,
  disabled = false,
  headingLevel = 3,
  stableId,
  section,
}: Props) {
  const t = useT()
  const visible: ReadonlyArray<string> | undefined = section
    ? stableFormSections[section]
    : undefined
  const show = (field: keyof StableFormSchema) =>
    !visible || visible.includes(field)

  return (
    <div className="grid gap-8">
      {(show('name') || show('location')) && (
        <FormGroup
          headingLevel={headingLevel}
          title={t('stables.basics')}
          description={t('stables.basicsHelp')}
        >
          <FieldGrid>
            {show('name') && (
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('stables.name')}
                    </FieldLabel>

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
                      placeholder={t('stables.nameExample')}
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
            )}
            {show('location') && (
              <Controller
                name="location"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('stables.location')}
                    </FieldLabel>

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
                      placeholder={t('stables.locationPlaceholder')}
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
            )}
          </FieldGrid>
        </FormGroup>
      )}

      {(show('addressLine1') ||
        show('addressLine2') ||
        show('postcode') ||
        show('country')) && (
        <FormGroup
          headingLevel={headingLevel}
          title={t('stables.postalAddress')}
          description={t('stables.addressHelp')}
        >
          <FieldGrid>
            {show('addressLine1') && (
              <Controller
                name="addressLine1"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('stables.addressLine1')}
                    </FieldLabel>

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
                      placeholder={t('stables.addressLine1Placeholder')}
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
            )}
            {show('addressLine2') && (
              <Controller
                name="addressLine2"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('stables.addressLine2')}
                    </FieldLabel>

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
                      placeholder={t('stables.addressLine2Placeholder')}
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
            )}
          </FieldGrid>

          <FieldGrid>
            {show('postcode') && (
              <Controller
                name="postcode"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('stables.postcode')}
                    </FieldLabel>

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
                      placeholder={t('stables.postcode')}
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
            )}

            {show('country') && (
              <Controller
                name="country"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('stables.country')}
                    </FieldLabel>

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
                      placeholder={t('stables.country')}
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
            )}
          </FieldGrid>
        </FormGroup>
      )}

      {show('description') && (
        <FormGroup
          headingLevel={headingLevel}
          title={t('stables.profile')}
          description={t('stables.profileHelp')}
        >
          {show('description') && (
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabelRow>
                    <FieldLabel htmlFor={field.name}>
                      {t('stables.description')}
                    </FieldLabel>
                    <FormHelpTooltip label={t('stables.descriptionAbout')}>
                      {t('stables.descriptionHelp')}
                    </FormHelpTooltip>
                  </FieldLabelRow>

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
                    placeholder={t('stables.descriptionPlaceholder')}
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
          )}
        </FormGroup>
      )}

      {(show('contactName') ||
        show('contactPhone') ||
        show('emergencyPhone') ||
        show('openingHours') ||
        show('yardRules')) && (
        <FormGroup
          headingLevel={headingLevel}
          title={t('stables.operations')}
          description={t('stables.operationsHelp')}
        >
          <FieldGrid>
            {show('contactName') && (
              <Controller
                name="contactName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('stables.contactName')}
                    </FieldLabel>

                    <PersonNameField
                      aria-label={t('stables.contactName')}
                      inputRef={field.ref}
                      name={field.name}
                      value={field.value ?? ''}
                      onBlur={field.onBlur}
                      onValueChange={field.onChange}
                      scope={{ stableId }}
                      id={field.name}
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid
                          ? `stable-${field.name}-error`
                          : undefined
                      }
                      placeholder={t('stables.yardManager')}
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
            )}

            {show('contactPhone') && (
              <Controller
                name="contactPhone"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('stables.contactPhone')}
                    </FieldLabel>

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
            )}
          </FieldGrid>

          <FieldGrid>
            {show('emergencyPhone') && (
              <Controller
                name="emergencyPhone"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('stables.emergencyPhone')}
                    </FieldLabel>

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
                      placeholder={t('stables.emergencyPlaceholder')}
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
            )}
          </FieldGrid>

          <FieldGrid>
            {show('openingHours') && (
              <Controller
                name="openingHours"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('stables.openingHours')}
                    </FieldLabel>

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
                      placeholder={t('stables.openingHoursPlaceholder')}
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
            )}
            {show('yardRules') && (
              <Controller
                name="yardRules"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('stables.yardRules')}
                    </FieldLabel>

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
                      placeholder={t('stables.yardRulesPlaceholder')}
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
            )}
          </FieldGrid>
        </FormGroup>
      )}
    </div>
  )
}
