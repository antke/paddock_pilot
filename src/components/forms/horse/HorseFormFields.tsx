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
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Textarea } from '#/components/ui/textarea'
import { Controller  } from 'react-hook-form'
import type {Control} from 'react-hook-form';
import { HorseStringListField } from './HorseStringListField'
import type { HorseFormSchema } from './horseFormSchema'

type Props = {
  control: Control<HorseFormSchema>
  disabled?: boolean
}

const sexOptions = [
  { value: '', label: 'Not specified' },
  { value: 'mare', label: 'Mare' },
  { value: 'gelding', label: 'Gelding' },
  { value: 'stallion', label: 'Stallion' },
] satisfies Array<{ value: HorseFormSchema['sex'] | ''; label: string }>

const toOptionalSex = (value: string) =>
  value === '' ? undefined : (value as HorseFormSchema['sex'])

const shoeingOptions = [
  { value: '', label: 'Not specified' },
  { value: 'barefoot', label: 'Barefoot' },
  { value: 'front_shoes', label: 'Front shoes' },
  { value: 'full_set', label: 'Full set' },
] satisfies Array<{ value: HorseFormSchema['shoeingStatus'] | ''; label: string }>

const toOptionalShoeingStatus = (value: string) =>
  value === '' ? undefined : (value as HorseFormSchema['shoeingStatus'])

export function HorseFormFields({ control, disabled = false }: Props) {
  return (
    <Tabs defaultValue="basics">
      <TabsList>
        <TabsTrigger value="basics">Basics</TabsTrigger>
        <TabsTrigger value="care">Care details</TabsTrigger>
        <TabsTrigger value="profile">More details</TabsTrigger>
        <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
      </TabsList>

      <TabsContent keepMounted value="basics" className="flex flex-col gap-4">
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

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
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

              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Date of birth</FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      value={field.value ?? ''}
                      type="date"
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

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

            <div className="grid gap-4 md:grid-cols-2">
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
            </div>

            <Controller
              name="sex"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Sex</FieldLabel>

                  <RadioGroup
                    value={field.value ?? ''}
                    disabled={disabled}
                    className="flex flex-wrap gap-4"
                    onValueChange={(value) => field.onChange(toOptionalSex(value))}
                  >
                    {sexOptions.map((option) => (
                      <Field key={option.value} orientation="horizontal">
                        <RadioGroupItem
                          id={`sex-${option.value || 'empty'}`}
                          value={option.value}
                        />
                        <FieldLabel htmlFor={`sex-${option.value || 'empty'}`}>
                          {option.label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
      </TabsContent>

      <TabsContent keepMounted value="care" className="flex flex-col gap-4">
        <FieldSet>
          <FieldLegend>Care contacts and documents</FieldLegend>

          <FieldGroup>
            <Controller
              name="passportNumber"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Passport number</FieldLabel>

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

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="microchipNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Microchip number</FieldLabel>

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

              <Controller
                name="insurancePolicyNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Insurance policy</FieldLabel>

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
            </div>

            <Controller
              name="insuranceProvider"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Insurance provider</FieldLabel>

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

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
            </div>

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
          </FieldGroup>
        </FieldSet>
      </TabsContent>

      <TabsContent keepMounted value="profile" className="flex flex-col gap-4">
        <FieldSet>
          <FieldLegend>Additional horse details</FieldLegend>

          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
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
            </div>

            <Controller
              name="shoeingStatus"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Shoeing status</FieldLabel>

                  <RadioGroup
                    value={field.value ?? ''}
                    disabled={disabled}
                    className="flex flex-wrap gap-4"
                    onValueChange={(value) =>
                      field.onChange(toOptionalShoeingStatus(value))
                    }
                  >
                    {shoeingOptions.map((option) => (
                      <Field key={option.value} orientation="horizontal">
                        <RadioGroupItem
                          id={`shoeing-${option.value || 'empty'}`}
                          value={option.value}
                        />
                        <FieldLabel htmlFor={`shoeing-${option.value || 'empty'}`}>
                          {option.label}
                        </FieldLabel>
                      </Field>
                    ))}
                  </RadioGroup>

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

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

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
          </FieldGroup>
        </FieldSet>
      </TabsContent>

      <TabsContent keepMounted value="nutrition" className="flex flex-col gap-4">
        <FieldSet>
          <FieldLegend>Nutrition profile</FieldLegend>

          <FieldGroup>
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

            <div className="grid gap-4 md:grid-cols-2">
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
            </div>
          </FieldGroup>
        </FieldSet>
      </TabsContent>
    </Tabs>
  )
}
