import { cn } from '#/lib/utils'
import { useState } from 'react'
import type { DashboardLabData, DashboardLabDay, DashboardLabEvent } from '../dashboardLabTypes'
import { EventLinkCard } from './EventLinkCard'

type MiniCalendarCardProps = {
  data: DashboardLabData
  layout?: 'wide' | 'compact'
  showSelectedDay?: boolean
  showInlineEvents?: boolean
}

export function MiniCalendarCard({
  data,
  layout = 'wide',
  showSelectedDay = true,
  showInlineEvents = false,
}: MiniCalendarCardProps) {
  const [selectedDayKey, setSelectedDayKey] = useState(data.weekDays[0]?.key)
  const selectedDay =
    data.weekDays.find((day) => day.key === selectedDayKey) ?? data.weekDays[0]
  const isCompact = layout === 'compact'

  return (
    <section className="rounded-panel border border-border-subtle bg-card/80 p-5 shadow-control md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Next 7 days</h2>
        </div>
      </div>
      {showInlineEvents ? (
        <div className="grid gap-3 md:grid-cols-7">
          {data.weekDays.map((day, index) => (
            <DayColumn key={day.key} day={day} isToday={index === 0} />
          ))}
        </div>
      ) : (
        <>
          <div className={cn('grid gap-2', !isCompact && 'md:grid-cols-7')}>
            {data.weekDays.map((day, index) => (
              <div key={day.key} className="grid gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDayKey(day.key)}
                  className={cn(
                    'rounded-row border border-border-subtle bg-muted/35 p-3 text-left transition-colors hover:border-primary/25 hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none',
                    isCompact
                      ? 'grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3'
                      : 'grid min-h-28 content-between',
                    index === 0 && 'border-primary/25 bg-primary/8 text-primary',
                    selectedDay?.key === day.key && 'border-primary/45 bg-primary/10 ring-1 ring-primary/20',
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-semibold tracking-tight text-foreground',
                      isCompact && 'order-2',
                    )}
                  >
                    {day.label}
                  </span>
                  <span className={cn('text-2xl font-semibold', isCompact && 'order-1')}>
                    {day.day}
                  </span>
                  <span className={cn('text-xs font-medium text-muted-foreground', isCompact && 'order-3 justify-self-end')}>
                    {day.eventCount === 0
                      ? 'Clear'
                      : `${day.eventCount} ${day.eventCount === 1 ? 'event' : 'events'}`}
                  </span>
                </button>
                {showSelectedDay && selectedDay?.key === day.key && <SelectedDayPanel day={day} />}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function DayColumn({ day, isToday }: { day: DashboardLabDay; isToday: boolean }) {
  return (
    <div className={cn('grid content-start gap-3 rounded-row border border-border-subtle bg-muted/35 p-3', isToday && 'border-primary/25 bg-primary/8')}>
      <div>
        <p className="text-sm font-semibold tracking-tight text-foreground">
          {day.label}
        </p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p className="text-2xl font-semibold">{day.day}</p>
          <p className="text-xs font-medium text-muted-foreground">
            {day.eventCount === 0 ? 'Clear' : day.eventCount}
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        {day.events.length === 0 ? (
          <p className="rounded-md border border-dashed border-border-subtle bg-card/50 p-3 text-xs text-muted-foreground">
            Nothing planned.
          </p>
        ) : (
          day.events.map((event) => (
            <EventLinkCard key={event._id} event={event} density="compact" showDate={false} />
          ))
        )}
      </div>
    </div>
  )
}

function SelectedDayPanel({ day }: { day: DashboardLabDay }) {
  return (
    <div className="rounded-row border border-border-subtle bg-background/55 p-4">
      <div className="grid gap-2">
        {day.events.length === 0 ? (
          <p className="rounded-md border border-dashed border-border-subtle p-3 text-sm text-muted-foreground">
            Nothing planned for this day.
          </p>
        ) : (
          day.events.map((event) => <EventLinkCard key={event._id} event={event} showDate={false} />)
        )}
      </div>
    </div>
  )
}
