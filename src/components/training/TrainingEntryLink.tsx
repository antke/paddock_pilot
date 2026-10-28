import { HorseColourDot } from '#/components/horses/HorseCalendarIdentity'
import { calendarCompactEventChipClassName } from '#/components/events/EventCalendarChrome'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { cn } from '#/lib/utils'
import { dashboardMobileRecordClassName } from '#/components/dashboard/dashboardChrome'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { CalendarEventChipLink } from '#/components/events/EventCalendar'
import {
  formatEventDateTime,
  formatEventTime,
} from '#/components/events/eventDisplay'
import { TrainingEntryPreview } from './TrainingEntryPreview'
import { TrainingCompletionControl } from './TrainingCompletionControl'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { formatShortDateKey } from '#/lib/dateDisplay'
import {
  TrainingActivityDot,
  TrainingActivityTag,
  TrainingStatusBadge,
} from './TrainingBadges'
import { formatTrainingTimeRange } from './trainingCalendarData'
import type { TrainingEntry } from './trainingCalendarData'

export function TrainingEntryLink({
  entry,
  stableId,
  sessionNavigation = false,
  showHorseName = true,
  variant = 'record',
}: {
  entry: TrainingEntry
  stableId?: string
  sessionNavigation?: boolean
  showHorseName?: boolean
  variant?: 'record' | 'month' | 'week' | 'summary'
}) {
  const t = useT()
  const { locale } = useLocale()
  const { today } = useLocalDateContext()
  const canComplete =
    variant !== 'month' &&
    entry.horse.canRecord &&
    entry.occurrence.startDate <= today

  const { occurrence, horse, details, status, record } = entry
  const historical = Boolean(
    (
      occurrence.event as typeof occurrence.event & {
        contextHistorical?: boolean
      }
    ).contextHistorical,
  )
  const openSession = sessionNavigation && !historical
  const showStatus = !canComplete || status !== 'completed'
  const title = `${showHorseName ? `${getHorseDisplayName(horse)} · ` : ''}${occurrence.event.title}`
  const dateTime = formatEventDateTime(
    occurrence.startDate,
    occurrence.event.time,
    occurrence.endDate,
    locale,
  )
  const notes = [
    { label: t('training.focus'), value: details.focus },
    { label: t('training.outcome'), value: record?.outcome },
    { label: t('training.nextFocus'), value: details.nextFocus },
  ].filter((note) => note.value?.trim())
  const timing = details.durationMinutes
    ? formatTrainingTimeRange(
        occurrence.event.time,
        details.durationMinutes,
        locale,
      )
    : formatEventTime(occurrence.event.time, locale)

  return (
    <div className="relative min-w-0">
      <TrainingEntryPreview
        label={title}
        trigger={
          <CalendarEventChipLink
            to="/events/$eventId"
            params={{ eventId: occurrence.eventId }}
            search={{
              date: occurrence.startDate,
              horseId: openSession ? undefined : horse._id,
              participationId: openSession
                ? undefined
                : occurrence.event.contextParticipationId,
              stableId,
            }}
            data-training-entry={variant === 'record' ? 'compact' : variant}
            aria-label={
              variant === 'month'
                ? `${title}, ${dateTime}, ${details.activities.map((activity) => t(`training.activities.${activity}`)).join(', ')}, ${t(`training.status.${status}`)}`
                : undefined
            }
            className={cn(
              variant === 'month'
                ? calendarCompactEventChipClassName()
                : variant === 'summary'
                  ? cn(
                      'app-record min-h-16 min-w-0 border-0 bg-transparent px-0 py-3 text-sm leading-5 [overflow-wrap:anywhere]',
                      dashboardMobileRecordClassName,
                    )
                  : 'min-w-0 content-start gap-2 p-2 text-sm leading-5 [overflow-wrap:anywhere]',
            )}
          >
            {variant === 'summary' ? (
              <span className="grid min-w-0 gap-1">
                <span
                  className={cn(
                    'flex min-w-0 items-start justify-between gap-3',
                    canComplete && 'min-h-8 pr-11',
                  )}
                >
                  <span className="min-w-0 font-semibold">
                    {getHorseDisplayName(horse)}
                  </span>
                  {showStatus && <TrainingStatusBadge status={status} />}
                </span>
                <span className="text-muted-foreground">
                  {details.activities
                    .map((activity) => t(`training.activities.${activity}`))
                    .join(' · ') || occurrence.event.title}
                  {timing ? ` · ${timing}` : ''}
                </span>
                <span className="sr-only">{occurrence.event.title}</span>
              </span>
            ) : variant === 'month' ? (
              <>
                <HorseColourDot horse={horse} />
                <span
                  data-slot="training-entry-horse"
                  className="min-w-0 flex-1 truncate font-semibold"
                >
                  {title}
                </span>
                <TrainingStatusBadge status={status} iconOnly />
              </>
            ) : variant === 'week' ? (
              <span className="grid min-w-0 gap-2">
                <span
                  className={cn(
                    'flex min-h-8 min-w-0 items-center gap-1',
                    canComplete && 'pr-10',
                  )}
                >
                  <TrainingActivityDot activity={details.activities[0]} />
                  <span className="min-w-0 truncate text-xs text-muted-foreground">
                    {details.activities
                      .map((activity) => t(`training.activities.${activity}`))
                      .join(' · ')}
                  </span>
                </span>
                <span
                  data-slot="training-entry-title"
                  className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-foreground"
                >
                  <HorseColourDot horse={horse} className="mr-1.5" />
                  {title}
                </span>
                <span className="grid min-w-0 gap-1 text-xs leading-5 text-muted-foreground">
                  <span
                    data-slot="training-entry-timing"
                    className="whitespace-nowrap tabular-nums"
                  >
                    {timing}
                  </span>
                  {details.rider && (
                    <span
                      data-slot="training-entry-rider"
                      className="line-clamp-2"
                    >
                      {t('training.rider', { name: details.rider })}
                    </span>
                  )}
                  {showStatus && <TrainingStatusBadge status={status} />}
                </span>
              </span>
            ) : (
              <span className="grid min-w-0 gap-2">
                <span
                  className={cn(
                    'flex min-w-0 flex-wrap items-start justify-between gap-2',
                    canComplete && 'min-h-8 pr-10',
                  )}
                >
                  <span className="flex min-w-0 flex-wrap gap-1.5">
                    {details.activities.map((activity) => (
                      <TrainingActivityTag key={activity} activity={activity} />
                    ))}
                  </span>
                  {showStatus && <TrainingStatusBadge status={status} />}
                </span>
                <span
                  data-slot="training-entry-title"
                  className="text-sm font-bold leading-5 text-foreground"
                >
                  <HorseColourDot horse={horse} className="mr-1.5" />
                  {title}
                </span>
                <span className="grid gap-0.5 text-xs leading-5 text-muted-foreground">
                  {details.rider && (
                    <span data-slot="training-entry-rider">
                      {t('training.rider', { name: details.rider })}
                    </span>
                  )}
                  <span
                    data-slot="training-entry-timing"
                    className="tabular-nums"
                  >
                    {timing}
                  </span>
                </span>
              </span>
            )}
          </CalendarEventChipLink>
        }
      >
        <div className="grid gap-3">
          <div className="grid gap-1">
            <span className="font-bold">
              {getHorseDisplayName(horse)} · {occurrence.event.title}
            </span>
            <span className="flex flex-wrap gap-1.5">
              {details.activities.map((activity) => (
                <TrainingActivityTag key={activity} activity={activity} />
              ))}
            </span>
            {showStatus && <TrainingStatusBadge status={status} />}
            <span>{dateTime}</span>
            <span>{t(`training.formats.${details.format}`)}</span>
            {details.rider && (
              <span>{t('training.rider', { name: details.rider })}</span>
            )}
            {occurrence.event.location && (
              <span>{occurrence.event.location}</span>
            )}
            {details.durationMinutes && (
              <span className="tabular-nums">
                {t(
                  status === 'completed'
                    ? 'training.minutes'
                    : 'training.plannedMinutes',
                  { count: details.durationMinutes },
                )}
              </span>
            )}
            {occurrence.durationDays > 1 && (
              <span>
                {t('training.through', {
                  date: formatShortDateKey(occurrence.endDate, locale),
                })}
              </span>
            )}
            {occurrence.event.providerName && (
              <span>
                {t('training.trainer', { name: occurrence.event.providerName })}
              </span>
            )}
          </div>
          {occurrence.event.description && (
            <p className="whitespace-pre-wrap">
              {occurrence.event.description}
            </p>
          )}
          {notes.length > 0 && (
            <dl className="grid gap-3">
              {notes.map(({ label, value }) => (
                <div key={label} className="grid gap-1">
                  <dt className="text-xs font-bold leading-5">{label}</dt>
                  <dd className="whitespace-pre-wrap">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {canComplete && (
          <div className="border-t border-border-subtle pt-2">
            <TrainingCompletionControl entry={entry} labelled />
          </div>
        )}
      </TrainingEntryPreview>
      {canComplete && (
        <div className="absolute right-0 top-0">
          <TrainingCompletionControl entry={entry} />
        </div>
      )}
    </div>
  )
}
