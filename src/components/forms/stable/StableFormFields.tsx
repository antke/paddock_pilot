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
  const t = useT()

  return (
    <div className="grid gap-8">
      <FormGroup
        headingLevel={headingLevel}
        title={t('stables.basics')}
        description={t('stables.basicsHelp')}
      >
        <FieldGrid>
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
        </FieldGrid>
      </FormGroup>

      <FormGroup
        headingLevel={headingLevel}
        title={t('stables.postalAddress')}
        description={t('stables.addressHelp')}
      >
        <FieldGrid>
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
        </FieldGrid>

        <FieldGrid>
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
        </FieldGrid>
      </FormGroup>

      <FormGroup
        headingLevel={headingLevel}
        title={t('stables.profile')}
        description={t('stables.profileHelp')}
      >
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
                  fieldState.invalid ? `stable-${field.name}-error` : undefined
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
      </FormGroup>

      <FormGroup
        headingLevel={headingLevel}
        title={t('stables.operations')}
        description={t('stables.operationsHelp')}
      >
        <FieldGrid>
          <Controller
            name="contactName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t('stables.contactName')}
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
        </FieldGrid>

        <FieldGrid>
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
        </FieldGrid>

        <FieldGrid>
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
        </FieldGrid>
      </FormGroup>
    </div>
  )
}
