import { useT, useLocale } from '#/i18n/LocaleProvider'
import { getHorseBreedLabel } from 'shared/i18n/horseBreedLabels'
import { FileUploadField } from '#/components/forms/FileUploadField'
import { FormSection } from '#/components/forms/FormLayout'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGrid,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { formatMetaText } from '#/lib/textDisplay'
import {
  birthDateForHorseAge,
  calculateHorseAge,
  composeHorseBirthDate,
  splitHorseBirthDate,
} from 'shared/horses/horseAge'
import type { ReactNode, Ref } from 'react'
import { useId } from 'react'
import {
  Controller,
  useController,
  useFormState,
  useWatch,
} from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { HorseBreedAutocomplete } from './HorseBreedAutocomplete'
import { HorseStringListField } from './HorseStringListField'
import type { HorseFormInput, HorseFormSchema } from './horseFormSchema'

type Props = {
  control: Control<HorseFormInput, unknown, HorseFormSchema>
  disabled?: boolean
  existingBreed?: string
  additionalBreeds: ReadonlyArray<string>
  onAddBreed: (breed: string) => void
}

type HorseSexChoice = NonNullable<HorseFormSchema['sex']> | 'unspecified'

const toOptionalSex = (value: HorseSexChoice) =>
  value === 'unspecified' ? undefined : value

type ShoeingStatusChoice =
  NonNullable<HorseFormSchema['shoeingStatus']> | 'unspecified'

const toOptionalShoeingStatus = (value: ShoeingStatusChoice) =>
  value === 'unspecified' ? undefined : value

