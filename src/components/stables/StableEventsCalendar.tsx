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
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="grid gap-1.5">
          <CardTitle>Calendar</CardTitle>
          <CardDescription>{formatMonthLabel(visibleMonth)}</CardDescription>
        </div>

        <div className="flex gap-2">
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
        <div className="grid grid-cols-7 border-l border-t text-xs">
          {weekdayLabels.map((weekday) => (
            <div
              key={weekday}
              className="border-b border-r bg-muted/40 p-2 text-center font-medium text-muted-foreground"
            >
              {weekday}
            </div>
          ))}

          {leadingDays.map((day) => (
            <div key={`empty-${day}`} className="min-h-24 border-b border-r" />
          ))}

          {monthDays.map(({ date, key }) => {
            const dateEvents = eventsByDate.get(key) ?? []
            const visibleEvents = dateEvents.slice(0, 2)
            const hiddenEventCount = dateEvents.length - visibleEvents.length

            return (
              <div
                key={key}
                className={cn(
                  'min-h-24 border-b border-r p-2',
                  key === todayKey && 'bg-primary/5',
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
                    <Link
                      key={event._id}
                      to="/stables/$stableId/events/$eventId"
                      params={{ stableId: event.stableId, eventId: event._id }}
                      className="truncate border bg-background px-1.5 py-1 text-[0.7rem]"
                      title={event.title}
                    >
                      {event.time} {event.title}
                    </Link>
                  ))}

                  {hiddenEventCount > 0 && (
                    <p className="text-[0.7rem] text-muted-foreground">
                      +{hiddenEventCount} more
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
