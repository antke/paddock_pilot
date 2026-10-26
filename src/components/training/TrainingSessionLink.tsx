import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { CalendarEventChipLink } from '#/components/events/EventCalendar'
import { CalendarHorseMarkers } from '#/components/horses/HorseCalendarIdentity'
import { useT } from '#/i18n/LocaleProvider'
import { TrainingEntryLink } from './TrainingEntryLink'
import { TrainingStatusBadge } from './TrainingBadges'
import type { TrainingSession } from './trainingSessions'

export function TrainingSessionLink({
  session,
  stableId,
  variant = 'record',
}: {
  session: TrainingSession
  stableId?: string
  variant?: 'record' | 'month' | 'week' | 'summary'
}) {
  const t = useT()
  const entry = session.entries[0]
  if (session.entries.length === 1)
    return (
      <TrainingEntryLink
        entry={entry}
        stableId={stableId}
        variant={variant}
        sessionNavigation
      />
    )
  const { occurrence } = entry
  const horses = session.entries.map((item) => item.horse)
  const statuses = new Set(session.entries.map((item) => item.status))
  const completed = session.entries.filter(
    (item) => item.status === 'completed',
  ).length
  return (
    <CalendarEventChipLink
      to="/events/$eventId"
      params={{ eventId: occurrence.eventId }}
      search={{ date: occurrence.startDate, stableId }}
      data-training-entry={variant === 'record' ? 'compact' : variant}
      className="grid min-w-0 gap-2 p-3 text-sm leading-5 wrap-anywhere"
    >
      <span className="font-semibold">{occurrence.event.title}</span>
      <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <CalendarHorseMarkers horses={horses} />
        <span>{horses.map(getHorseDisplayName).join(', ')}</span>
      </span>
      <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums">{occurrence.event.time}</span>
        {statuses.size === 1 ? (
          <TrainingStatusBadge status={entry.status} />
        ) : (
          <span>
            {t('trainingViews.sessionProgress', {
              count: completed,
              total: horses.length,
            })}
          </span>
        )}
      </span>
    </CalendarEventChipLink>
  )
}
