import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import {
  getHorseCalendarColour,
  horseCalendarColourCss,
  isCustomHorseColour,
  uniqueCalendarHorses,
} from 'shared/horses/horseCalendarColours'
import type {
  CalendarHorse,
  HorseCalendarColour,
} from 'shared/horses/horseCalendarColours'
import { useT } from '#/i18n/LocaleProvider'
import { useSessionState } from '#/lib/useSessionState'
import { cn } from '#/lib/utils'
import { DisclosureChevron } from '#/components/ui/disclosure-chevron'

export function HorseColourDot({
  horse,
  colour,
  className,
}: {
  horse?: CalendarHorse
  colour?: HorseCalendarColour
  className?: string
}) {
  const id = colour ?? (horse ? getHorseCalendarColour(horse) : undefined)
  return (
    <span
      aria-hidden="true"
      data-horse-colour={id}
      className={cn(
        // Dark mode: a card-coloured 1px halo lifts the dot off tinted cells; outline leaves the custom-colour inset shadow intact.
        'inline-block size-2 shrink-0 rounded-full bg-muted-foreground dark:outline dark:outline-card',
        className,
      )}
      style={
        id
          ? {
              backgroundColor: horseCalendarColourCss(id),
              boxShadow: isCustomHorseColour(id)
                ? 'inset 0 0 0 1px color-mix(in srgb, var(--foreground) 35%, transparent)'
                : undefined,
            }
          : undefined
      }
    />
  )
}

/** Decorations live inside a named day/event trigger, never separate tiny targets. */
export function CalendarHorseMarkers({
  horses,
  general = false,
}: {
  horses: ReadonlyArray<CalendarHorse>
  general?: boolean
}) {
  const unique = uniqueCalendarHorses(horses)
  const limit = general ? 2 : 3
  return (
    <span
      aria-hidden="true"
      className="inline-flex min-h-3 shrink-0 items-center gap-0.5"
      data-slot="horse-markers"
    >
      {unique.slice(0, limit).map((horse) => (
        <HorseColourDot key={horse._id} horse={horse} />
      ))}
      {unique.length > limit && (
        <span className="text-xs leading-none tabular-nums">
          +{unique.length - limit}
        </span>
      )}
      {/* One neutral muted dot marks events without a horse. */}
      {general && <HorseColourDot />}
    </span>
  )
}

export function HorseCalendarNames({
  horses,
}: {
  horses: ReadonlyArray<CalendarHorse>
}) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
      {uniqueCalendarHorses(horses).map((horse) => (
        <span key={horse._id} className="inline-flex items-center gap-1.5">
          <HorseColourDot horse={horse} />
          {getHorseDisplayName(horse)}
        </span>
      ))}
    </span>
  )
}

export function HorseColourLegend({
  horses,
  general = false,
}: {
  horses: ReadonlyArray<CalendarHorse>
  general?: boolean
}) {
  const t = useT()
  const [open, setOpen] = useSessionState(
    'paddock:calendar:horse-legend',
    false,
    (value) => (typeof value === 'boolean' ? value : undefined),
  )
  const unique = uniqueCalendarHorses(horses)
  if (!unique.length && !general) return null
  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="text-sm"
    >
      <summary className="app-control-focus flex min-h-11 w-fit cursor-pointer list-none items-center gap-1.5 rounded-control py-3 font-medium [&::-webkit-details-marker]:hidden">
        {t('calendar.horseColours')}
        {unique.length ? ` · ${unique.length}` : ''}
        <DisclosureChevron />
      </summary>
      <div className="grid gap-2 pb-2">
        <HorseCalendarNames horses={unique} />
        {general && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarHorseMarkers horses={[]} general />
            {t('calendar.generalEvent')}
          </span>
        )}
        <p className="text-muted-foreground">
          {t('calendar.horseColoursHelp')}
        </p>
      </div>
    </details>
  )
}
