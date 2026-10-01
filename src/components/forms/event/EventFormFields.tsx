import { localeInstances } from '#/i18n/resources'
import { displayLocales } from 'shared/i18n/locale'
import type { Locale } from 'shared/i18n/locale'
import { formatCurrencyAmount } from '#/lib/numberDisplay'
import { formatRecurrence } from '#/components/events/eventDisplay'
import { isDateKey } from 'shared/training/trainingSchema'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { TrainingFormFields } from '#/components/training/TrainingFormFields'
import { FormSection, FormStepHeader } from '#/components/forms/FormLayout'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
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
import { TextLabel } from '#/components/ui/text-label'
import type { Id } from 'convex/_generated/dataModel'
import { useState } from 'react'
import { Controller, useFormState, useWatch } from 'react-hook-form'
import type { Control, UseFormSetValue } from 'react-hook-form'
import {
  eventStatuses,
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
  type:
    'trainer' | 'vet' | 'farrier' | 'dentist' | 'physio' | 'saddler' | 'other'
  name: string
  phone?: string
}

type Props = {
  control: Control<EventFormInput, unknown, EventFormSchema>
  setValue: UseFormSetValue<EventFormInput>
  horses: Array<HorseOption>
  providers?: Array<ProviderOption>
  disabled?: boolean
  trainingMode?: 'create' | 'edit'
}

type RecurrenceEditorMode = 'simple' | 'advanced'
type SimpleRecurrencePreset = 'daily' | 'weekly' | 'biweekly' | 'monthly'
type RecurrenceRule = NonNullable<EventFormInput['recurrence']>
type RecurrenceEnd = RecurrenceRule['end']

const daysOfWeekButtonOrder = [1, 2, 3, 4, 5, 6, 0] satisfies Array<DayOfWeek>

const simpleRecurrencePresets = [
  'daily',
  'weekly',
  'biweekly',
  'monthly',
] satisfies Array<SimpleRecurrencePreset>

function getEventFormOptions(locale: Locale) {
  const t = localeInstances[locale].t
  const recurrenceFrequencyLabels = {
    daily: t('eventForm.daily'),
    weekly: t('eventForm.weekly'),
    monthly: t('eventForm.monthly'),
  } satisfies Record<RecurrenceFrequency, string>
  const simpleRecurrencePresetLabels = {
    daily: t('eventForm.everyDay'),
    weekly: t('eventForm.everyWeek'),
    biweekly: t('eventForm.everyTwoWeeks'),
    monthly: t('eventForm.everyMonth'),
  } satisfies Record<SimpleRecurrencePreset, string>
  const simpleRecurrencePresetDescriptions = {
    daily: t('eventForm.dailyHelp'),
    weekly: t('eventForm.weeklyHelp'),
    biweekly: t('eventForm.biweeklyHelp'),
    monthly: t('eventForm.monthlyHelp'),
  } satisfies Record<SimpleRecurrencePreset, string>
  const recurrenceEditorModeOptions = [
    {
      value: 'simple',
      label: t('eventForm.simple'),
      description: t('eventForm.simpleHelp'),
    },
    {
      value: 'advanced',
      label: t('eventForm.advanced'),
      description: t('eventForm.advancedHelp'),
    },
  ] satisfies Array<{
    value: RecurrenceEditorMode
    label: string
    description: string
  }>
  const ordinalLabels = {
    1: locale === 'pl' ? '1.' : '1st',
    2: locale === 'pl' ? '2.' : '2nd',
    3: locale === 'pl' ? '3.' : '3rd',
    4: locale === 'pl' ? '4.' : '4th',
    last: t('eventForm.last'),
  } satisfies Record<RecurrenceOrdinal, string>
  const eventTypeOptions = eventTypes
    .filter((type) => type !== 'training')
    .map((eventType) => ({
      value: eventType,
      label: t(`events.types.${eventType}`),
    })) satisfies Array<{ value: EventType; label: string }>
  const eventStatusOptions = eventStatuses.map((status) => ({
    value: status,
    label: t(`calendar.${status}`),
  })) satisfies Array<{ value: EventStatus; label: string }>
  const dayOfWeekLabels = Object.fromEntries(
    daysOfWeekButtonOrder.map((day) => [day, t(`events.weekdays.${day}`)]),
  ) as Record<DayOfWeek, string>
  const shortDayLabels = Object.fromEntries(
    daysOfWeekButtonOrder.map((day) => [
      day,
      new Intl.DateTimeFormat(displayLocales[locale], {
        weekday: 'short',
      }).format(new Date(2026, 8, 27 + day)),
    ]),
  ) as Record<DayOfWeek, string>
  return {
    recurrenceFrequencyLabels,
    simpleRecurrencePresetLabels,
    simpleRecurrencePresetDescriptions,
    recurrenceEditorModeOptions,
    ordinalLabels,
    eventTypeOptions,
    eventStatusOptions,
    dayOfWeekLabels,
    shortDayLabels,
  }
}
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