export function HorseFormFields({
  control,
  disabled = false,
  existingBreed,
  additionalBreeds,
  onAddBreed,
}: Props) {
  const t = useT()
  const { locale } = useLocale()

  const sexOptions = [
    { value: 'unspecified', label: t('horseForm.unspecified') },
    { value: 'mare', label: t('horseForm.mare') },
    { value: 'gelding', label: t('horseForm.gelding') },
    { value: 'stallion', label: t('horseForm.stallion') },
  ] satisfies Array<{ value: HorseSexChoice; label: string }>

  const shoeingOptions = [
    { value: 'unspecified', label: t('horseForm.unspecified') },
    { value: 'barefoot', label: t('horseForm.barefoot') },
    { value: 'front_shoes', label: t('horseForm.front_shoes') },
    { value: 'full_set', label: t('horseForm.full_set') },
  ] satisfies Array<{
    value: ShoeingStatusChoice
    label: string
  }>

  const shoeingStatusLabels = {
    barefoot: t('horseForm.barefoot'),
    front_shoes: t('horseForm.front_shoes'),
    full_set: t('horseForm.full_set'),
  } satisfies Record<NonNullable<HorseFormSchema['shoeingStatus']>, string>

  const profileImageId = useId()
  const horseName = useWatch({ control, name: 'name' })
  const ownerName = useWatch({ control, name: 'ownerName' })
  const dateOfBirth = useWatch({ control, name: 'dateOfBirth' })
  const statedAge = useWatch({ control, name: 'age' })
  const breed = useWatch({ control, name: 'breed' })
  const passportNumber = useWatch({ control, name: 'passportNumber' })
  const microchipNumber = useWatch({ control, name: 'microchipNumber' })
  const vetName = useWatch({ control, name: 'vetName' })
  const farrierName = useWatch({ control, name: 'farrierName' })
  const discipline = useWatch({ control, name: 'discipline' })
  const shoeingStatus = useWatch({ control, name: 'shoeingStatus' })
  const allergies = useWatch({ control, name: 'allergies' })
  const feedingRoutine = useWatch({ control, name: 'feedingRoutine' })
  const nutritionNotes = useWatch({ control, name: 'nutritionNotes' })
  const nutritionRecommended = useWatch({
    control,
    name: 'nutritionRecommended',
  })
  const nutritionAvoid = useWatch({ control, name: 'nutritionAvoid' })
  const { errors, submitCount } = useFormState({ control })
  const calculatedAge = dateOfBirth
    ? calculateHorseAge(dateOfBirth)
    : statedAge === ''
      ? undefined
      : statedAge

  const detailsSummary = formatMetaText([
    horseName || t('horseForm.unnamed'),
    ownerName,
    calculatedAge !== undefined && calculatedAge >= 0
      ? t('horseForm.years', { count: calculatedAge })
      : undefined,
  ])
  const careSummary =
    formatMetaText([
      passportNumber ? t('horseForm.passportAdded') : undefined,
      microchipNumber ? t('horseForm.microchipAdded') : undefined,
      vetName,
      farrierName,
    ]) || t('horseForm.optional')
  const profileSummary =
    formatMetaText([
      breed ? getHorseBreedLabel(breed, locale) : undefined,
      discipline,
      shoeingStatus ? shoeingStatusLabels[shoeingStatus] : undefined,
      allergies?.length
        ? t('horseForm.allergyCount', { count: allergies.length })
        : undefined,
    ]) || t('horseForm.optional')
  const nutritionSummary =
    feedingRoutine ||
    nutritionNotes ||
    nutritionRecommended?.length ||
    nutritionAvoid?.length
      ? t('horseForm.nutritionAdded')
      : t('horseForm.optional')
  const detailsInvalid = Boolean(
    errors.name ||
    errors.ownerName ||
    errors.dateOfBirth ||
    errors.age ||
    errors.sex ||
    errors.profileImage,
  )
  const careInvalid = Boolean(
    errors.passportNumber ||
    errors.microchipNumber ||
    errors.insuranceProvider ||
    errors.insurancePolicyNumber ||
    errors.vetName ||
    errors.vetPhone ||
    errors.farrierName ||
    errors.farrierPhone ||
    errors.emergencyNotes,
  )
  const profileInvalid = Boolean(
    errors.sire ||
    errors.dam ||
    errors.breed ||
    errors.color ||
    errors.height ||
    errors.discipline ||
    errors.shoeingStatus ||
    errors.dewormingNotes ||
    errors.allergies,
  )
  const nutritionInvalid = Boolean(
    errors.feedingRoutine ||
    errors.nutritionNotes ||
    errors.nutritionRecommended ||
    errors.nutritionAvoid,
  )

  return (
    <>
      <FormSection
        defaultOpen
        description={t('horseForm.detailsHelp')}
        invalid={detailsInvalid}
        number={1}
        summary={detailsSummary}
        title={t('horseForm.details')}
        validationAttempt={submitCount}
      >
        <FieldGroup gap="compact">
          <FieldGrid>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('horseForm.name')}
                  </FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    placeholder="Secretariat"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name="ownerName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('horseForm.owner')}
                  </FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    placeholder="Penny Chenery"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGrid>

          <BirthDateOrAgeFields control={control} disabled={disabled} />

          <FieldGrid>
            <Controller
              name="sex"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('horseForm.sex')}</FieldLabel>

                  <ChoiceButtonGroup
                    aria-label={t('horseForm.sex')}
                    value={field.value ?? 'unspecified'}
                    options={sexOptions}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    onValueChange={(value) =>
                      field.onChange(toOptionalSex(value))
                    }
                  />

                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGrid>

          <FieldGrid>
            <Controller
              name="profileImage"
              control={control}
              render={({
                field: { name, onBlur, onChange, ref, value },
                fieldState,
              }) => (
                <FileUploadField
                  id={`${profileImageId}-${name}`}
                  name={name}
                  label={t('horseForm.picture')}
                  helpLabel={t('horseForm.pictureLabel')}
                  help={t('horseForm.pictureHelp')}
                  accept="image/*"
                  kind="image"
                  width="full"
                  disabled={disabled}
                  autoComplete="off"
                  files={value ?? null}
                  controlRef={ref}
                  errors={fieldState.invalid ? [fieldState.error] : undefined}
                  onBlur={onBlur}
                  onFilesChange={onChange}
                />
              )}
            />
          </FieldGrid>
        </FieldGroup>
      </FormSection>

      <FormSection
        description={t('horseForm.careHelp')}
        invalid={careInvalid}
        number={2}
        summary={careSummary}
        title={t('horseForm.care')}
        validationAttempt={submitCount}
      >
        <FieldGroup gap="compact">
          <CareRecordRow label={t('horseForm.identification')}>
            <FieldGrid>
              <Controller
                name="passportNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('horseForm.passport')}
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      type="text"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                      placeholder={t('horseForm.passportPlaceholder')}
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError
                        id={`${field.name}-error`}
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="microchipNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('horseForm.microchip')}
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      type="text"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                      placeholder={t('horseForm.microchipPlaceholder')}
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError
                        id={`${field.name}-error`}
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />
            </FieldGrid>
          </CareRecordRow>

          <CareRecordRow label={t('horseForm.insurance')}>
            <FieldGrid>
              <Controller
                name="insuranceProvider"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('horseForm.insurer')}
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      type="text"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                      placeholder={t('horseForm.insurerPlaceholder')}
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError
                        id={`${field.name}-error`}
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="insurancePolicyNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('horseForm.policy')}
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      type="text"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                      placeholder={t('horseForm.policyPlaceholder')}
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError
                        id={`${field.name}-error`}
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />
            </FieldGrid>
          </CareRecordRow>

          <CareRecordRow label={t('horseForm.veterinary')}>
            <FieldGrid>
              <Controller
                name="vetName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('horseForm.vetName')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                      placeholder="Dr. Carter"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError
                        id={`${field.name}-error`}
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="vetPhone"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('horseForm.vetPhone')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                      placeholder="+1 555 0123"
                      autoComplete="tel"
                      type="tel"
                    />
                    {fieldState.invalid && (
                      <FieldError
                        id={`${field.name}-error`}
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />
            </FieldGrid>
          </CareRecordRow>

          <CareRecordRow label={t('horseForm.farrier')}>
            <FieldGrid>
              <Controller
                name="farrierName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('horseForm.farrierName')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                      placeholder="Alex Morgan"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError
                        id={`${field.name}-error`}
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="farrierPhone"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t('horseForm.farrierPhone')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                      placeholder="+1 555 0456"
                      autoComplete="tel"
                      type="tel"
                    />
                    {fieldState.invalid && (
                      <FieldError
                        id={`${field.name}-error`}
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />
            </FieldGrid>
          </CareRecordRow>

          <CareRecordRow label={t('horseForm.emergency')}>
            <Controller
              name="emergencyNotes"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('horseForm.emergencyNotes')}
                  </FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    placeholder={t('horseForm.emergencyPlaceholder')}
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </CareRecordRow>
        </FieldGroup>
      </FormSection>

      <FormSection
        description={t('horseForm.profileHelp')}
        invalid={profileInvalid}
        number={3}
        summary={profileSummary}
        title={t('horseForm.profile')}
        validationAttempt={submitCount}
      >
        <FieldGroup gap="compact">
          <FieldGrid>
            <Controller
              name="breed"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('horseForm.breed')}
                  </FieldLabel>

                  <HorseBreedAutocomplete
                    inputRef={field.ref}
                    existingBreed={existingBreed}
                    additionalBreeds={additionalBreeds}
                    onAddBreed={onAddBreed}
                    id={field.name}
                    name={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    invalid={fieldState.invalid}
                    describedBy={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                  />

                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="color"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('horseForm.color')}
                  </FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    type="text"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    placeholder={t('horseForm.colorPlaceholder')}
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name="height"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('horseForm.height')}
                  </FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    type="text"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    placeholder="16.1hh"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="discipline"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('horseForm.discipline')}
                  </FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    type="text"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    placeholder={t('horseForm.disciplinePlaceholder')}
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGrid>

          <FieldGrid>
            <Controller
              name="sire"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('horseForm.sire')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    placeholder={t('horseForm.sirePlaceholder')}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="dam"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('horseForm.dam')}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    placeholder={t('horseForm.damPlaceholder')}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGrid>

          <FieldGrid>
            <Controller
              name="shoeingStatus"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>{t('horseForm.shoeing')}</FieldLabel>

                  <ChoiceButtonGroup
                    aria-label={t('horseForm.shoeing')}
                    value={field.value ?? 'unspecified'}
                    options={shoeingOptions}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    onValueChange={(value) =>
                      field.onChange(toOptionalShoeingStatus(value))
                    }
                  />

                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGrid>

          <FieldGrid>
            <Controller
              name="dewormingNotes"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('horseForm.deworming')}
                  </FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    placeholder={t('horseForm.dewormingPlaceholder')}
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            <HorseStringListField
              control={control}
              name="allergies"
              label={t('horseForm.allergies')}
              placeholder={t('horseForm.allergiesPlaceholder')}
              disabled={disabled}
            />
          </FieldGrid>
        </FieldGroup>
      </FormSection>

      <FormSection
        description={t('horseForm.nutritionHelp')}
        invalid={nutritionInvalid}
        number={4}
        summary={nutritionSummary}
        title={t('horseForm.nutrition')}
        validationAttempt={submitCount}
      >
        <FieldGroup gap="compact">
          <FieldGrid>
            <Controller
              name="feedingRoutine"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('horseForm.feeding')}
                  </FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    placeholder={t('horseForm.feedingPlaceholder')}
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="nutritionNotes"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t('horseForm.nutritionNotes')}
                  </FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid ? `${field.name}-error` : undefined
                    }
                    placeholder={t('horseForm.nutritionPlaceholder')}
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGrid>

          <FieldGrid>
            <HorseStringListField
              control={control}
              name="nutritionRecommended"
              label={t('horseForm.recommended')}
              placeholder={t('horseForm.recommendedPlaceholder')}
              disabled={disabled}
            />

            <HorseStringListField
              control={control}
              name="nutritionAvoid"
              label={t('horseForm.avoid')}
              placeholder={t('horseForm.avoidPlaceholder')}
              disabled={disabled}
            />
          </FieldGrid>
        </FieldGroup>
      </FormSection>
    </>
  )
}

