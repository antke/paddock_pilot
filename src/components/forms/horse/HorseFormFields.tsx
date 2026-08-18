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
  FieldLabelRow,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { formatMetaText } from '#/lib/textDisplay'
import {
  calculateHorseAge,
  splitHorseBirthDate,
} from 'shared/horses/horseAge'
import type { ReactNode, Ref } from 'react'
import { Controller, useFormState, useWatch } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { HorseBreedAutocomplete } from './HorseBreedAutocomplete'
import { HorseStringListField } from './HorseStringListField'
import type { HorseFormInput, HorseFormSchema } from './horseFormSchema'

type Props = {
  control: Control<HorseFormInput, unknown, HorseFormSchema>
  disabled?: boolean
}

type HorseSexChoice = NonNullable<HorseFormSchema['sex']> | 'unspecified'

const sexOptions = [
  { value: 'unspecified', label: 'Not specified' },
  { value: 'mare', label: 'Mare' },
  { value: 'gelding', label: 'Gelding' },
  { value: 'stallion', label: 'Stallion' },
] satisfies Array<{ value: HorseSexChoice; label: string }>

const toOptionalSex = (value: HorseSexChoice) =>
  value === 'unspecified' ? undefined : value

type ShoeingStatusChoice =
  | NonNullable<HorseFormSchema['shoeingStatus']>
  | 'unspecified'

const shoeingOptions = [
  { value: 'unspecified', label: 'Not specified' },
  { value: 'barefoot', label: 'Barefoot' },
  { value: 'front_shoes', label: 'Front shoes' },
  { value: 'full_set', label: 'Full set' },
] satisfies Array<{
  value: ShoeingStatusChoice
  label: string
}>

const toOptionalShoeingStatus = (value: ShoeingStatusChoice) =>
  value === 'unspecified' ? undefined : value

const shoeingStatusLabels = {
  barefoot: 'Barefoot',
  front_shoes: 'Front shoes',
  full_set: 'Full set',
} satisfies Record<NonNullable<HorseFormSchema['shoeingStatus']>, string>

