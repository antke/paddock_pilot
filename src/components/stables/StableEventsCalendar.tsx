import { Popover } from '@base-ui/react/popover'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { cn } from '#/lib/utils'
import { Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { eventStatusLabels, eventTypeLabels } from 'shared/events/eventSchema'
import {
  addMonths,
  formatDateKey,
  formatMonthLabel,
  getMonthDays,
  groupEventsByDate,
  startOfMonth,
  weekdayLabels,
} from './stableDashboardDates'
import type { StableDashboardEvent } from './stableDashboardDates'

type StableEventsCalendarProps = {
  events: Array<StableDashboardEvent>
}

export function StableEventsCalendar({ events }: StableEventsCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date()),
  )
  const todayKey = formatDateKey(new Date())
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth])
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events])
  const leadingDays = Array.from(
    { length: visibleMonth.getDay() },
    (_, index) => index,
  )

  return (
    <Card className="bg-card/80 shadow-none">
      <CardHeader className="grid gap-4 sm:flex sm:flex-row sm:items-start sm:justify-between">
        <div className="grid gap-1.5">
          <CardTitle>Stable calendar</CardTitle>
          <CardDescription>{formatMonthLabel(visibleMonth)}</CardDescription>
        </div>

        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
          >
            Next
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-panel border border-border-subtle bg-card text-xs">
          <div className="grid grid-cols-7 border-b border-border-subtle bg-muted/50">
            {weekdayLabels.map((weekday) => (
              <div
                key={weekday}
                className="border-r border-border-subtle p-2 text-center font-semibold text-muted-foreground last:border-r-0"
              >
                {weekday}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {leadingDays.map((day) => (
              <div
                key={`empty-${day}`}
                className="min-h-28 border-r border-b border-border-subtle bg-muted/25 last:border-r-0"
              />
            ))}

            {monthDays.map(({ date, key }) => {
              const dateEvents = eventsByDate.get(key) ?? []
              const visibleEvents = dateEvents.slice(0, 2)
              const hiddenEventCount = dateEvents.length - visibleEvents.length

              return (
                <div
                  key={key}
                  className={cn(
                    'min-h-28 border-r border-b border-border-subtle p-2.5 last:border-r-0',
                    key === todayKey &&
                      'bg-primary/5 ring-1 ring-inset ring-primary/20',
                  )}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'font-medium',
                        key === todayKey && 'text-primary',
                      )}
                    >
                      {date.getDate()}
                    </span>

                    {dateEvents.length > 0 && (
                      <Badge variant="secondary">{dateEvents.length}</Badge>
                    )}
                  </div>

                  <div className="grid gap-1">
                    {visibleEvents.map((event) => (
                      <CalendarEventChip key={event._id} event={event} />
                    ))}

                    {hiddenEventCount > 0 && (
                      <p className="rounded-md bg-muted/70 px-2 py-1 text-[0.7rem] font-medium text-muted-foreground">
                        +{hiddenEventCount} more
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CalendarEventChip({ event }: { event: StableDashboardEvent }) {
  return (
    <Popover.Root>
      <Popover.Trigger
        nativeButton={false}
        openOnHover
        delay={120}
        closeDelay={120}
        render={
          <Link
            to="/stables/$stableId/events/$eventId"
            params={{ stableId: event.stableId, eventId: event._id }}
            className="group/event grid gap-0.5 rounded-md border border-primary/15 bg-primary/8 px-2 py-1.5 text-left text-[0.72rem] text-foreground transition-colors hover:border-primary/35 hover:bg-primary/12 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none"
          />
        }
      >
        <span className="truncate font-semibold leading-tight">
          {event.title}
        </span>
        <span className="truncate text-muted-foreground">{event.time}</span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="top" align="start" sideOffset={8}>
          <Popover.Popup
            initialFocus={false}
            className="app-panel-strong z-50 grid w-72 origin-(--transform-origin) gap-3 p-4 text-sm text-popover-foreground outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            <div className="grid gap-1">
              <p className="font-semibold tracking-tight">{event.title}</p>
              <p className="text-muted-foreground">
                {event.date} at {event.time}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{eventTypeLabels[event.type]}</Badge>
              <Badge variant="outline">{eventStatusLabels[event.status]}</Badge>
            </div>

            {event.location && (
              <p className="text-muted-foreground">
                Location: {event.location}
              </p>
            )}

            {event.description && (
              <p className="line-clamp-3 text-muted-foreground">
                {event.description}
              </p>
            )}

            <Link
              to="/stables/$stableId/events/$eventId"
              params={{ stableId: event.stableId, eventId: event._id }}
              className="text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none"
            >
              Open event →
            </Link>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
