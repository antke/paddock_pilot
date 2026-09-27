import { CalendarEventChipLink } from '#/components/events/EventCalendar'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '#/components/ui/tooltip'
import { formatShortDateKey } from '#/lib/dateDisplay'
import { trainingFormatLabels } from 'shared/training/trainingSchema'
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
  const { occurrence, horse, details, status, record } = entry
  const notes = [
    { label: 'Exercises / focus', value: details.focus },
    { label: 'What happened', value: record?.outcome },
    { label: 'Next focus', value: details.nextFocus },
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
            {details.rider ? `Rider: ${details.rider}` : 'Rider not specified'}
          </span>
          <span data-slot="training-entry-timing" className="tabular-nums">
            {formatTrainingTimeRange(
              occurrence.event.time,
              details.durationMinutes,
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
            <span>{trainingFormatLabels[details.format]}</span>
            {details.durationMinutes && (
              <span className="tabular-nums">
                {details.durationMinutes} min
                {status === 'completed' ? '' : ' planned'}
              </span>
            )}
            {occurrence.durationDays > 1 && (
              <span>Through {formatShortDateKey(occurrence.endDate)}</span>
            )}
            {occurrence.event.providerName && (
              <span>Trainer: {occurrence.event.providerName}</span>
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