export function HorseFormFields({ control, disabled = false }: Props) {
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
    horseName || 'Unnamed horse',
    ownerName,
    calculatedAge !== undefined && calculatedAge >= 0
      ? `${calculatedAge} ${calculatedAge === 1 ? 'year' : 'years'}`
      : undefined,
  ])
  const careSummary =
    formatMetaText([
      passportNumber ? 'Passport added' : undefined,
      microchipNumber ? 'Microchip added' : undefined,
      vetName,
      farrierName,
    ]) || 'Optional'
  const profileSummary =
    formatMetaText([
      breed,
      discipline,
      shoeingStatus ? shoeingStatusLabels[shoeingStatus] : undefined,
      allergies?.length
        ? `${allergies.length} ${allergies.length === 1 ? 'allergy' : 'allergies'}`
        : undefined,
    ]) || 'Optional'
  const nutritionSummary =
    feedingRoutine ||
    nutritionNotes ||
    nutritionRecommended?.length ||
    nutritionAvoid?.length
      ? 'Nutrition details added'
      : 'Optional'
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
        description="Add the horse's identifying details and profile image."
        invalid={detailsInvalid}
        number={1}
        summary={detailsSummary}
        title="Horse details"
        validationAttempt={submitCount}
      >
        <FieldGroup gap="compact">
          <FieldGrid>
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

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGrid>

          <FieldGrid breakpoint="lg" template="trailing-sm">
            <BirthDateOrAgeFields
              control={control}
              disabled={disabled}
              calculatedAge={calculatedAge}
            />
          </FieldGrid>

          <FieldGrid>
            <Controller
              name="sex"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Sex</FieldLabel>

                  <ChoiceButtonGroup
                    value={field.value ?? 'unspecified'}
                    options={sexOptions}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    onValueChange={(value) =>
                      field.onChange(toOptionalSex(value))
                    }
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGrid>

          <FieldGrid>
            <Controller
              name="profileImage"
              control={control}
              render={({ field: { name, onBlur, onChange, ref, value } }) => (
                <FileUploadField
                  id={name}
                  name={name}
                  label="Profile picture"
                  helpLabel="About horse profile picture"
                  help="Upload an optional image to show on horse cards."
                  accept="image/*"
                  kind="image"
                  width="full"
                  disabled={disabled}
                  autoComplete="off"
                  files={value ?? null}
                  inputRef={ref}
                  onBlur={onBlur}
                  onFilesChange={onChange}
                />
              )}
            />
          </FieldGrid>
        </FieldGroup>
      </FormSection>

      <FormSection
        description="Keep documents, insurance, and care contacts together."
        invalid={careInvalid}
        number={2}
        summary={careSummary}
        title="Care & records"
        validationAttempt={submitCount}
      >
        <FieldGroup gap="compact">
          <CareRecordRow label="Identification">
            <FieldGrid>
              <Controller
                name="passportNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Passport number
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      type="text"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      placeholder="Passport or registration reference"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
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
                      Microchip number
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      type="text"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      placeholder="Microchip reference"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGrid>
          </CareRecordRow>

          <CareRecordRow label="Insurance">
            <FieldGrid>
              <Controller
                name="insuranceProvider"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Insurance provider
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      type="text"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      placeholder="Insurer name"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
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
                      Insurance policy
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      type="text"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      placeholder="Policy number"
                      autoComplete="off"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGrid>
          </CareRecordRow>

          <CareRecordRow label="Veterinary">
            <FieldGrid>
              <Controller
                name="vetName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Vet name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      placeholder="Dr. Carter"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="vetPhone"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Vet phone</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      placeholder="+1 555 0123"
                      autoComplete="tel"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGrid>
          </CareRecordRow>

          <CareRecordRow label="Farrier">
            <FieldGrid>
              <Controller
                name="farrierName"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Farrier name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      placeholder="Alex Morgan"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="farrierPhone"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Farrier phone</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      placeholder="+1 555 0456"
                      autoComplete="tel"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGrid>
          </CareRecordRow>

          <CareRecordRow label="Emergency">
            <Controller
              name="emergencyNotes"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Emergency notes</FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Important notes for urgent care or service providers"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CareRecordRow>
        </FieldGroup>
      </FormSection>

      <FormSection
        description="Record breeding, hoof care, and ongoing health details."
        invalid={profileInvalid}
        number={3}
        summary={profileSummary}
        title="Profile & health"
        validationAttempt={submitCount}
      >
        <FieldGroup gap="compact">
          <FieldGrid>
            <Controller
              name="breed"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Breed</FieldLabel>

                  <HorseBreedAutocomplete
                    id={field.name}
                    name={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    invalid={fieldState.invalid}
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="color"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Color</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    type="text"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Chestnut"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="height"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Height</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    type="text"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="16.1hh"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="discipline"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Discipline</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    type="text"
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Eventing"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
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
                  <FieldLabel htmlFor={field.name}>Sire</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Sire name"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="dam"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Dam</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Dam name"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
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
                  <FieldLabel>Shoeing status</FieldLabel>

                  <ChoiceButtonGroup
                    value={field.value ?? 'unspecified'}
                    options={shoeingOptions}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    onValueChange={(value) =>
                      field.onChange(toOptionalShoeingStatus(value))
                    }
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
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
                  <FieldLabel htmlFor={field.name}>Deworming notes</FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Last worm count, product notes, or next check reminder"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <HorseStringListField
              control={control}
              name="allergies"
              label="Allergies or sensitivities"
              placeholder="One item per line\nPenicillin\nBee stings"
              disabled={disabled}
            />
          </FieldGrid>
        </FieldGroup>
      </FormSection>

      <FormSection
        description="Document feeding routines, requirements, and restrictions."
        invalid={nutritionInvalid}
        number={4}
        summary={nutritionSummary}
        title="Nutrition"
        validationAttempt={submitCount}
      >
        <FieldGroup gap="compact">
          <FieldGrid>
            <Controller
              name="feedingRoutine"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Feeding routine</FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Morning hay, evening mash, turnout notes..."
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="nutritionNotes"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nutrition notes</FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    disabled={disabled}
                    aria-invalid={fieldState.invalid}
                    placeholder="Supplements, minerals, intolerance warnings, or special requirements"
                    autoComplete="off"
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGrid>

          <FieldGrid>
            <HorseStringListField
              control={control}
              name="nutritionRecommended"
              label="Recommended or required"
              placeholder="One item per line\nLow-sugar chaff\nJoint supplement"
              disabled={disabled}
            />

            <HorseStringListField
              control={control}
              name="nutritionAvoid"
              label="Avoid or cannot eat"
              placeholder="One item per line\nOats\nHigh-sugar treats"
              disabled={disabled}
            />
          </FieldGrid>
        </FieldGroup>
      </FormSection>
    </>
  )
}

