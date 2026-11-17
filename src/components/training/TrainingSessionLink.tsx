import { cn } from '#/lib/utils'
import {
  formatEventDateTime,
  formatEventTime,
} from '#/components/events/eventDisplay'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { CalendarEventChipLink } from '#/components/events/EventCalendar'
import { calendarCompactEventChipClassName } from '#/components/events/EventCalendarChrome'
import {
  CalendarHorseMarkers,
  HorseColourDot,
} from '#/components/horses/HorseCalendarIdentity'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { TrainingEntryLink } from './TrainingEntryLink'
import { TrainingEntryPreview } from './TrainingEntryPreview'
import { TrainingActivityTag, TrainingStatusBadge } from './TrainingBadges'
import {
  TrainingCompletionControl,
  TrainingSessionCompletionCheck,
  recordableSessionEntries,
} from './TrainingCompletionControl'
import { getSessionLeader } from './trainingSessions'
import type { TrainingSession } from './trainingSessions'

export function TrainingSessionLink({
  session,
  stableId,
  variant = 'record',
}: {
  session: TrainingSession
  stableId?: string
  variant?: 'record' | 'month' | 'week'
}) {
  const t = useT()
  const { locale } = useLocale()
  const { today } = useLocalDateContext()
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
  const progress = t('trainingViews.sessionProgress', {
    count: completed,
    total: horses.length,
  })
  // Month cells are too small for a 44px check beside the title; the preview and the
  // selected day's agenda carry it there.
  const canComplete =
    variant !== 'month' &&
    recordableSessionEntries(session.entries, today).length > 0
  const preview = (
    <TrainingSessionPreview session={session} stableId={stableId} />
  )

  // Month cells hold one line per entry, like single-horse entries; details stay in the name.
  if (variant === 'month')
    return (
      <TrainingEntryPreview
        label={occurrence.event.title}
        trigger={
          <CalendarEventChipLink
            to="/events/$eventId"
            params={{ eventId: occurrence.eventId }}
            search={{ date: occurrence.startDate, stableId }}
            data-training-entry="month"
            aria-label={`${occurrence.event.title}, ${formatEventTime(occurrence.event.time, locale)}, ${horses.map(getHorseDisplayName).join(', ')}, ${progress}`}
            className={calendarCompactEventChipClassName()}
          >
            <CalendarHorseMarkers horses={horses} />
            <span className="min-w-0 flex-1 truncate font-semibold">
              {occurrence.event.title}
            </span>
            <span className="shrink-0 text-muted-foreground tabular-nums">
              {completed}/{horses.length}
            </span>
          </CalendarEventChipLink>
        }
      >
        {preview}
      </TrainingEntryPreview>
    )
  return (
    <div className="relative min-w-0">
      <TrainingEntryPreview
        label={occurrence.event.title}
        trigger={
          <CalendarEventChipLink
            to="/events/$eventId"
            params={{ eventId: occurrence.eventId }}
            search={{ date: occurrence.startDate, stableId }}
            data-training-entry={variant === 'record' ? 'compact' : variant}
            className={cn(
              'min-w-0 content-start gap-0.5 px-2 py-1.5 text-sm leading-5 wrap-anywhere',
              // List rows stay open on their section; only calendar grids box entries.
              variant === 'record' &&
                'border-transparent bg-transparent hover:border-transparent',
            )}
          >
            <span
              className={cn(
                'flex min-h-8 flex-wrap items-center gap-x-2 text-xs leading-5 text-muted-foreground',
                canComplete && 'pr-11',
              )}
            >
              <span className="tabular-nums">
                {formatEventTime(occurrence.event.time, locale)}
              </span>
              {statuses.size === 1 ? (
                <TrainingStatusBadge status={entry.status} iconOnly />
              ) : (
                <span>{progress}</span>
              )}
            </span>
            <span className="line-clamp-2 font-medium">
              {occurrence.event.title}
            </span>
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarHorseMarkers horses={horses} />
              <span>{horses.map(getHorseDisplayName).join(', ')}</span>
            </span>
          </CalendarEventChipLink>
        }
      >
        {preview}
      </TrainingEntryPreview>
      {canComplete && (
        // A sibling of the link, never inside it, so the check does not navigate.
        <div className="absolute right-0 top-0">
          <TrainingSessionCompletionCheck
            entries={session.entries}
            stableId={stableId}
          />
        </div>
      )}
    </div>
  )
}

/**
 * Session details on hover, then one row per horse: its own check where the viewer
 * may record it, otherwise its status. Whole-session completion closes the card
 * when the viewer may record every horse.
 */
function TrainingSessionPreview({
  session,
  stableId,
}: {
  session: TrainingSession
  stableId?: string
}) {
  const t = useT()
  const { locale } = useLocale()
  const { today } = useLocalDateContext()
  const { occurrence, details } = session.entries[0]
  const leader = getSessionLeader(session.entries, occurrence.event)
  const recordable = recordableSessionEntries(session.entries, today)
  return (
    <>
      <div className="grid gap-1">
        <span className="font-bold">{occurrence.event.title}</span>
        <span className="flex flex-wrap gap-1.5">
          {details.activities.map((activity) => (
            <TrainingActivityTag key={activity} activity={activity} />
          ))}
        </span>
        <span>
          {formatEventDateTime(
            occurrence.startDate,
            occurrence.event.time,
            occurrence.endDate,
            locale,
          )}
        </span>
        <span>{t(`training.formats.${details.format}`)}</span>
        {leader && <span>{t('training.rider', { name: leader })}</span>}
        {occurrence.event.location && <span>{occurrence.event.location}</span>}
        {occurrence.event.providerName && (
          <span>
            {t('training.trainer', { name: occurrence.event.providerName })}
          </span>
        )}
      </div>
      {occurrence.event.description && (
        <p className="whitespace-pre-wrap">{occurrence.event.description}</p>
      )}
      <ul className="grid border-t border-border-subtle pt-1">
        {session.entries.map((item) => (
          <li
            key={item.key}
            className="flex min-h-11 min-w-0 items-center gap-2"
          >
            <HorseColourDot horse={item.horse} />
            <span className="min-w-0 flex-1 font-medium">
              {getHorseDisplayName(item.horse)}
            </span>
            {recordable.includes(item) ? (
              <TrainingCompletionControl entry={item} />
            ) : (
              <TrainingStatusBadge status={item.status} />
            )}
          </li>
        ))}
      </ul>
      {recordable.length === session.entries.length && (
        // Right-aligned so its box lines up with the horses' boxes above.
        <div className="flex justify-end border-t border-border-subtle pt-2">
          <TrainingSessionCompletionCheck
            entries={session.entries}
            stableId={stableId}
            labelText={(done) =>
              t(
                done
                  ? 'trainingViews.reopenSession'
                  : 'trainingViews.completeSession',
              )
            }
          />
        </div>
      )}
    </>
  )
}
