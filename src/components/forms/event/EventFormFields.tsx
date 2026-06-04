import { Checkbox } from '#/components/ui/checkbox'
import { FormHelpTooltip } from '#/components/forms/FormHelpTooltip'
import { HorseCard } from '#/components/horses/HorseCard'
import { cn } from '#/lib/utils'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'
import { Switch } from '#/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Textarea } from '#/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import type { Id } from 'convex/_generated/dataModel'
import { useEffect, useState } from 'react'
import {
  Controller,
  type Control,
  type UseFormSetValue,
  useWatch,
} from 'react-hook-form'
import {
  dayOfWeekLabels,
  eventTypeLabels,
  eventTypes,
  recurrenceFrequencies,
  recurrenceOrdinals,
  type DayOfWeek,
  type EventType,
  type RecurrenceFrequency,
  type RecurrenceOrdinal,
} from 'shared/events/eventSchema'
import type { EventFormInput, EventFormSchema } from './eventFormSchema'

type HorseOption = {
  _id: Id<'horses'>
  name: string
  ownerName?: string
  breed?: string
  profileImageUrl?: string | null
}

type Props = {
  control: Control<EventFormInput, unknown, EventFormSchema>
  setValue: UseFormSetValue<EventFormInput>
  horses: Array<HorseOption>
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
const asRecurrenceFrequency = (value: string) => value as RecurrenceFrequency
const asDayOfWeek = (value: string) => Number(value) as DayOfWeek
const asRecurrenceOrdinal = (value: string) =>
  (value === 'last' ? value : Number(value)) as RecurrenceOrdinal
const asRecurrenceEditorMode = (value: string) => value as RecurrenceEditorMode
const asSimpleRecurrencePreset = (value: string) =>
  value as SimpleRecurrencePreset

const datePreviewFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

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

const formatList = (items: Array<string>) => {
  if (items.length <= 2) return items.join(' and ')

  return `${items.slice(0, -1).join(', ')}, and ${items.at(-1)}`
}

const getRecurrencePreview = (
  recurrence: EventFormInput['recurrence'] | undefined,
  eventDate: string | undefined,
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

    preview += selectedDays.length > 0 ? ` on ${formatList(selectedDays)}` : ''
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

  const nextDates = getNextRecurrenceDates(recurrence, eventDate).map((date) =>
    datePreviewFormatter.format(date),
  )

  if (nextDates.length === 0) return `${preview}.`

  return `${preview}. Upcoming dates: ${formatList(nextDates)}${nextDates.length > 3 ? ' etc.' : '.'}`
}

export function EventFormFields({
  control,
  setValue,
  horses,
  disabled = false,
}: Props) {
  const eventDate = useWatch({ control, name: 'date' })
  const recurrence = useWatch({ control, name: 'recurrence' })
  const recurrencePreview = getRecurrencePreview(recurrence, eventDate)
  const [recurrenceEditorMode, setRecurrenceEditorMode] =
    useState<RecurrenceEditorMode>('simple')
  const [simplePreset, setSimplePreset] =
    useState<SimpleRecurrencePreset>('weekly')
  const simplePresetUsesDays =
    simplePreset === 'weekly' || simplePreset === 'biweekly'

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

            <ToggleGroup
              value={[field.value]}
              onValueChange={(values) => {
                const nextValue = values.at(-1)
                if (nextValue) field.onChange(asEventType(nextValue))
              }}
              variant="outline"
              className="flex-wrap"
              disabled={disabled}
              aria-invalid={fieldState.invalid}
            >
              {eventTypes.map((eventType) => (
                <ToggleGroupItem key={eventType} value={eventType}>
                  {eventTypeLabels[eventType]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
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

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

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
        name="horseIds"
        control={control}
        render={({ field, fieldState }) => (
          <FieldSet data-invalid={fieldState.invalid} disabled={disabled}>
            <FieldLegend>Horses</FieldLegend>
            <FieldDescription>
              Select the horses this event applies to.
            </FieldDescription>

            <div className="grid gap-3 sm:grid-cols-2">
              {horses.map((horse) => {
                const horseId = horse._id
                const checked = field.value.includes(horseId)

                return (
                  <Field
                    key={horseId}
                    orientation="horizontal"
                    className="items-start"
                  >
                    <Checkbox
                      id={horseId}
                      checked={checked}
                      disabled={disabled}
                      aria-invalid={fieldState.invalid}
                      className="mt-4"
                      onCheckedChange={(isChecked) => {
                        field.onChange(
                          isChecked
                            ? [...field.value, horseId]
                            : field.value.filter((id) => id !== horseId),
                        )
                      }}
                    />
                    <FieldLabel htmlFor={horseId} className="w-full">
                      <HorseCard
                        horse={horse}
                        className={cn(
                          'w-full cursor-pointer',
                          checked && 'border-primary bg-primary/5',
                        )}
                      />
                    </FieldLabel>
                  </Field>
                )
              })}
            </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldSet>
        )}
      />

      <Controller
        name="recurring"
        control={control}
        render={({ field }) => (
          <Field orientation="horizontal">
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
              <FieldLegend>Recurrence</FieldLegend>

              <Tabs
                value={recurrenceEditorMode}
                onValueChange={(value) => {
                  setRecurrenceEditorMode(asRecurrenceEditorMode(value))
                }}
              >
                <TabsList>
                  <TabsTrigger value="simple">Simple</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="simple" className="flex flex-col gap-4">
                  <Field>
                    <div className="flex items-center gap-1">
                      <FieldLabel>Repeat</FieldLabel>
                      <FormHelpTooltip label="About simple recurrence presets">
                        Start with a common schedule. Use advanced for custom
                        intervals, monthly patterns, or end conditions.
                      </FormHelpTooltip>
                    </div>

                    <ToggleGroup
                      value={[simplePreset]}
                      onValueChange={(values) => {
                        const nextValue = values.at(-1)
                        if (nextValue) {
                          applySimplePreset(asSimpleRecurrencePreset(nextValue))
                        }
                      }}
                      variant="outline"
                      className="flex-wrap"
                      disabled={disabled}
                    >
                      {simpleRecurrencePresets.map((preset) => (
                        <ToggleGroupItem key={preset} value={preset}>
                          {simpleRecurrencePresetLabels[preset]}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </Field>

                  {simplePresetUsesDays && (
                    <Controller
                      name="recurrence.daysOfWeek"
                      control={control}
                      render={({ field: daysField, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <div className="flex items-center gap-1">
                            <FieldLabel>Days of week</FieldLabel>
                            <FormHelpTooltip label="About weekly recurrence days">
                              Choose one or more days this event repeats.
                            </FormHelpTooltip>
                          </div>

                          <ToggleGroup
                            value={(daysField.value ?? []).map(String)}
                            onValueChange={(values) => {
                              daysField.onChange(values.map(asDayOfWeek))
                            }}
                            multiple
                            variant="outline"
                            className="flex-wrap"
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
                </TabsContent>

                <TabsContent value="advanced" className="flex flex-col gap-4">
                  <Controller
                    name="recurrence.frequency"
                    control={control}
                    render={({ field: frequencyField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Frequency</FieldLabel>

                        <ToggleGroup
                          value={
                            frequencyField.value ? [frequencyField.value] : []
                          }
                          onValueChange={(values) => {
                            const nextValue = values.at(-1)
                            if (nextValue) {
                              const nextFrequency =
                                asRecurrenceFrequency(nextValue)

                              frequencyField.onChange(nextFrequency)

                              if (nextFrequency === 'daily') {
                                setValue('recurrence.daysOfWeek', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue('recurrence.monthlyMode', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue('recurrence.dayOfMonth', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue('recurrence.ordinal', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue('recurrence.weekday', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue(
                                  'recurrence.missingDateStrategy',
                                  undefined,
                                  { shouldDirty: true, shouldValidate: true },
                                )
                              }

                              if (nextFrequency === 'weekly') {
                                setValue(
                                  'recurrence.daysOfWeek',
                                  [getStartDayOfWeek(eventDate)],
                                  { shouldDirty: true, shouldValidate: true },
                                )
                                setValue('recurrence.monthlyMode', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue('recurrence.dayOfMonth', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue('recurrence.ordinal', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue('recurrence.weekday', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue(
                                  'recurrence.missingDateStrategy',
                                  undefined,
                                  { shouldDirty: true, shouldValidate: true },
                                )
                              }

                              if (nextFrequency === 'monthly') {
                                const dayOfMonth = getStartDayOfMonth(eventDate)

                                setValue('recurrence.daysOfWeek', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue(
                                  'recurrence.monthlyMode',
                                  'dayOfMonth',
                                  {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  },
                                )
                                setValue('recurrence.dayOfMonth', dayOfMonth, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue('recurrence.ordinal', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue('recurrence.weekday', undefined, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                                setValue(
                                  'recurrence.missingDateStrategy',
                                  dayOfMonth >= 29
                                    ? 'lastDayOfMonth'
                                    : undefined,
                                  { shouldDirty: true, shouldValidate: true },
                                )
                              }
                            }
                          }}
                          variant="outline"
                          disabled={disabled}
                          aria-invalid={fieldState.invalid}
                        >
                          {recurrenceFrequencies.map((frequency) => (
                            <ToggleGroupItem key={frequency} value={frequency}>
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
                      const frequency = recurrence?.frequency ?? 'weekly'
                      const unit = recurrenceUnits[frequency]

                      return (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={intervalField.name}>
                            Interval
                          </FieldLabel>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Every
                            </span>
                            <Input
                              id={intervalField.name}
                              name={intervalField.name}
                              value={intervalField.value ?? 1}
                              type="number"
                              min={1}
                              className="w-24"
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
                            <span className="text-sm text-muted-foreground">
                              {pluralize(unit, intervalField.value ?? 1)}
                            </span>
                          </div>

                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )
                    }}
                  />

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
                              <FieldLabel>Days of week</FieldLabel>

                              <ToggleGroup
                                value={(daysField.value ?? []).map(String)}
                                onValueChange={(values) => {
                                  daysField.onChange(values.map(asDayOfWeek))
                                }}
                                multiple
                                variant="outline"
                                className="flex-wrap"
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
                        <div className="flex flex-col gap-4">
                          <Controller
                            name="recurrence.monthlyMode"
                            control={control}
                            render={({ field: modeField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel>Repeat by</FieldLabel>

                                <RadioGroup
                                  value={modeField.value ?? 'dayOfMonth'}
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
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />

                          {recurrence?.monthlyMode === 'dayOfMonth' && (
                            <>
                              <Controller
                                name="recurrence.dayOfMonth"
                                control={control}
                                render={({ field: dayField, fieldState }) => (
                                  <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={dayField.name}>
                                      Day of month
                                    </FieldLabel>

                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-muted-foreground">
                                        Day
                                      </span>
                                      <Input
                                        id={dayField.name}
                                        name={dayField.name}
                                        value={dayField.value ?? ''}
                                        type="number"
                                        min={1}
                                        max={31}
                                        className="w-24"
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
                                      <span className="text-sm text-muted-foreground">
                                        of every month
                                      </span>
                                    </div>

                                    {fieldState.invalid && (
                                      <FieldError errors={[fieldState.error]} />
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
                                    <Field data-invalid={fieldState.invalid}>
                                      <FieldLabel>
                                        When a month does not have that date
                                      </FieldLabel>

                                      <RadioGroup
                                        value={
                                          strategyField.value ??
                                          'lastDayOfMonth'
                                        }
                                        onValueChange={strategyField.onChange}
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

                          {recurrence?.monthlyMode === 'weekdayPattern' && (
                            <div className="flex flex-col gap-4">
                              <Controller
                                name="recurrence.ordinal"
                                control={control}
                                render={({
                                  field: ordinalField,
                                  fieldState,
                                }) => (
                                  <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Week of month</FieldLabel>

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
                                            asRecurrenceOrdinal(nextValue),
                                          )
                                        }
                                      }}
                                      variant="outline"
                                      className="flex-wrap"
                                      disabled={disabled}
                                      aria-invalid={fieldState.invalid}
                                    >
                                      {recurrenceOrdinals.map((ordinal) => (
                                        <ToggleGroupItem
                                          key={ordinal}
                                          value={String(ordinal)}
                                        >
                                          {ordinalLabels[ordinal]}
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
                                name="recurrence.weekday"
                                control={control}
                                render={({
                                  field: weekdayField,
                                  fieldState,
                                }) => (
                                  <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Weekday</FieldLabel>

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
                                      className="flex-wrap"
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
                            </div>
                          )}
                        </div>
                      )
                    }}
                  />

                  <Controller
                    name="recurrence.end"
                    control={control}
                    render={({ field: endField, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Ends</FieldLabel>

                        <RadioGroup
                          value={endField.value?.type ?? 'never'}
                          onValueChange={(value) => {
                            endField.onChange(
                              value === 'on_date'
                                ? { type: 'on_date', date: '' }
                                : value === 'after_occurrences'
                                  ? { type: 'after_occurrences', count: 1 }
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
                          <FieldLabel htmlFor="recurrence-end-date">
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
                          <FieldLabel htmlFor="recurrence-end-count">
                            Occurrences
                          </FieldLabel>

                          <Input
                            id="recurrence-end-count"
                            type="number"
                            min={1}
                            value={endField.value.count ?? 1}
                            className="w-24"
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
                </TabsContent>
              </Tabs>

              {recurrencePreview && (
                <FieldDescription>{recurrencePreview}</FieldDescription>
              )}
            </FieldSet>
          )
        }}
      />
    </>
  )
}

export { recurrenceDefaults }
