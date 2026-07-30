import { FormSection } from '#/components/forms/FormLayout'
import { FormHelpTooltip } from '#/components/forms/FormHelpTooltip'
import { HorseSelectionCard } from '#/components/horses/HorseCard'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { formatShortDate, formatShortDateKey } from '#/lib/dateDisplay'
import { formatConjunctionList, formatMetaText } from '#/lib/textDisplay'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGrid,
  FieldGroup,
  FieldInlineControl,
  FieldInlineText,
  FieldLabel,
  FieldLabelRow,
  FieldLegend,
  FieldSet,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'
import { Switch } from '#/components/ui/switch'
import { Textarea } from '#/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { cn } from '#/lib/utils'
import type { Id } from 'convex/_generated/dataModel'
import { useEffect, useState } from 'react'
import { Controller, useFormState, useWatch } from 'react-hook-form'
import type { Control, UseFormSetValue } from 'react-hook-form'
import {
  dayOfWeekLabels,
  eventStatusLabels,
  eventStatuses,
  eventTypeLabels,
  eventTypes,
  recurrenceFrequencies,
  recurrenceOrdinals,
} from 'shared/events/eventSchema'
import type {
  DayOfWeek,
  EventStatus,
  EventType,
  RecurrenceFrequency,
  RecurrenceOrdinal,
} from 'shared/events/eventSchema'
import type { EventFormInput, EventFormSchema } from './eventFormSchema'
import { ProviderAutocomplete } from './ProviderAutocomplete'

type HorseOption = {
  _id: Id<'horses'>
  name: string
  ownerName?: string
  breed?: string
  profileImageUrl?: string | null
}

type ProviderOption = {
  _id: Id<'stableProviders'>
  type: 'vet' | 'farrier' | 'dentist' | 'physio' | 'saddler' | 'other'
  name: string
  phone?: string
}

type Props = {
  control: Control<EventFormInput, unknown, EventFormSchema>
  setValue: UseFormSetValue<EventFormInput>
  horses: Array<HorseOption>
  providers?: Array<ProviderOption>
  disabled?: boolean
}

type RecurrenceEditorMode = 'simple' | 'advanced'
type SimpleRecurrencePreset = 'daily' | 'weekly' | 'biweekly' | 'monthly'
type RecurrenceRule = NonNullable<EventFormInput['recurrence']>
type RecurrenceEnd = RecurrenceRule['end']

const shortDayLabels = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
} satisfies Record<DayOfWeek, string>

const daysOfWeekButtonOrder = [1, 2, 3, 4, 5, 6, 0] satisfies Array<DayOfWeek>

const recurrenceFrequencyLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
} satisfies Record<RecurrenceFrequency, string>

const recurrenceUnits = {
  daily: 'day',
  weekly: 'week',
  monthly: 'month',
} satisfies Record<RecurrenceFrequency, string>

const simpleRecurrencePresets = [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
] satisfies Array<SimpleRecurrencePreset>

const simpleRecurrencePresetLabels = {
  daily: 'Every day',
  weekly: 'Every week',
  biweekly: 'Every 2 weeks',
  monthly: 'Every month',
} satisfies Record<SimpleRecurrencePreset, string>

const simpleRecurrencePresetDescriptions = {
  daily: 'Runs on every calendar day',
  weekly: 'Choose one or more weekdays',
  biweekly: 'Repeats on alternate weeks',
  monthly: 'Uses the event date each month',
} satisfies Record<SimpleRecurrencePreset, string>

const recurrenceEditorModeOptions = [
  {
    value: 'simple',
    number: '01',
    label: 'Simple',
    description: 'Use a familiar daily, weekly, or monthly pattern.',
  },
  {
    value: 'advanced',
    number: '02',
    label: 'Advanced',
    description: 'Control intervals, monthly rules, and when repeats end.',
  },
] satisfies Array<{
  value: RecurrenceEditorMode
  number: string
  label: string
  description: string
}>

const advancedRecurrenceLabelClassName =
  'text-xs font-bold text-muted-foreground'

const ordinalLabels = {
  1: '1st',
  2: '2nd',
  3: '3rd',
  4: '4th',
  last: 'Last',
} satisfies Record<RecurrenceOrdinal, string>

const recurrenceDefaults = {
  frequency: 'weekly' as RecurrenceFrequency,
  interval: 1,
  daysOfWeek: [] as Array<DayOfWeek>,
  end: { type: 'never' as const },
}

const asEventType = (value: string) => value as EventType
const asEventStatus = (value: string) => value as EventStatus
const asRecurrenceFrequency = (value: string) => value as RecurrenceFrequency
const asDayOfWeek = (value: string) => Number(value) as DayOfWeek
const asRecurrenceOrdinal = (value: string) =>
  (value === 'last' ? value : Number(value)) as RecurrenceOrdinal
const asSimpleRecurrencePreset = (value: string) =>
  value as SimpleRecurrencePreset

const eventTypeOptions = eventTypes.map((eventType) => ({
  value: eventType,
  label: eventTypeLabels[eventType],
})) satisfies Array<{ value: EventType; label: string }>

const eventStatusOptions = eventStatuses.map((status) => ({
  value: status,
  label: eventStatusLabels[status],
})) satisfies Array<{ value: EventStatus; label: string }>

const pluralize = (word: string, count: number) =>
  count === 1 ? word : `${word}s`

const parseEventDate = (date: string | undefined) => {
  const match = date?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return undefined

  return {
    year: Number(match[1]),
    monthIndex: Number(match[2]) - 1,
    dayOfMonth: Number(match[3]),
  }
}

const toEventDate = (date: string | undefined) => {
  const parsedDate = parseEventDate(date)
  if (!parsedDate) return undefined

  return new Date(parsedDate.year, parsedDate.monthIndex, parsedDate.dayOfMonth)
}

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

const getWeekStart = (date: Date) => addDays(date, -date.getDay())

const getDaysInMonth = (year: number, monthIndex: number) =>
  new Date(year, monthIndex + 1, 0).getDate()