function BirthDateOrAgeFields({
  calculatedAge,
  control,
  disabled,
}: {
  calculatedAge?: number
  control: Control<HorseFormInput, unknown, HorseFormSchema>
  disabled: boolean
}) {
  const hasBirthDate = Boolean(useWatch({ control, name: 'dateOfBirth' }))

  return (
    <>
      <Controller
        name="dateOfBirth"
        control={control}
        render={({ field, fieldState }) => {
          const birthDate = splitHorseBirthDate(field.value)
          const updatePart = (
            part: 'year' | 'month' | 'day',
            input: string,
          ) => {
            const maxLength = part === 'year' ? 4 : 2
            const value = input.replace(/\D/g, '').slice(0, maxLength)
            const next = { ...birthDate, [part]: value }

            if (part === 'year' && !value) {
              field.onChange('')
              return
            }
            if (part === 'month' && !value) next.day = ''

            const parts = [next.year, next.month, next.day].filter(Boolean)
            field.onChange(parts.join('-'))
          }

          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabelRow className="justify-between gap-3">
                <FieldLabel htmlFor={`${field.name}-year`}>
                  Birth date
                </FieldLabel>
                <span className="text-right text-xs font-medium text-muted-foreground">
                  {field.value && calculatedAge !== undefined
                    ? `Calculated age: ${calculatedAge}`
                    : 'Year required; month and day optional'}
                </span>
              </FieldLabelRow>

              <div className="grid grid-cols-[minmax(5rem,1fr)_minmax(4rem,0.7fr)_minmax(4rem,0.7fr)] gap-2">
                <BirthDatePartInput
                  id={`${field.name}-year`}
                  label="Year"
                  value={birthDate.year}
                  placeholder="2016"
                  maxLength={4}
                  disabled={disabled}
                  invalid={fieldState.invalid}
                  inputRef={field.ref}
                  onBlur={field.onBlur}
                  onChange={(value) => updatePart('year', value)}
                />
                <BirthDatePartInput
                  id={`${field.name}-month`}
                  label="Month"
                  value={birthDate.month}
                  placeholder="MM"
                  maxLength={2}
                  disabled={disabled || !birthDate.year}
                  invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                  onChange={(value) => updatePart('month', value)}
                />
                <BirthDatePartInput
                  id={`${field.name}-day`}
                  label="Day"
                  value={birthDate.day}
                  placeholder="DD"
                  maxLength={2}
                  disabled={disabled || !birthDate.month}
                  invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                  onChange={(value) => updatePart('day', value)}
                />
              </div>

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )
        }}
      />

      <Controller
        name="age"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Or current age</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              ref={field.ref}
              value={field.value}
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              placeholder="10"
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              onBlur={field.onBlur}
              onChange={(event) =>
                field.onChange(
                  event.target.value === '' ? '' : Number(event.target.value),
                )
              }
            />
            <FieldDescription>
              {field.value !== '' && !hasBirthDate
                ? 'Approximate age is fine.'
                : 'Birth date takes priority.'}
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  )
}

function BirthDatePartInput({
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
  invalid: boolean
  label: string
  maxLength: number
  onBlur: () => void
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input
        id={id}
        ref={inputRef}
        value={value}
        inputMode="numeric"
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={invalid}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
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
