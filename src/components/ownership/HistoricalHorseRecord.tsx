import { useLocale, useT } from '#/i18n/LocaleProvider'
import { formatRecurrence } from '#/components/events/eventDisplay'
import type { Doc } from 'convex/_generated/dataModel'
import type { Locale } from 'shared/i18n/locale'
import {
  formatMediumTimestampDate,
  formatPartialDateKey,
} from '#/lib/dateDisplay'

/** Read-only projection of the former stable's own contribution. */
export function HistoricalHorseRecord({
  data,
}: {
  data: Record<string, unknown>
}) {
  const t = useT()
  const { locale } = useLocale()
  const history = data.history as Record<string, unknown> | undefined
  const training = (data.details ?? history?.training) as
    Record<string, unknown> | undefined
  const fields: Array<[string, unknown]> = [
    [t('horseComparison.date'), dateValue(data.date ?? history?.date, locale)],
    [t('eventForm.time'), history?.time],
    [t('careRecords.measuredDate'), dateValue(data.measuredAt, locale)],
    [t('careRecords.changedDate'), dateValue(data.changedAt, locale)],
    [t('horseComparison.recorded'), dateValue(data.notedAt, locale)],
    [t('careRecords.startDate'), dateValue(data.startDate, locale)],
    [
      t('careRecords.endDateOptional'),
      dateValue(data.endDate ?? history?.endDate, locale),
    ],
    [t('reminders.dueDate'), dateValue(data.dueDate, locale)],
    [t('careRecords.severityOptional'), data.severity],
    [t('careRecords.bcsOptional'), data.bodyConditionScore],
    [t('careRecords.dosage'), data.dosage],
    [t('horseComparison.fields.frequency'), data.frequency],
    [t('careRecords.prescriberOptional'), data.prescribedBy],
    [t('horseComparison.fields.reason'), data.reason],
    [t('careRecords.feedingRoutine'), data.feedingRoutineSnapshot],
    [t('careRecords.recommended'), data.recommendedSnapshot],
    [t('careRecords.avoid'), data.avoidSnapshot],
    [t('eventForm.provider'), history?.providerName],
    [t('eventForm.costPerHorse'), data.costShare],
    [
      t('eventForm.description'),
      data.description ?? data.requestedServiceNotes,
    ],
    [t('careRecords.notesOptional'), data.notes ?? data.completionNotes],
    [t('training.outcome'), data.outcome],
    [t('horseComparison.fields.rider'), training?.rider],
    [t('training.focus'), training?.focus],
    [t('training.nextFocus'), training?.nextFocus],
  ]
  const recurrence = history?.recurrence as Doc<'events'>['recurrence']
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      {fields
        .filter(
          ([, value]) => value !== undefined && value !== null && value !== '',
        )
        .map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="font-semibold">{label}</dt>
            <dd className="whitespace-pre-wrap break-words">
              {Array.isArray(value) ? value.join(', ') : String(value)}
            </dd>
          </div>
        ))}
      {training?.durationMinutes ? (
        <div>
          <dt className="font-semibold">{t('horseComparison.details')}</dt>
          <dd>
            {t('training.minutes', { count: Number(training.durationMinutes) })}
          </dd>
        </div>
      ) : null}
      {Array.isArray(training?.activities) && (
        <div>
          <dt className="font-semibold">{t('horseComparison.type')}</dt>
          <dd>
            {training.activities
              .map((activity) =>
                t(
                  `training.activities.${activity as keyof typeof activityKeys}`,
                ),
              )
              .join(', ')}
          </dd>
        </div>
      )}
      {recurrence && (
        <div>
          <dt className="font-semibold">{t('eventForm.recurrenceSchedule')}</dt>
          <dd>{formatRecurrence(recurrence, locale)}</dd>
        </div>
      )}
    </dl>
  )
}
const activityKeys = {
  flatwork: true,
  jumping: true,
  groundwork: true,
  hacking: true,
  lunging: true,
  other: true,
}
function dateValue(value: unknown, locale: Locale) {
  return typeof value === 'number'
    ? formatMediumTimestampDate(value, locale)
    : typeof value === 'string'
      ? formatPartialDateKey(value, locale)
      : undefined
}