const getMonthlyCandidateDate = (
  recurrence: EventFormInput['recurrence'],
  year: number,
  monthIndex: number,
) => {
  if (!recurrence) return undefined

  if (recurrence.monthlyMode === 'dayOfMonth' && recurrence.dayOfMonth) {
    const daysInMonth = getDaysInMonth(year, monthIndex)

    if (recurrence.dayOfMonth <= daysInMonth) {
      return new Date(year, monthIndex, recurrence.dayOfMonth)
    }

    if (recurrence.missingDateStrategy === 'lastDayOfMonth') {
      return new Date(year, monthIndex, daysInMonth)
    }

    return undefined
  }

  if (
    recurrence.monthlyMode === 'weekdayPattern' &&
    recurrence.ordinal &&
    recurrence.weekday !== undefined
  ) {
    const daysInMonth = getDaysInMonth(year, monthIndex)

    if (recurrence.ordinal === 'last') {
      const lastDay = new Date(year, monthIndex, daysInMonth)
      const offset = (lastDay.getDay() - recurrence.weekday + 7) % 7

      return addDays(lastDay, -offset)
    }

    const firstDay = new Date(year, monthIndex, 1)
    const firstMatchOffset = (recurrence.weekday - firstDay.getDay() + 7) % 7
    const dayOfMonth = firstMatchOffset + 1 + (recurrence.ordinal - 1) * 7

    if (dayOfMonth <= daysInMonth) {
      return new Date(year, monthIndex, dayOfMonth)
    }
  }

  return undefined
}

const getNextRecurrenceDates = (
  recurrence: EventFormInput['recurrence'] | undefined,
  eventDate: string | undefined,
) => {
  const startDate = toEventDate(eventDate)
  if (!recurrence || !startDate) return []

  const interval = recurrence.interval ?? 1
  const maxCount =
    recurrence.end?.type === 'after_occurrences'
      ? Math.min(recurrence.end.count ?? 1, 3)
      : 3
  const endDate =
    recurrence.end?.type === 'on_date'
      ? toEventDate(recurrence.end.date)
      : undefined
  const dates: Array<Date> = []
  const canAddDate = (date: Date) => !endDate || date <= endDate

  if (recurrence.frequency === 'daily') {
    for (let index = 0; dates.length < maxCount && index < 366; index += 1) {
      const date = addDays(startDate, index * interval)
      if (canAddDate(date)) dates.push(date)
    }
  }

  if (recurrence.frequency === 'weekly' && recurrence.daysOfWeek?.length) {
    const selectedDays = new Set(recurrence.daysOfWeek)
    const startWeek = getWeekStart(startDate)

    for (let offset = 0; dates.length < maxCount && offset < 366; offset += 1) {
      const date = addDays(startDate, offset)
      const weeksSinceStart = Math.floor(
        (getWeekStart(date).getTime() - startWeek.getTime()) /
          (7 * 24 * 60 * 60 * 1000),
      )

      if (
        weeksSinceStart % interval === 0 &&
        selectedDays.has(date.getDay() as DayOfWeek) &&
        canAddDate(date)
      ) {
        dates.push(date)
      }
    }
  }

  if (recurrence.frequency === 'monthly') {
    const startMonthIndex = startDate.getMonth()
    const startYear = startDate.getFullYear()

    for (
      let monthOffset = 0;
      dates.length < maxCount && monthOffset < 120;
      monthOffset += 1
    ) {
      if (monthOffset % interval !== 0) continue

      const monthIndex = startMonthIndex + monthOffset
      const candidateDate = getMonthlyCandidateDate(
        recurrence,
        startYear + Math.floor(monthIndex / 12),
        monthIndex % 12,
      )

      if (
        candidateDate &&
        candidateDate >= startDate &&
        canAddDate(candidateDate)
      ) {
        dates.push(candidateDate)
      }
    }
  }

  return dates
}

const getStartDayOfWeek = (date: string | undefined): DayOfWeek => {
  const parsedDate = parseEventDate(date)
  if (!parsedDate) return 0

  return new Date(
    parsedDate.year,
    parsedDate.monthIndex,
    parsedDate.dayOfMonth,
  ).getDay() as DayOfWeek
}

const getStartDayOfMonth = (date: string | undefined) =>
  parseEventDate(date)?.dayOfMonth ?? 1

const getDefaultDaysOfWeek = (
  eventDate: string | undefined,
  daysOfWeekValue: Array<DayOfWeek> | undefined,
) =>
  daysOfWeekValue && daysOfWeekValue.length > 0
    ? daysOfWeekValue
    : [getStartDayOfWeek(eventDate)]

const getSimpleRecurrenceRule = (
  preset: SimpleRecurrencePreset,
  eventDate: string | undefined,
  daysOfWeekValue: Array<DayOfWeek> | undefined,
  end: RecurrenceEnd,
): RecurrenceRule => {
  const nextEnd = end ?? { type: 'never' as const }

  if (preset === 'daily') {
    return {
      frequency: 'daily',
      interval: 1,
      end: nextEnd,
    }
  }

  if (preset === 'monthly') {
    const dayOfMonth = getStartDayOfMonth(eventDate)

    return {
      frequency: 'monthly',
      interval: 1,
      monthlyMode: 'dayOfMonth',
      dayOfMonth,
      ...(dayOfMonth >= 29
        ? { missingDateStrategy: 'lastDayOfMonth' as const }
        : {}),
      end: nextEnd,
    }
  }

  return {
    frequency: 'weekly',
    interval: preset === 'biweekly' ? 2 : 1,
    daysOfWeek: getDefaultDaysOfWeek(eventDate, daysOfWeekValue),
    end: nextEnd,
  }
}

const getStartOrdinal = (date: string | undefined): RecurrenceOrdinal => {
  const parsedDate = parseEventDate(date)
  if (!parsedDate) return 1

  const daysInMonth = new Date(
    parsedDate.year,
    parsedDate.monthIndex + 1,
    0,
  ).getDate()

  if (parsedDate.dayOfMonth + 7 > daysInMonth) return 'last'

  return Math.ceil(parsedDate.dayOfMonth / 7) as RecurrenceOrdinal
}