// Only show a simple preset when it faithfully represents the saved rule.
// Opening, resetting, or changing the event date must never rewrite a schedule.
function getSimplePreset(
  recurrence: EventFormInput['recurrence'],
  eventDate: string | undefined,
): SimpleRecurrencePreset | undefined {
  if (!recurrence) return 'weekly'
  if (recurrence.frequency === 'daily' && recurrence.interval === 1)
    return 'daily'
  if (recurrence.frequency === 'weekly') {
    if (recurrence.interval === 1) return 'weekly'
    if (recurrence.interval === 2) return 'biweekly'
  }
  if (
    recurrence.frequency === 'monthly' &&
    recurrence.interval === 1 &&
    recurrence.monthlyMode === 'dayOfMonth' &&
    recurrence.dayOfMonth === getStartDayOfMonth(eventDate) &&
    recurrence.missingDateStrategy !== 'skip'
  )
    return 'monthly'
  return undefined
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

const getRecurrencePreview = (
  recurrence: EventFormInput['recurrence'] | undefined,
  eventDate: string | undefined,
  endDate: string | undefined,
  locale: Locale,
) => {
  if (!recurrence) return undefined
  const t = localeInstances[locale].t
  const end =
    recurrence.end?.type === 'on_date' && !isDateKey(recurrence.end.date ?? '')
      ? undefined
      : recurrence.end
  let preview =
    formatRecurrence(
      { ...recurrence, interval: recurrence.interval ?? 1, end },
      locale,
    ) ?? ''
  if (endDate && endDate > (eventDate ?? ''))
    preview = formatMetaText([
      preview,
      t('eventForm.spans', { count: getEventSpanDayCount(eventDate, endDate) }),
    ])
  const nextDates = getNextRecurrenceDates(recurrence, eventDate).map((date) =>
    formatShortDate(date, locale),
  )
  return nextDates.length
    ? t('eventForm.previewWithDates', {
        summary: preview,
        dates: formatConjunctionList(nextDates, locale),
      })
    : `${preview}.`
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
  const t = useT()
  const { locale } = useLocale()
  const { recurrenceEditorModeOptions } = getEventFormOptions(locale)
  return (
    <div className="grid gap-2">
      <TextLabel weight="semibold">{t('eventForm.setup')}</TextLabel>

      <ChoiceButtonGroup
        aria-label={t('eventForm.setupMode')}
        disabled={disabled}
        layout="cards"
        onValueChange={onValueChange}
        options={recurrenceEditorModeOptions}
        value={value}
      />
    </div>
  )
}

export function EventFormFields({
  control,
  setValue,
  horses,
  providers = [],
  disabled = false,
  trainingMode,
}: Props) {
  const t = useT()
  const { locale } = useLocale()

  const {
    recurrenceFrequencyLabels,
    simpleRecurrencePresetLabels,
    simpleRecurrencePresetDescriptions,
    ordinalLabels,
    eventTypeOptions,
    eventStatusOptions,
    dayOfWeekLabels,
    shortDayLabels,
  } = getEventFormOptions(locale)
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
  const recurrencePreview = getRecurrencePreview(
    recurrence,
    eventDate,
    endDate,
    locale,
  )
  const essentialsSummary = formatMetaText([
    eventTitle ||
      (trainingMode
        ? t('eventForm.untitledSession')
        : t('eventForm.untitledEvent')),
    t(`events.types.${eventType}`),
    eventDate ? formatShortDateKey(eventDate, locale) : t('eventForm.noDate'),
  ])
  const logisticsSummary =
    formatMetaText([
      location,
      providerName,
      totalCost !== undefined
        ? t('eventForm.totalSummary', {
            amount: formatCurrencyAmount(totalCost, locale),
          })
        : undefined,
    ]) || t('eventForm.optional')
  const notesSummary =
    description || notesAfterCompletion
      ? t('eventForm.notesAdded')
      : t('eventForm.optional')
  const horsesSummary = t('eventForm.horsesSelected', {
    count: horseIds.length,
  })
  const recurrenceSummary = recurring
    ? recurrencePreview || t('eventForm.repeating')
    : t('eventForm.noRepeat')
  const essentialsInvalid = Boolean(
    errors.title ||
    errors.type ||
    errors.status ||
    errors.date ||
    errors.endDate ||
    errors.time ||
    errors.training,
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
    useState<RecurrenceEditorMode>(() =>
      recurrence && recurrence.end?.type !== 'never' ? 'advanced' : 'simple',
    )
  const simplePreset = getSimplePreset(recurrence, eventDate)
  const activeEditorMode =
    simplePreset === undefined || errors.recurrence?.end
      ? 'advanced'
      : recurrenceEditorMode
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

  return (
    <>
      <FormSection
        defaultOpen
        description={
          trainingMode ? t('eventForm.trainingHelp') : t('eventForm.eventHelp')
        }
        invalid={essentialsInvalid}
        number={1}
        summary={essentialsSummary}
        title={
          trainingMode
            ? t('eventForm.sessionDetails')
            : t('eventForm.eventDetails')
        }
        validationAttempt={submitCount}
      >
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                {t('eventForm.title')}
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                type="text"
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid ? 'event-title-error' : undefined
                }
                placeholder={
                  trainingMode
                    ? t('eventForm.trainingExample')
                    : t('eventForm.eventExample')
                }
                autoComplete="off"
              />

              {fieldState.invalid && (
                <FieldError
                  id="event-title-error"
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />

        {!trainingMode && (
          <Controller
            name="type"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('eventForm.type')}</FieldLabel>

                <ChoiceButtonGroup
                  aria-label={t('eventForm.eventType')}
                  value={field.value}
                  options={eventTypeOptions}
                  onValueChange={(nextValue) =>
                    field.onChange(asEventType(nextValue))
                  }
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'event-type-error' : undefined
                  }
                />

                {fieldState.invalid && (
                  <FieldError
                    id="event-type-error"
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        )}
        {trainingMode && (
          <TrainingFormFields control={control} disabled={disabled} />
        )}

        {trainingMode !== 'edit' && (
          <Controller
            name="status"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{t('eventForm.status')}</FieldLabel>

                <ChoiceButtonGroup
                  aria-label={
                    trainingMode
                      ? t('eventForm.sessionStatus')
                      : t('eventForm.eventStatus')
                  }
                  value={field.value ?? 'planned'}
                  options={
                    trainingMode
                      ? eventStatusOptions.map((option) => ({
                          ...option,
                          label: t(`training.status.${option.value}`),
                        }))
                      : eventStatusOptions
                  }
                  onValueChange={(nextValue) =>
                    field.onChange(asEventStatus(nextValue))
                  }
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'event-status-error' : undefined
                  }
                />

                {fieldState.invalid && (
                  <FieldError
                    id="event-status-error"
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        )}
        {trainingMode && (
          <FieldDescription>
            {trainingMode === 'edit'
              ? t('eventForm.trainingEditCompletionHelp')
              : t('eventForm.trainingCreateCompletionHelp')}
          </FieldDescription>
        )}
        <FieldGrid columns={3}>
          <Controller
            name="date"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t('eventForm.date')}
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  type="date"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'event-date-error' : undefined
                  }
                />

                {fieldState.invalid && (
                  <FieldError
                    id="event-date-error"
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="endDate"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t('eventForm.endDate')}
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  value={field.value ?? ''}
                  type="date"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'event-endDate-error' : undefined
                  }
                />

                <FieldDescription>
                  {t('eventForm.endDateHelp')}
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError
                    id="event-endDate-error"
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="time"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t('eventForm.time')}
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  type="time"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'event-time-error' : undefined
                  }
                />

                <FieldDescription>{t('eventForm.timeHelp')}</FieldDescription>

                {fieldState.invalid && (
                  <FieldError
                    id="event-time-error"
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </FieldGrid>
      </FormSection>

      <FormSection
        description={
          trainingMode
            ? t('eventForm.trainingHorsesHelp')
            : t('eventForm.eventHorsesHelp')
        }
        invalid={horsesInvalid}
        number={2}
        summary={horsesSummary}
        title={t('eventForm.horses')}
        validationAttempt={submitCount}
      >
        <Controller
          name="horseIds"
          control={control}
          render={({ field, fieldState }) => (
            <FieldSet
              data-invalid={fieldState.invalid}
              disabled={disabled}
              aria-describedby={
                fieldState.invalid ? 'event-horseIds-error' : undefined
              }
            >
              <FieldLegend className="sr-only">
                {t('eventForm.horses')}
              </FieldLegend>

              {horses.length === 0 ? (
                <FieldDescription>{t('eventForm.noHorses')}</FieldDescription>
              ) : null}
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

              {fieldState.invalid && (
                <FieldError
                  id="event-horseIds-error"
                  errors={[fieldState.error]}
                />
              )}
            </FieldSet>
          )}
        />
      </FormSection>

      <FormSection
        description={
          trainingMode
            ? t('eventForm.trainingLogisticsHelp')
            : t('eventForm.eventLogisticsHelp')
        }
        invalid={logisticsInvalid}
        number={3}
        summary={logisticsSummary}
        title={
          trainingMode
            ? t('eventForm.placeTrainer')
            : t('eventForm.placeProvider')
        }
        validationAttempt={submitCount}
      >
        <Controller
          name="location"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                {t('eventForm.location')}
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                value={field.value ?? ''}
                type="text"
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid ? 'event-location-error' : undefined
                }
                placeholder={t('eventForm.locationExample')}
                autoComplete="off"
              />

              {fieldState.invalid && (
                <FieldError
                  id="event-location-error"
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />

        <FieldGrid>
          <Controller
            name="providerName"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {trainingMode
                    ? t('eventForm.trainer')
                    : t('eventForm.provider')}
                </FieldLabel>

                <ProviderAutocomplete
                  id={field.name}
                  name={field.name}
                  value={field.value ?? ''}
                  providers={providers}
                  disabled={disabled}
                  invalid={fieldState.invalid}
                  describedBy={
                    fieldState.invalid ? 'event-providerName-error' : undefined
                  }
                  inputRef={field.ref}
                  onBlur={field.onBlur}
                  onValueChange={field.onChange}
                  onProviderSelect={applyProvider}
                />

                {fieldState.invalid && (
                  <FieldError
                    id="event-providerName-error"
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="providerPhone"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {trainingMode
                    ? t('eventForm.trainerPhone')
                    : t('eventForm.providerPhone')}
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  value={field.value ?? ''}
                  type="tel"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'event-providerPhone-error' : undefined
                  }
                  placeholder={t('eventForm.providerPhoneExample')}
                  autoComplete="off"
                />

                {fieldState.invalid && (
                  <FieldError
                    id="event-providerPhone-error"
                    errors={[fieldState.error]}
                  />
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
                <FieldLabel htmlFor={field.name}>
                  {t('eventForm.totalCost')}
                </FieldLabel>

                <Input
                  ref={field.ref}
                  id={field.name}
                  name={field.name}
                  value={field.value ?? ''}
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'event-totalCost-error' : undefined
                  }
                  placeholder={t('eventForm.totalCostExample')}
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
                  <FieldError
                    id="event-totalCost-error"
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="costPerHorse"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {t('eventForm.costPerHorse')}
                </FieldLabel>

                <Input
                  ref={field.ref}
                  id={field.name}
                  name={field.name}
                  value={field.value ?? ''}
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={disabled}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? 'event-costPerHorse-error' : undefined
                  }
                  placeholder={t('eventForm.costPerHorseExample')}
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
                  <FieldError
                    id="event-costPerHorse-error"
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </FieldGrid>
      </FormSection>

      <FormSection
        description={t('eventForm.repeatHelp')}
        invalid={recurrenceInvalid}
        number={4}
        summary={recurrenceSummary}
        title={t('eventForm.repeatSchedule')}
        validationAttempt={submitCount}
      >
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
                <FieldLabel htmlFor={field.name}>
                  {t('eventForm.recurring')}
                </FieldLabel>
                <FieldDescription>
                  {t('eventForm.recurringHelp')}
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
                  {t('eventForm.recurrenceSchedule')}
                </FieldLegend>

                <RecurrenceModeSelector
                  disabled={disabled}
                  value={activeEditorMode}
                  onValueChange={(value) => {
                    setRecurrenceEditorMode(value)
                    if (value === 'simple' && simplePreset === undefined) {
                      applySimplePreset('weekly')
                    }
                  }}
                />

                {activeEditorMode === 'simple' && (
                  <FieldGroup gap="default">
                    <DashboardInlineHeader
                      as="h3"
                      className="border-b border-border-subtle pb-4"
                      description={t('eventForm.presetHelp')}
                      title={t('eventForm.choosePattern')}
                      titleSize="sm"
                    />

                    <Field>
                      <FieldLabelRow>
                        <FieldLabel>{t('eventForm.repeat')}</FieldLabel>
                        <FormHelpTooltip label={t('eventForm.presetAbout')}>
                          {t('eventForm.presetTooltip')}
                        </FormHelpTooltip>
                      </FieldLabelRow>

                      <ToggleGroup
                        aria-label={t('eventForm.repeatPattern')}
                        value={simplePreset ? [simplePreset] : []}
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
                            <span className="text-xs leading-relaxed opacity-75">
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
                              <FieldLabel>
                                {t('eventForm.daysOfWeek')}
                              </FieldLabel>
                              <FormHelpTooltip
                                label={t('eventForm.weekdaysAbout')}
                              >
                                {t('eventForm.weekdaysHelp')}
                              </FormHelpTooltip>
                            </FieldLabelRow>

                            <ToggleGroup
                              aria-label={t('eventForm.daysOfWeek')}
                              value={(daysField.value ?? []).map(String)}
                              onValueChange={(values) => {
                                daysField.onChange(values.map(asDayOfWeek))
                              }}
                              multiple
                              variant="outline"
                              wrap
                              disabled={disabled}
                              aria-invalid={fieldState.invalid}
                              aria-describedby={
                                fieldState.invalid
                                  ? 'event-recurrence-daysOfWeek-error'
                                  : undefined
                              }
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
                              <FieldError
                                id="event-recurrence-daysOfWeek-error"
                                errors={[fieldState.error]}
                              />
                            )}
                          </Field>
                        )}
                      />
                    )}
                  </FieldGroup>
                )}

                {activeEditorMode === 'advanced' && (
                  <FieldGroup gap="default">
                    <DashboardInlineHeader
                      as="h3"
                      className="border-b border-border-subtle pb-4"
                      description={t('eventForm.customHelp')}
                      title={t('eventForm.customSchedule')}
                      titleSize="sm"
                    />

                    <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-0">
                      <div className="grid min-w-0 gap-5 lg:pr-6">
                        <FormStepHeader
                          number={1}
                          title={t('eventForm.pattern')}
                          description={t('eventForm.patternHelp')}
                        />

                        <div className="grid gap-5 md:grid-cols-[max-content_max-content] md:items-start md:justify-start md:gap-x-10">
                          <Controller
                            name="recurrence.frequency"
                            control={control}
                            render={({ field: frequencyField, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel size="compact">
                                  {t('eventForm.frequency')}
                                </FieldLabel>

                                <ToggleGroup
                                  aria-label={t('eventForm.frequency')}
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
                                  aria-describedby={
                                    fieldState.invalid
                                      ? 'event-recurrence-frequency-error'
                                      : undefined
                                  }
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
                                  <FieldError
                                    id="event-recurrence-frequency-error"
                                    errors={[fieldState.error]}
                                  />
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

                              return (
                                <Field
                                  data-invalid={fieldState.invalid}
                                  className="md:min-w-52"
                                >
                                  <FieldLabel
                                    htmlFor={intervalField.name}
                                    size="compact"
                                  >
                                    {t('eventForm.interval')}
                                  </FieldLabel>

                                  <FieldInlineControl>
                                    <FieldInlineText>
                                      {t('eventForm.every')}
                                    </FieldInlineText>
                                    <Input
                                      ref={intervalField.ref}
                                      id={intervalField.name}
                                      name={intervalField.name}
                                      value={intervalField.value ?? 1}
                                      type="number"
                                      min={1}
                                      width="compactNumber"
                                      disabled={disabled}
                                      aria-invalid={fieldState.invalid}
                                      aria-describedby={
                                        fieldState.invalid
                                          ? 'event-recurrence-interval-error'
                                          : undefined
                                      }
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
                                      {t(`eventForm.${frequency}Unit`, {
                                        count: intervalField.value ?? 1,
                                      })}
                                    </FieldInlineText>
                                  </FieldInlineControl>

                                  {fieldState.invalid && (
                                    <FieldError
                                      id="event-recurrence-interval-error"
                                      errors={[fieldState.error]}
                                    />
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
                                    <FieldLabel size="compact">
                                      {t('eventForm.daysOfWeek')}
                                    </FieldLabel>

                                    <ToggleGroup
                                      aria-label={t('eventForm.daysOfWeek')}
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
                                      aria-describedby={
                                        fieldState.invalid
                                          ? 'event-recurrence-daysOfWeek-error'
                                          : undefined
                                      }
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
                                      <FieldError
                                        id="event-recurrence-daysOfWeek-error"
                                        errors={[fieldState.error]}
                                      />
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
                                      <FieldLabel size="compact">
                                        {t('eventForm.repeatBy')}
                                      </FieldLabel>

                                      <RadioGroup
                                        aria-label={t('eventForm.repeatBy')}
                                        aria-invalid={fieldState.invalid}
                                        aria-describedby={
                                          fieldState.invalid
                                            ? 'event-recurrence-monthlyMode-error'
                                            : undefined
                                        }
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
                                            {t('eventForm.dayOfMonth')}
                                          </FieldLabel>
                                        </Field>

                                        <Field orientation="horizontal">
                                          <RadioGroupItem
                                            id="recurrence-monthly-weekday"
                                            value="weekdayPattern"
                                          />
                                          <FieldLabel htmlFor="recurrence-monthly-weekday">
                                            {t('eventForm.weekdayPattern')}
                                          </FieldLabel>
                                        </Field>
                                      </RadioGroup>

                                      {fieldState.invalid && (
                                        <FieldError
                                          id="event-recurrence-monthlyMode-error"
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
                                            size="compact"
                                          >
                                            {t('eventForm.dayOfMonth')}
                                          </FieldLabel>

                                          <FieldInlineControl>
                                            <FieldInlineText>
                                              {t('eventForm.day')}
                                            </FieldInlineText>
                                            <Input
                                              ref={dayField.ref}
                                              id={dayField.name}
                                              name={dayField.name}
                                              value={dayField.value ?? ''}
                                              type="number"
                                              min={1}
                                              max={31}
                                              width="compactNumber"
                                              disabled={disabled}
                                              aria-invalid={fieldState.invalid}
                                              aria-describedby={
                                                fieldState.invalid
                                                  ? 'event-recurrence-dayOfMonth-error'
                                                  : undefined
                                              }
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
                                              {t('eventForm.ofEveryMonth')}
                                            </FieldInlineText>
                                          </FieldInlineControl>

                                          {fieldState.invalid && (
                                            <FieldError
                                              id="event-recurrence-dayOfMonth-error"
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
                                            <FieldLabel size="compact">
                                              {t('eventForm.missingDate')}
                                            </FieldLabel>

                                            <RadioGroup
                                              aria-label={t(
                                                'eventForm.missingDateLabel',
                                              )}
                                              aria-invalid={fieldState.invalid}
                                              aria-describedby={
                                                fieldState.invalid
                                                  ? 'event-recurrence-missingDateStrategy-error'
                                                  : undefined
                                              }
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
                                                  {t('eventForm.useLastDay')}
                                                </FieldLabel>
                                              </Field>

                                              <Field orientation="horizontal">
                                                <RadioGroupItem
                                                  id="recurrence-missing-skip"
                                                  value="skip"
                                                />
                                                <FieldLabel htmlFor="recurrence-missing-skip">
                                                  {t('eventForm.skipMonth')}
                                                </FieldLabel>
                                              </Field>
                                            </RadioGroup>

                                            {fieldState.invalid && (
                                              <FieldError
                                                id="event-recurrence-missingDateStrategy-error"
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
                                          <FieldLabel size="compact">
                                            {t('eventForm.weekOfMonth')}
                                          </FieldLabel>

                                          <ToggleGroup
                                            aria-label={t(
                                              'eventForm.weekOfMonth',
                                            )}
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
                                            aria-describedby={
                                              fieldState.invalid
                                                ? 'event-recurrence-ordinal-error'
                                                : undefined
                                            }
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
                                              id="event-recurrence-ordinal-error"
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
                                          <FieldLabel size="compact">
                                            {t('eventForm.weekday')}
                                          </FieldLabel>

                                          <ToggleGroup
                                            aria-label={t('eventForm.weekday')}
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
                                            aria-describedby={
                                              fieldState.invalid
                                                ? 'event-recurrence-weekday-error'
                                                : undefined
                                            }
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
                                              id="event-recurrence-weekday-error"
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
                        <FormStepHeader
                          number={2}
                          title={t('eventForm.endCondition')}
                          description={t('eventForm.endHelp')}
                        />

                        <Controller
                          name="recurrence.end"
                          control={control}
                          render={({ field: endField, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel size="compact">
                                {t('eventForm.ends')}
                              </FieldLabel>

                              <RadioGroup
                                aria-label={t('eventForm.endsLabel')}
                                aria-invalid={Boolean(
                                  fieldState.error?.message,
                                )}
                                aria-describedby={
                                  fieldState.error?.message
                                    ? 'event-recurrence-end-error-type'
                                    : undefined
                                }
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
                                    {t('eventForm.never')}
                                  </FieldLabel>
                                </Field>

                                <Field orientation="horizontal">
                                  <RadioGroupItem
                                    id="recurrence-end-on-date"
                                    value="on_date"
                                  />
                                  <FieldLabel htmlFor="recurrence-end-on-date">
                                    {t('eventForm.onDate')}
                                  </FieldLabel>
                                </Field>

                                <Field orientation="horizontal">
                                  <RadioGroupItem
                                    id="recurrence-end-after-occurrences"
                                    value="after_occurrences"
                                  />
                                  <FieldLabel htmlFor="recurrence-end-after-occurrences">
                                    {t('eventForm.afterOccurrences')}
                                  </FieldLabel>
                                </Field>
                              </RadioGroup>

                              {fieldState.invalid && (
                                <FieldError
                                  id="event-recurrence-end-error-type"
                                  errors={[fieldState.error]}
                                />
                              )}
                            </Field>
                          )}
                        />

                        <Controller
                          name="recurrence.end.date"
                          control={control}
                          render={({ field: endField, fieldState }) => {
                            if (recurrence?.end?.type !== 'on_date')
                              return <></>

                            return (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                  htmlFor="recurrence-end-date"
                                  size="compact"
                                >
                                  {t('eventForm.endDate')}
                                </FieldLabel>

                                <Input
                                  ref={endField.ref}
                                  id="recurrence-end-date"
                                  type="date"
                                  value={endField.value ?? ''}
                                  disabled={disabled}
                                  aria-invalid={fieldState.invalid}
                                  aria-describedby={
                                    fieldState.invalid
                                      ? 'event-recurrence-end-error-date'
                                      : undefined
                                  }
                                  onBlur={endField.onBlur}
                                  onChange={(e) => {
                                    endField.onChange(e.target.value)
                                  }}
                                />

                                {fieldState.invalid && (
                                  <FieldError
                                    id="event-recurrence-end-error-date"
                                    errors={[fieldState.error]}
                                  />
                                )}
                              </Field>
                            )
                          }}
                        />

                        <Controller
                          name="recurrence.end.count"
                          control={control}
                          render={({ field: endField, fieldState }) => {
                            if (recurrence?.end?.type !== 'after_occurrences')
                              return <></>

                            return (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel
                                  htmlFor="recurrence-end-count"
                                  size="compact"
                                >
                                  {t('eventForm.occurrences')}
                                </FieldLabel>

                                <Input
                                  ref={endField.ref}
                                  id="recurrence-end-count"
                                  type="number"
                                  min={1}
                                  value={endField.value ?? ''}
                                  width="compactNumber"
                                  disabled={disabled}
                                  aria-invalid={fieldState.invalid}
                                  aria-describedby={
                                    fieldState.invalid
                                      ? 'event-recurrence-end-error-count'
                                      : undefined
                                  }
                                  onBlur={endField.onBlur}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    endField.onChange(
                                      val === ''
                                        ? undefined
                                        : e.target.valueAsNumber,
                                    )
                                  }}
                                />

                                {fieldState.invalid && (
                                  <FieldError
                                    id="event-recurrence-end-error-count"
                                    errors={[fieldState.error]}
                                  />
                                )}
                              </Field>
                            )
                          }}
                        />
                      </div>
                    </div>
                  </FieldGroup>
                )}

                {recurrencePreview && (
                  <FieldGroup gap="compact">
                    <TextLabel weight="semibold">
                      {t('eventForm.scheduleSummary')}
                    </TextLabel>
                    <p className="m-0 text-sm leading-relaxed text-foreground">
                      {recurrencePreview}
                    </p>
                  </FieldGroup>
                )}
              </FieldSet>
            )
          }}
        />
      </FormSection>

      <FormSection
        description={t('eventForm.notesHelp')}
        invalid={notesInvalid}
        number={5}
        summary={notesSummary}
        title={t('eventForm.notesOutcome')}
        validationAttempt={submitCount}
      >
        <Controller
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                {t('eventForm.description')}
              </FieldLabel>

              <Textarea
                {...field}
                id={field.name}
                value={field.value ?? ''}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid ? 'event-description-error' : undefined
                }
                placeholder={
                  trainingMode
                    ? t('eventForm.sessionNotes')
                    : t('eventForm.eventNotes')
                }
                autoComplete="off"
              />

              {fieldState.invalid && (
                <FieldError
                  id="event-description-error"
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />

        <Controller
          name="notesAfterCompletion"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                {t('eventForm.notesAfter')}
              </FieldLabel>

              <Textarea
                {...field}
                id={field.name}
                value={field.value ?? ''}
                disabled={disabled}
                aria-invalid={fieldState.invalid}
                aria-describedby={
                  fieldState.invalid
                    ? 'event-notesAfterCompletion-error'
                    : undefined
                }
                placeholder={t('eventForm.notesAfterExample')}
                autoComplete="off"
              />

              {fieldState.invalid && (
                <FieldError
                  id="event-notesAfterCompletion-error"
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
      </FormSection>
    </>
  )
}

export { recurrenceDefaults }