function BirthDateOrAgeFields({
  control,
  disabled,
}: {
  control: Control<HorseFormInput, unknown, HorseFormSchema>
  disabled: boolean
}) {
  const t = useT()

  const { field: dateField, fieldState: dateState } = useController({
    control,
    name: 'dateOfBirth',
  })
  const { field: ageField, fieldState: ageState } = useController({
    control,
    name: 'age',
  })
  const birthDate = splitHorseBirthDate(dateField.value)
  const updatePart = (part: 'year' | 'month' | 'day', input: string) => {
    const maxLength = part === 'year' ? 4 : 2
    const value = input.replace(/\D/g, '').slice(0, maxLength)
    const next = { ...birthDate, [part]: value }
    if (part === 'month' && !value) next.day = ''
    const nextDate = next.year
      ? [next.year, next.month, next.day].filter(Boolean).join('-')
      : ''
    dateField.onChange(nextDate)
    // Calculate from padded parts without changing the user's in-progress input.
    const age =
      next.year.length === 4
        ? calculateHorseAge(composeHorseBirthDate(next))
        : undefined
    ageField.onChange(age !== undefined && age >= 0 && age <= 100 ? age : '')
  }
  const dateDescription = `${dateField.name}-description${dateState.invalid ? ` ${dateField.name}-error` : ''}`

  return (
    <FieldSet>
      <FieldLegend variant="label">{t('horseForm.birthOrAge')}</FieldLegend>
      <FieldGrid breakpoint="lg" template="trailing-sm">
        <Field data-invalid={dateState.invalid}>
          <div className="grid grid-cols-[minmax(5rem,1fr)_minmax(4rem,0.7fr)_minmax(4rem,0.7fr)] gap-2">
            {(['year', 'month', 'day'] as const).map((part) => (
              <BirthDatePartInput
                key={part}
                id={`${dateField.name}-${part}`}
                label={
                  {
                    year: t('horseForm.year'),
                    month: t('horseForm.month'),
                    day: t('horseForm.day'),
                  }[part]
                }
                value={birthDate[part]}
                placeholder={{ year: '2016', month: 'MM', day: 'DD' }[part]}
                maxLength={part === 'year' ? 4 : 2}
                disabled={
                  disabled ||
                  (part === 'month' && !birthDate.year) ||
                  (part === 'day' && !birthDate.month)
                }
                invalid={dateState.invalid}
                describedBy={dateDescription}
                inputRef={part === 'year' ? dateField.ref : undefined}
                onBlur={() => {
                  if (birthDate.year.length === 4) {
                    dateField.onChange(composeHorseBirthDate(birthDate) ?? '')
                  }
                  dateField.onBlur()
                }}
                onChange={(value) => updatePart(part, value)}
              />
            ))}
          </div>
          <FieldDescription id={`${dateField.name}-description`}>
            {t('horseForm.birthHelp')}
          </FieldDescription>
          {dateState.invalid && (
            <FieldError
              id={`${dateField.name}-error`}
              errors={[dateState.error]}
            />
          )}
        </Field>
        <Field data-invalid={ageState.invalid}>
          <FieldLabel htmlFor={ageField.name}>
            {t('horseForm.currentAge')}
          </FieldLabel>
          <Input
            id={ageField.name}
            name="horse-age"
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            ref={ageField.ref}
            value={ageField.value}
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            placeholder="10"
            disabled={disabled}
            aria-invalid={ageState.invalid}
            aria-describedby={`${ageField.name}-description${ageState.invalid ? ` ${ageField.name}-error` : ''}`}
            onBlur={ageField.onBlur}
            onChange={(event) => {
              const age =
                event.target.value === '' ? '' : Number(event.target.value)
              ageField.onChange(age)
              dateField.onChange(
                age === ''
                  ? ''
                  : birthDateForHorseAge(age, composeHorseBirthDate(birthDate)),
              )
            }}
          />
          <FieldDescription id={`${ageField.name}-description`}>
            {t('horseForm.ageHelp')}
          </FieldDescription>
          {ageState.invalid && (
            <FieldError
              id={`${ageField.name}-error`}
              errors={[ageState.error]}
            />
          )}
        </Field>
      </FieldGrid>
    </FieldSet>
  )
}

function BirthDatePartInput({
  describedBy,
  disabled,
  id,
  inputRef,
  invalid,
  label,
  maxLength,
  onBlur,
  onChange,
  placeholder,
  value,
}: {
  disabled: boolean
  id: string
  inputRef?: Ref<HTMLInputElement>
  describedBy?: string
  invalid: boolean
  label: string
  maxLength: number
  onBlur: () => void
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={`horse-${id}`}
        type="text"
        autoComplete="off"
        data-1p-ignore
        data-lpignore="true"
        ref={inputRef}
        value={value}
        inputMode="numeric"
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  )
}

function CareRecordRow({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[8.5rem_minmax(0,1fr)]">
      <p className="pl-2 text-sm leading-snug font-bold text-foreground">
        {label}
      </p>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