const getEventSpanDayCount = (
  eventDate: string | undefined,
  endDate: string | undefined,
) => {
  const startDate = toEventDate(eventDate)
  const finishDate = toEventDate(endDate)

  if (!startDate || !finishDate || finishDate <= startDate) return 1

  return (
    Math.round(
      (finishDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
    ) + 1
  )
}

const getEventDurationPreview = (
  eventDate: string | undefined,
  endDate: string | undefined,
) => {
  if (!endDate || endDate <= (eventDate ?? '')) return undefined

  const dayCount = getEventSpanDayCount(eventDate, endDate)

  return `spans ${dayCount} ${pluralize('day', dayCount)}`
}

const getRecurrencePreview = (
  recurrence: EventFormInput['recurrence'] | undefined,
  eventDate: string | undefined,
  endDate: string | undefined,
) => {
  if (!recurrence) return undefined

  const interval = recurrence.interval ?? 1
  const frequency = recurrence.frequency
  const cadence =
    interval === 1
      ? `every ${recurrenceUnits[frequency]}`
      : `every ${interval} ${pluralize(recurrenceUnits[frequency], interval)}`

  let preview = `Repeats ${cadence}`

  if (frequency === 'weekly') {
    const selectedDays = [...(recurrence.daysOfWeek ?? [])]
      .sort((left, right) => left - right)
      .map((day) => dayOfWeekLabels[day])

    preview +=
      selectedDays.length > 0
        ? ` on ${formatConjunctionList(selectedDays)}`
        : ''
  }

  if (frequency === 'monthly') {
    if (recurrence.monthlyMode === 'dayOfMonth' && recurrence.dayOfMonth) {
      preview += ` on day ${recurrence.dayOfMonth}`
    }

    if (
      recurrence.monthlyMode === 'weekdayPattern' &&
      recurrence.ordinal &&
      recurrence.weekday !== undefined
    ) {
      preview += ` on the ${ordinalLabels[recurrence.ordinal].toLowerCase()} ${dayOfWeekLabels[recurrence.weekday]}`
    }
  }

  if (recurrence.end?.type === 'on_date') {
    preview += ` until ${recurrence.end.date}`
  }

  if (recurrence.end?.type === 'after_occurrences') {
    preview += ` for ${recurrence.end.count ?? 1} ${pluralize(
      'occurrence',
      recurrence.end.count ?? 1,
    )}`
  }

  const durationPreview = getEventDurationPreview(eventDate, endDate)
  if (durationPreview) preview = formatMetaText([preview, durationPreview])

  const nextDates = getNextRecurrenceDates(recurrence, eventDate).map((date) =>
    formatShortDate(date),
  )

  if (nextDates.length === 0) return `${preview}.`

  return `${preview}. Upcoming dates: ${formatConjunctionList(nextDates)}${nextDates.length > 3 ? ' etc.' : '.'}`
}

function RecurrenceModeSelector({
  disabled,
  onValueChange,
  value,
}: {
  disabled: boolean
  onValueChange: (value: RecurrenceEditorMode) => void
  value: RecurrenceEditorMode
}) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">
        Schedule setup
      </span>

      <div
        role="radiogroup"
        aria-label="Schedule setup mode"
        className="grid gap-2 sm:grid-cols-2"
      >
        {recurrenceEditorModeOptions.map((option) => {
          const selected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              className={cn(
                'app-control-focus app-row app-row-hover grid min-h-20 grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 bg-card p-4 text-left disabled:pointer-events-none disabled:opacity-50',
                selected && 'border-primary bg-primary/8',
              )}
              onClick={() => onValueChange(option.value)}
            >
              <span
                className={cn(
                  'row-span-2 grid size-7 place-items-center rounded-control border border-border-subtle bg-surface-muted font-mono text-[0.6875rem] font-semibold text-muted-foreground',
                  selected &&
                    'border-primary bg-primary text-primary-foreground',
                )}
                aria-hidden="true"
              >
                {option.number}
              </span>
              <span className="font-display text-base leading-none font-black tracking-[-0.02em] text-foreground uppercase">
                {option.label}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {option.description}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function EventFormFields({
  control,
  setValue,
  horses,
  providers = [],
  disabled = false,
}: Props) {
  const eventDate = useWatch({ control, name: 'date' })
  const endDate = useWatch({ control, name: 'endDate' })
  const eventTitle = useWatch({ control, name: 'title' })
  const eventType = useWatch({ control, name: 'type' })
  const location = useWatch({ control, name: 'location' })
  const providerName = useWatch({ control, name: 'providerName' })
  const totalCost = useWatch({ control, name: 'totalCost' })
  const description = useWatch({ control, name: 'description' })
  const notesAfterCompletion = useWatch({
    control,
    name: 'notesAfterCompletion',
  })
  const horseIds = useWatch({ control, name: 'horseIds' })
  const recurring = useWatch({ control, name: 'recurring' })
  const recurrence = useWatch({ control, name: 'recurrence' })
  const { errors, submitCount } = useFormState({ control })
  const recurrencePreview = getRecurrencePreview(recurrence, eventDate, endDate)
  const essentialsSummary = formatMetaText([
    eventTitle || 'Untitled event',
    eventTypeLabels[eventType],
    eventDate ? formatShortDateKey(eventDate) : 'No date',
  ])
  const logisticsSummary =
    formatMetaText([
      location,
      providerName,
      totalCost !== undefined ? `${totalCost} total` : undefined,
    ]) || 'Optional'
  const notesSummary =
    description || notesAfterCompletion ? 'Notes added' : 'Optional'
  const horsesSummary = `${horseIds.length} ${pluralize('horse', horseIds.length)} selected`
  const recurrenceSummary = recurring
    ? recurrencePreview || 'Repeating event'
    : 'Does not repeat'
  const essentialsInvalid = Boolean(
    errors.title ||
    errors.type ||
    errors.status ||
    errors.date ||
    errors.endDate ||
    errors.time,
  )
  const logisticsInvalid = Boolean(
    errors.location ||
    errors.providerName ||
    errors.providerPhone ||
    errors.totalCost ||
    errors.costPerHorse,
  )
  const notesInvalid = Boolean(
    errors.description || errors.notesAfterCompletion,
  )
  const horsesInvalid = Boolean(errors.horseIds)
  const recurrenceInvalid = Boolean(errors.recurring || errors.recurrence)
  const [recurrenceEditorMode, setRecurrenceEditorMode] =
    useState<RecurrenceEditorMode>('simple')
  const [simplePreset, setSimplePreset] =
    useState<SimpleRecurrencePreset>('weekly')
  const simplePresetUsesDays =
    simplePreset === 'weekly' || simplePreset === 'biweekly'

  const applyProvider = (provider: ProviderOption) => {
    setValue('providerName', provider.name, {
      shouldDirty: true,
      shouldValidate: true,
    })
    setValue('providerPhone', provider.phone ?? '', {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const applySimplePreset = (
    preset: SimpleRecurrencePreset,
    daysOfWeekValue = recurrence?.daysOfWeek,
  ) => {
    setSimplePreset(preset)
    setValue(
      'recurrence',
      getSimpleRecurrenceRule(
        preset,
        eventDate,
        daysOfWeekValue,
        recurrence?.end,
      ),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    )
  }

  useEffect(() => {
    if (recurrenceEditorMode !== 'simple' || simplePreset !== 'monthly') return

    const dayOfMonth = getStartDayOfMonth(eventDate)
    if (
      recurrence?.frequency === 'monthly' &&
      recurrence.monthlyMode === 'dayOfMonth' &&
      recurrence.dayOfMonth === dayOfMonth
    ) {
      return
    }

    setValue(
      'recurrence',
      getSimpleRecurrenceRule('monthly', eventDate, undefined, recurrence?.end),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    )
  }, [eventDate, recurrence, recurrenceEditorMode, setValue, simplePreset])

  return (
    <>
      <FormSection
        defaultOpen
        description="Name the event and set its timing."
        invalid={essentialsInvalid}
        number={1}
        summary={essentialsSummary}
        title="Event details"
        validationAttempt={submitCount}
      >
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Title</FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="text"
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                placeholder="Farrier appointment"
                autoComplete="off"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Type</FieldLabel>

              <ChoiceButtonGroup
                value={field.value}
                options={eventTypeOptions}
                onValueChange={(nextValue) =>
                  field.onChange(asEventType(nextValue))
                }
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="status"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Status</FieldLabel>

              <ChoiceButtonGroup
                value={field.value ?? 'planned'}
                options={eventStatusOptions}
                onValueChange={(nextValue) =>
                  field.onChange(asEventStatus(nextValue))
                }
                disabled={disabled}
                aria-invalid={fieldState.invalid}
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <FieldGrid columns={3}>
          <Controller
            name="date"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Date</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
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

          <Controller
            name="endDate"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>End date</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  value={field.value ?? ''}
                  type="date"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                />

                <FieldDescription>
                  Leave blank for a one-day event.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="time"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Time</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  type="time"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGrid>
      </FormSection>

      <FormSection
        description="Choose every horse this event applies to."
        invalid={horsesInvalid}
        number={2}
        summary={horsesSummary}
        title="Horses"
        validationAttempt={submitCount}
      >
        <Controller
          name="horseIds"
          control={control}
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid} disabled={disabled}>
              <FieldLegend className="sr-only">Horses</FieldLegend>

              <FieldGrid breakpoint="sm" gap="compact">
                {horses.map((horse) => {
                  const horseId = horse._id
                  const checked = field.value.includes(horseId)

                  return (
                    <HorseSelectionCard
                      key={horseId}
                      id={horseId}
                      name={field.name}
                      value={horseId}
                      horse={horse}
                      checked={checked}
                      disabled={disabled}
                      invalid={fieldState.invalid}
                      onCheckedChange={(isChecked) => {
                        field.onChange(
                          isChecked
                            ? [...field.value, horseId]
                            : field.value.filter((id) => id !== horseId),
                        )
                      }}
                    />
                  )
                })}
              </FieldGrid>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldSet>
          )}
        />
      </FormSection>

      <FormSection
        description="Add a location, service provider, and costs when relevant."
        invalid={logisticsInvalid}
        number={3}
        summary={logisticsSummary}
        title="Place & provider"
        validationAttempt={submitCount}
      >
        <Controller
          name="location"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Location</FieldLabel>

              <Input
                {...field}
                id={field.name}
                value={field.value ?? ''}
                type="text"
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                placeholder="Main arena"
                autoComplete="off"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <FieldGrid>
          <Controller
            name="providerName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Provider</FieldLabel>

                <ProviderAutocomplete
                  id={field.name}
                  name={field.name}
                  value={field.value ?? ''}
                  providers={providers}
                  disabled={disabled}
                  invalid={fieldState.invalid}
                  onBlur={field.onBlur}
                  onValueChange={field.onChange}
                  onProviderSelect={applyProvider}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="providerPhone"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Provider phone</FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  value={field.value ?? ''}
                  type="tel"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  placeholder="Provider contact number"
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
            name="totalCost"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Total cost</FieldLabel>

                <Input
                  id={field.name}
                  name={field.name}
                  value={field.value ?? ''}
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  placeholder="Optional shared visit total"
                  autoComplete="off"
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(
                      event.target.value === ''
                        ? undefined
                        : event.target.valueAsNumber,
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
            name="costPerHorse"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Cost per horse</FieldLabel>

                <Input
                  id={field.name}
                  name={field.name}
                  value={field.value ?? ''}
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  placeholder="Optional split amount"
                  autoComplete="off"
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(
                      event.target.value === ''
                        ? undefined
                        : event.target.valueAsNumber,
                    )
                  }}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGrid>
      </FormSection>

      <FormSection
        description="Turn a one-off event into a repeating schedule."
        invalid={recurrenceInvalid}
        number={4}
        summary={recurrenceSummary}
        title="Repeat schedule"
        validationAttempt={submitCount}
      >
        <Controller
          name="recurring"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal" className="app-row bg-card p-4">
              <Switch
                id={field.name}
                checked={field.value}
                disabled={disabled}
                onCheckedChange={(checked) => {
                  field.onChange(checked)
                  if (checked) {
                    setRecurrenceEditorMode('simple')
                    setSimplePreset('weekly')
                  }
                  setValue(
                    'recurrence',
                    checked
                      ? {
                          ...recurrenceDefaults,
                          daysOfWeek: [getStartDayOfWeek(eventDate)],
                        }
                      : undefined,
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  )
                }}
              />
              <div>
                <FieldLabel htmlFor={field.name}>Recurring event</FieldLabel>
                <FieldDescription>
                  Repeat this event on a schedule.
                </FieldDescription>
              </div>
            </Field>
          )}
        />

        <Controller
          name="recurring"
          control={control}
          render={({ field }) => {
            if (!field.value) return <></>

            return (
              <FieldSet>
                <FieldLegend className="sr-only">
                  Recurrence schedule
                </FieldLegend>

                <RecurrenceModeSelector
                  disabled={disabled}
                  value={recurrenceEditorMode}
                  onValueChange={(value) => {
                    setRecurrenceEditorMode(value)
                  }}
                />

                {recurrenceEditorMode === 'simple' && (
                  <div className="grid gap-4 rounded-row border border-border-subtle bg-card p-4 sm:p-5">
                    <div className="grid gap-1 border-b border-border-subtle pb-4">
                      <span className="font-display text-base leading-none font-black tracking-[-0.02em] text-foreground uppercase">
                        Choose a repeat pattern
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Start with a common schedule, then choose weekdays when
                        needed.
                      </span>
                    </div>

                    <Field>
                      <FieldLabelRow>
                        <FieldLabel>Repeat</FieldLabel>
                        <FormHelpTooltip label="About simple recurrence presets">
                          Start with a common schedule. Use advanced for custom
                          intervals, monthly patterns, or end conditions.
                        </FormHelpTooltip>
                      </FieldLabelRow>

                      <ToggleGroup
                        value={[simplePreset]}
                        onValueChange={(values) => {
                          const nextValue = values.at(-1)
                          if (nextValue) {
                            applySimplePreset(
                              asSimpleRecurrencePreset(nextValue),
                            )
                          }
                        }}
                        variant="outline"
                        disabled={disabled}
                        className="grid w-full grid-cols-1 items-stretch gap-2 sm:grid-cols-2 lg:grid-cols-4"
                      >
                        {simpleRecurrencePresets.map((preset) => (
                          <ToggleGroupItem
                            key={preset}
                            value={preset}
                            className="h-auto min-h-16 flex-col items-start gap-1 px-3 py-3 text-left whitespace-normal"
                          >
                            <span className="text-sm font-bold">
                              {simpleRecurrencePresetLabels[preset]}
                            </span>
                            <span className="text-[0.6875rem] leading-relaxed opacity-75">
                              {simpleRecurrencePresetDescriptions[preset]}
                            </span>
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </Field>

                    {simplePresetUsesDays && (
                      <Controller
                        name="recurrence.daysOfWeek"
                        control={control}
                        render={({ field: daysField, fieldState }) => (
                          <Field
                            data-invalid={fieldState.invalid}
                            className="border-t border-border-subtle pt-4"
                          >
                            <FieldLabelRow>
                              <FieldLabel>Days of week</FieldLabel>
                              <FormHelpTooltip label="About weekly recurrence days">
                                Choose one or more days this event repeats.
                              </FormHelpTooltip>
                            </FieldLabelRow>

                            <ToggleGroup
                              value={(daysField.value ?? []).map(String)}
                              onValueChange={(values) => {
                                daysField.onChange(values.map(asDayOfWeek))
                              }}
                              multiple
                              variant="outline"
                              wrap
                              disabled={disabled}
                              aria-invalid={fieldState.invalid}
                            >
                              {daysOfWeekButtonOrder.map((day) => (
                                <ToggleGroupItem
                                  key={day}
                                  value={String(day)}
                                  aria-label={dayOfWeekLabels[day]}
                                >
                                  {shortDayLabels[day]}
                                </ToggleGroupItem>
                              ))}
                            </ToggleGroup>

                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    )}
                  </div>
                )}

                {recurrenceEditorMode === 'advanced' && (
                  <div className="grid gap-4 rounded-row border border-border-subtle bg-card p-4 sm:p-5">
                    <div className="grid gap-1 border-b border-border-subtle pb-4">
                      <span className="font-display text-base leading-none font-black tracking-[-0.02em] text-foreground uppercase">
                        Build a custom schedule
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Define the repeat pattern first, then decide when it
                        ends.
                      </span>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-0">
                      <div className="grid min-w-0 gap-5 lg:pr-6">
                        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                          <span
                            className="row-span-2 grid size-7 place-items-center rounded-control border border-border-subtle bg-surface-muted font-mono text-[0.6875rem] font-semibold text-muted-foreground"
                            aria-hidden="true"
                          >
                            01
                          </span>
                          <span className="text-xs font-bold tracking-[0.08em] text-foreground uppercase">
                            Pattern
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Set the frequency, interval, and applicable days.
                          </span>
                        </div>

                        <div className="grid gap-5 md:grid-cols-[max-content_max-content] md:items-start md:justify-start md:gap-x-10">
                          <Controller
                            name="recurrence.frequency"
                            control={control}
                            render={({ field: frequencyField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                  className={advancedRecurrenceLabelClassName}
                                >
                                  Frequency
                                </FieldLabel>

                                <ToggleGroup
                                  value={
                                    frequencyField.value
                                      ? [frequencyField.value]
                                      : []
                                  }
                                  onValueChange={(values) => {
                                    const nextValue = values.at(-1)
                                    if (nextValue) {
                                      const nextFrequency =
                                        asRecurrenceFrequency(nextValue)

                                      frequencyField.onChange(nextFrequency)

                                      if (nextFrequency === 'daily') {
                                        setValue(
                                          'recurrence.daysOfWeek',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.monthlyMode',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.dayOfMonth',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.ordinal',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.weekday',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.missingDateStrategy',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                      }

                                      if (nextFrequency === 'weekly') {
                                        setValue(
                                          'recurrence.daysOfWeek',
                                          [getStartDayOfWeek(eventDate)],
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.monthlyMode',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.dayOfMonth',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.ordinal',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.weekday',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.missingDateStrategy',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                      }

                                      if (nextFrequency === 'monthly') {
                                        const dayOfMonth =
                                          getStartDayOfMonth(eventDate)

                                        setValue(
                                          'recurrence.daysOfWeek',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.monthlyMode',
                                          'dayOfMonth',
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.dayOfMonth',
                                          dayOfMonth,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.ordinal',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.weekday',
                                          undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                        setValue(
                                          'recurrence.missingDateStrategy',
                                          dayOfMonth >= 29
                                            ? 'lastDayOfMonth'
                                            : undefined,
                                          {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                          },
                                        )
                                      }
                                    }
                                  }}
                                  variant="outline"
                                  disabled={disabled}
                                  aria-invalid={fieldState.invalid}
                                >
                                  {recurrenceFrequencies.map((frequency) => (
                                    <ToggleGroupItem
                                      key={frequency}
                                      value={frequency}
                                    >
                                      {recurrenceFrequencyLabels[frequency]}
                                    </ToggleGroupItem>
                                  ))}
                                </ToggleGroup>

                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />

                          <Controller
                            name="recurrence.interval"
                            control={control}
                            render={({ field: intervalField, fieldState }) => {
                              const frequency =
                                recurrence?.frequency ?? 'weekly'
                              const unit = recurrenceUnits[frequency]

                              return (
                                <Field
                                  data-invalid={fieldState.invalid}
                                  className="md:min-w-52"
                                >
                                  <FieldLabel
                                    htmlFor={intervalField.name}
                                    className={advancedRecurrenceLabelClassName}
                                  >
                                    Interval
                                  </FieldLabel>

                                  <FieldInlineControl>
                                    <FieldInlineText>Every</FieldInlineText>
                                    <Input
                                      id={intervalField.name}
                                      name={intervalField.name}
                                      value={intervalField.value ?? 1}
                                      type="number"
                                      min={1}
                                      width="compactNumber"
                                      disabled={disabled}
                                      aria-invalid={fieldState.invalid}
                                      onBlur={intervalField.onBlur}
                                      onChange={(e) => {
                                        const val = e.target.value
                                        intervalField.onChange(
                                          val === ''
                                            ? undefined
                                            : e.target.valueAsNumber,
                                        )
                                      }}
                                    />
                                    <FieldInlineText>
                                      {pluralize(
                                        unit,
                                        intervalField.value ?? 1,
                                      )}
                                    </FieldInlineText>
                                  </FieldInlineControl>

                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )
                            }}
                          />
                        </div>

                        <Controller
                          name="recurrence.frequency"
                          control={control}
                          render={({ field: frequencyField }) => {
                            if (frequencyField.value !== 'weekly') return <></>

                            return (
                              <Controller
                                name="recurrence.daysOfWeek"
                                control={control}
                                render={({ field: daysField, fieldState }) => (
                                  <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel
                                      className={
                                        advancedRecurrenceLabelClassName
                                      }
                                    >
                                      Days of week
                                    </FieldLabel>

                                    <ToggleGroup
                                      value={(daysField.value ?? []).map(
                                        String,
                                      )}
                                      onValueChange={(values) => {
                                        daysField.onChange(
                                          values.map(asDayOfWeek),
                                        )
                                      }}
                                      multiple
                                      variant="outline"
                                      wrap
                                      disabled={disabled}
                                      aria-invalid={fieldState.invalid}
                                    >
                                      {daysOfWeekButtonOrder.map((day) => (
                                        <ToggleGroupItem
                                          key={day}
                                          value={String(day)}
                                          aria-label={dayOfWeekLabels[day]}
                                        >
                                          {shortDayLabels[day]}
                                        </ToggleGroupItem>
                                      ))}
                                    </ToggleGroup>

                                    {fieldState.invalid && (
                                      <FieldError errors={[fieldState.error]} />
                                    )}
                                  </Field>
                                )}
                              />
                            )
                          }}
                        />

                        <Controller
                          name="recurrence.frequency"
                          control={control}
                          render={({ field: frequencyField }) => {
                            if (frequencyField.value !== 'monthly') return <></>

                            return (
                              <FieldGroup>
                                <Controller
                                  name="recurrence.monthlyMode"
                                  control={control}
                                  render={({
                                    field: modeField,
                                    fieldState,
                                  }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel
                                        className={
                                          advancedRecurrenceLabelClassName
                                        }
                                      >
                                        Repeat by
                                      </FieldLabel>

                                      <RadioGroup
                                        value={modeField.value ?? 'dayOfMonth'}
                                        className="sm:w-auto sm:grid-cols-[max-content_max-content] sm:justify-start sm:gap-x-8"
                                        onValueChange={(value) => {
                                          modeField.onChange(value)

                                          if (value === 'dayOfMonth') {
                                            const dayOfMonth =
                                              getStartDayOfMonth(eventDate)

                                            setValue(
                                              'recurrence.dayOfMonth',
                                              dayOfMonth,
                                              {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              },
                                            )
                                            setValue(
                                              'recurrence.ordinal',
                                              undefined,
                                              {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              },
                                            )
                                            setValue(
                                              'recurrence.weekday',
                                              undefined,
                                              {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              },
                                            )
                                            setValue(
                                              'recurrence.missingDateStrategy',
                                              dayOfMonth >= 29
                                                ? 'lastDayOfMonth'
                                                : undefined,
                                              {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              },
                                            )
                                          }

                                          if (value === 'weekdayPattern') {
                                            setValue(
                                              'recurrence.dayOfMonth',
                                              undefined,
                                              {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              },
                                            )
                                            setValue(
                                              'recurrence.missingDateStrategy',
                                              undefined,
                                              {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              },
                                            )
                                            setValue(
                                              'recurrence.ordinal',
                                              getStartOrdinal(eventDate),
                                              {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              },
                                            )
                                            setValue(
                                              'recurrence.weekday',
                                              getStartDayOfWeek(eventDate),
                                              {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                              },
                                            )
                                          }
                                        }}
                                        disabled={disabled}
                                      >
                                        <Field orientation="horizontal">
                                          <RadioGroupItem
                                            id="recurrence-monthly-day"
                                            value="dayOfMonth"
                                          />
                                          <FieldLabel htmlFor="recurrence-monthly-day">
                                            Day of month
                                          </FieldLabel>
                                        </Field>

                                        <Field orientation="horizontal">
                                          <RadioGroupItem
                                            id="recurrence-monthly-weekday"
                                            value="weekdayPattern"
                                          />
                                          <FieldLabel htmlFor="recurrence-monthly-weekday">
                                            Weekday pattern
                                          </FieldLabel>
                                        </Field>
                                      </RadioGroup>

                                      {fieldState.invalid && (
                                        <FieldError
                                          errors={[fieldState.error]}
                                        />
                                      )}
                                    </Field>
                                  )}
                                />

                                {recurrence?.monthlyMode === 'dayOfMonth' && (
                                  <>
                                    <Controller
                                      name="recurrence.dayOfMonth"
                                      control={control}
                                      render={({
                                        field: dayField,
                                        fieldState,
                                      }) => (
                                        <Field
                                          data-invalid={fieldState.invalid}
                                        >
                                          <FieldLabel
                                            htmlFor={dayField.name}
                                            className={
                                              advancedRecurrenceLabelClassName
                                            }
                                          >
                                            Day of month
                                          </FieldLabel>

                                          <FieldInlineControl>
                                            <FieldInlineText>
                                              Day
                                            </FieldInlineText>
                                            <Input
                                              id={dayField.name}
                                              name={dayField.name}
                                              value={dayField.value ?? ''}
                                              type="number"
                                              min={1}
                                              max={31}
                                              width="compactNumber"
                                              disabled={disabled}
                                              aria-invalid={fieldState.invalid}
                                              onBlur={dayField.onBlur}
                                              onChange={(e) => {
                                                const val = e.target.value
                                                const nextDay =
                                                  val === ''
                                                    ? undefined
                                                    : e.target.valueAsNumber

                                                dayField.onChange(nextDay)
                                                setValue(
                                                  'recurrence.missingDateStrategy',
                                                  nextDay && nextDay >= 29
                                                    ? 'lastDayOfMonth'
                                                    : undefined,
                                                  {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                  },
                                                )
                                              }}
                                            />
                                            <FieldInlineText>
                                              of every month
                                            </FieldInlineText>
                                          </FieldInlineControl>

                                          {fieldState.invalid && (
                                            <FieldError
                                              errors={[fieldState.error]}
                                            />
                                          )}
                                        </Field>
                                      )}
                                    />

                                    {(recurrence.dayOfMonth ?? 0) >= 29 && (
                                      <Controller
                                        name="recurrence.missingDateStrategy"
                                        control={control}
                                        render={({
                                          field: strategyField,
                                          fieldState,
                                        }) => (
                                          <Field
                                            data-invalid={fieldState.invalid}
                                          >
                                            <FieldLabel
                                              className={
                                                advancedRecurrenceLabelClassName
                                              }
                                            >
                                              When a month does not have that
                                              date
                                            </FieldLabel>

                                            <RadioGroup
                                              value={
                                                strategyField.value ??
                                                'lastDayOfMonth'
                                              }
                                              onValueChange={
                                                strategyField.onChange
                                              }
                                              disabled={disabled}
                                            >
                                              <Field orientation="horizontal">
                                                <RadioGroupItem
                                                  id="recurrence-missing-last-day"
                                                  value="lastDayOfMonth"
                                                />
                                                <FieldLabel htmlFor="recurrence-missing-last-day">
                                                  Use the last day of the month
                                                </FieldLabel>
                                              </Field>

                                              <Field orientation="horizontal">
                                                <RadioGroupItem
                                                  id="recurrence-missing-skip"
                                                  value="skip"
                                                />
                                                <FieldLabel htmlFor="recurrence-missing-skip">
                                                  Skip that month
                                                </FieldLabel>
                                              </Field>
                                            </RadioGroup>

                                            {fieldState.invalid && (
                                              <FieldError
                                                errors={[fieldState.error]}
                                              />
                                            )}
                                          </Field>
                                        )}
                                      />
                                    )}
                                  </>
                                )}

                                {recurrence?.monthlyMode ===
                                  'weekdayPattern' && (
                                  <FieldGroup
                                    gap="default"
                                    className="sm:grid sm:w-auto sm:grid-cols-[max-content_max-content] sm:justify-start sm:gap-x-10"
                                  >
                                    <Controller
                                      name="recurrence.ordinal"
                                      control={control}
                                      render={({
                                        field: ordinalField,
                                        fieldState,
                                      }) => (
                                        <Field
                                          data-invalid={fieldState.invalid}
                                        >
                                          <FieldLabel
                                            className={
                                              advancedRecurrenceLabelClassName
                                            }
                                          >
                                            Week of month
                                          </FieldLabel>

                                          <ToggleGroup
                                            value={
                                              ordinalField.value
                                                ? [String(ordinalField.value)]
                                                : []
                                            }
                                            onValueChange={(values) => {
                                              const nextValue = values.at(-1)
                                              if (nextValue) {
                                                ordinalField.onChange(
                                                  asRecurrenceOrdinal(
                                                    nextValue,
                                                  ),
                                                )
                                              }
                                            }}
                                            variant="outline"
                                            wrap
                                            disabled={disabled}
                                            aria-invalid={fieldState.invalid}
                                          >
                                            {recurrenceOrdinals.map(
                                              (ordinal) => (
                                                <ToggleGroupItem
                                                  key={ordinal}
                                                  value={String(ordinal)}
                                                >
                                                  {ordinalLabels[ordinal]}
                                                </ToggleGroupItem>
                                              ),
                                            )}
                                          </ToggleGroup>

                                          {fieldState.invalid && (
                                            <FieldError
                                              errors={[fieldState.error]}
                                            />
                                          )}
                                        </Field>
                                      )}
                                    />

                                    <Controller
                                      name="recurrence.weekday"
                                      control={control}
                                      render={({
                                        field: weekdayField,
                                        fieldState,
                                      }) => (
                                        <Field
                                          data-invalid={fieldState.invalid}
                                        >
                                          <FieldLabel
                                            className={
                                              advancedRecurrenceLabelClassName
                                            }
                                          >
                                            Weekday
                                          </FieldLabel>

                                          <ToggleGroup
                                            value={
                                              weekdayField.value !== undefined
                                                ? [String(weekdayField.value)]
                                                : []
                                            }
                                            onValueChange={(values) => {
                                              const nextValue = values.at(-1)
                                              if (nextValue) {
                                                weekdayField.onChange(
                                                  asDayOfWeek(nextValue),
                                                )
                                              }
                                            }}
                                            variant="outline"
                                            wrap
                                            disabled={disabled}
                                            aria-invalid={fieldState.invalid}
                                          >
                                            {daysOfWeekButtonOrder.map(
                                              (day) => (
                                                <ToggleGroupItem
                                                  key={day}
                                                  value={String(day)}
                                                  aria-label={
                                                    dayOfWeekLabels[day]
                                                  }
                                                >
                                                  {shortDayLabels[day]}
                                                </ToggleGroupItem>
                                              ),
                                            )}
                                          </ToggleGroup>

                                          {fieldState.invalid && (
                                            <FieldError
                                              errors={[fieldState.error]}
                                            />
                                          )}
                                        </Field>
                                      )}
                                    />
                                  </FieldGroup>
                                )}
                              </FieldGroup>
                            )
                          }}
                        />
                      </div>

                      <div className="grid min-w-0 gap-5 border-t border-border-subtle pt-5 lg:border-t-0 lg:pt-0 lg:pl-6">
                        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                          <span
                            className="row-span-2 grid size-7 place-items-center rounded-control border border-border-subtle bg-surface-muted font-mono text-[0.6875rem] font-semibold text-muted-foreground"
                            aria-hidden="true"
                          >
                            02
                          </span>
                          <span className="text-xs font-bold tracking-[0.08em] text-foreground uppercase">
                            End condition
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Keep the schedule open, stop on a date, or limit the
                            number of occurrences.
                          </span>
                        </div>

                        <Controller
                          name="recurrence.end"
                          control={control}
                          render={({ field: endField, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel
                                className={advancedRecurrenceLabelClassName}
                              >
                                Ends
                              </FieldLabel>

                              <RadioGroup
                                value={endField.value?.type ?? 'never'}
                                className="sm:grid-cols-3 lg:grid-cols-1"
                                onValueChange={(value) => {
                                  endField.onChange(
                                    value === 'on_date'
                                      ? { type: 'on_date', date: '' }
                                      : value === 'after_occurrences'
                                        ? {
                                            type: 'after_occurrences',
                                            count: 1,
                                          }
                                        : { type: 'never' },
                                  )
                                }}
                                disabled={disabled}
                              >
                                <Field orientation="horizontal">
                                  <RadioGroupItem
                                    id="recurrence-end-never"
                                    value="never"
                                  />
                                  <FieldLabel htmlFor="recurrence-end-never">
                                    Never
                                  </FieldLabel>
                                </Field>

                                <Field orientation="horizontal">
                                  <RadioGroupItem
                                    id="recurrence-end-on-date"
                                    value="on_date"
                                  />
                                  <FieldLabel htmlFor="recurrence-end-on-date">
                                    On date
                                  </FieldLabel>
                                </Field>

                                <Field orientation="horizontal">
                                  <RadioGroupItem
                                    id="recurrence-end-after-occurrences"
                                    value="after_occurrences"
                                  />
                                  <FieldLabel htmlFor="recurrence-end-after-occurrences">
                                    After occurrences
                                  </FieldLabel>
                                </Field>
                              </RadioGroup>

                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />

                        <Controller
                          name="recurrence.end"
                          control={control}
                          render={({ field: endField, fieldState }) => {
                            if (endField.value?.type !== 'on_date') return <></>

                            return (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                  htmlFor="recurrence-end-date"
                                  className={advancedRecurrenceLabelClassName}
                                >
                                  End date
                                </FieldLabel>

                                <Input
                                  id="recurrence-end-date"
                                  type="date"
                                  value={endField.value.date}
                                  disabled={disabled}
                                  aria-invalid={fieldState.invalid}
                                  onBlur={endField.onBlur}
                                  onChange={(e) => {
                                    endField.onChange({
                                      type: 'on_date',
                                      date: e.target.value,
                                    })
                                  }}
                                />

                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )
                          }}
                        />

                        <Controller
                          name="recurrence.end"
                          control={control}
                          render={({ field: endField, fieldState }) => {
                            if (endField.value?.type !== 'after_occurrences')
                              return <></>

                            return (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                  htmlFor="recurrence-end-count"
                                  className={advancedRecurrenceLabelClassName}
                                >
                                  Occurrences
                                </FieldLabel>

                                <Input
                                  id="recurrence-end-count"
                                  type="number"
                                  min={1}
                                  value={endField.value.count ?? 1}
                                  width="compactNumber"
                                  disabled={disabled}
                                  aria-invalid={fieldState.invalid}
                                  onBlur={endField.onBlur}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    endField.onChange({
                                      type: 'after_occurrences',
                                      count:
                                        val === ''
                                          ? undefined
                                          : e.target.valueAsNumber,
                                    })
                                  }}
                                />

                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {recurrencePreview && (
                  <div className="grid gap-1 border-l-4 border-l-primary py-1 pl-4">
                    <span className="text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">
                      Schedule summary
                    </span>
                    <p className="m-0 text-sm leading-relaxed text-foreground">
                      {recurrencePreview}
                    </p>
                  </div>
                )}
              </FieldSet>
            )
          }}
        />
      </FormSection>

      <FormSection
        description="Keep preparation notes and record the outcome."
        invalid={notesInvalid}
        number={5}
        summary={notesSummary}
        title="Notes & outcome"
        validationAttempt={submitCount}
      >
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>

              <Textarea
                {...field}
                id={field.name}
                value={field.value ?? ''}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                placeholder="Notes for this event"
                autoComplete="off"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="notesAfterCompletion"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Notes after completion
              </FieldLabel>

              <Textarea
                {...field}
                id={field.name}
                value={field.value ?? ''}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                placeholder="What was done, follow-up instructions, or next steps"
                autoComplete="off"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FormSection>
    </>
  )
}

export { recurrenceDefaults }
