import { useT, useLocale } from '#/i18n/LocaleProvider'
import { CalendarEventChipLink } from '#/components/events/EventCalendar'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '#/components/ui/tooltip'
import { formatShortDateKey } from '#/lib/dateDisplay'
import { TrainingActivityTag, TrainingStatusBadge } from './TrainingBadges'
import { formatTrainingTimeRange } from './trainingCalendarData'
import type { TrainingEntry } from './trainingCalendarData'

export function TrainingEntryLink({
  entry,
  stableId,
  showHorseName = true,
}: {
  entry: TrainingEntry
  stableId: string
  showHorseName?: boolean
}) {
  const t = useT()
  const { locale } = useLocale()

  const { occurrence, horse, details, status, record } = entry
  const notes = [
    { label: t('training.focus'), value: details.focus },
    { label: t('training.outcome'), value: record?.outcome },
    { label: t('training.nextFocus'), value: details.nextFocus },
  ].filter((note) => note.value?.trim())

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <CalendarEventChipLink
            to="/stables/$stableId/training/$eventId"
            params={{ stableId, eventId: occurrence.eventId }}
            search={{ date: occurrence.startDate }}
          />
        }
        data-training-entry="compact"
        className="min-w-0 gap-2 p-3 text-sm leading-5 [overflow-wrap:anywhere]"
      >
        <span className="flex min-w-0 flex-wrap items-start justify-between gap-2">
          <span className="flex min-w-0 flex-wrap gap-1.5">
            {details.activities.map((activity) => (
              <TrainingActivityTag key={activity} activity={activity} />
            ))}
          </span>
          <TrainingStatusBadge status={status} iconOnly />
        </span>
        <span
          data-slot="training-entry-title"
          className="text-sm font-bold leading-5 text-foreground"
        >
          {showHorseName && `${horse.name} · `}
          {occurrence.event.title}
        </span>
        <span className="grid gap-0.5 text-xs leading-5 text-muted-foreground">
          <span data-slot="training-entry-rider">
            {details.rider
              ? t('training.rider', { name: details.rider })
              : t('training.noRider')}
          </span>
          <span data-slot="training-entry-timing" className="tabular-nums">
            {formatTrainingTimeRange(
              occurrence.event.time,
              details.durationMinutes,
              locale,
            )}
          </span>
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        align="start"
        sideOffset={8}
        className="block max-h-[min(32rem,var(--available-height))] w-72 max-w-full overflow-y-auto p-4 text-sm font-normal leading-6"
      >
        <div className="grid gap-3">
          <div className="grid gap-1">
            <span className="font-bold">
              {horse.name} · {occurrence.event.title}
            </span>
            <TrainingStatusBadge status={status} />
            <span>{t(`training.formats.${details.format}`)}</span>
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
      </TooltipContent>
    </Tooltip>
  )
}
