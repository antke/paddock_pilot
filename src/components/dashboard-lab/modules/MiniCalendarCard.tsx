import { cn } from '#/lib/utils'
import { useState } from 'react'
import type {
  DashboardLabChrome,
  DashboardLabData,
  DashboardLabDay,
  DashboardLabEvent,
} from '../dashboardLabTypes'
import {
  dashboardEmptyClassName,
  dashboardInlinePanelClassName,
  dashboardSectionClassName,
} from './dashboardChrome'
import { EventLinkCard } from './EventLinkCard'

type MiniCalendarCardProps = {
  data: DashboardLabData
  layout?: 'wide' | 'compact'
  showSelectedDay?: boolean
  showInlineEvents?: boolean
  chrome?: DashboardLabChrome
}

export function MiniCalendarCard({
  data,
  layout = 'wide',
  showSelectedDay = true,
  showInlineEvents = false,
  chrome = 'cards',
}: MiniCalendarCardProps) {
  const [selectedDayKey, setSelectedDayKey] = useState(data.weekDays[0]?.key)
  const selectedDay =
    data.weekDays.find((day) => day.key === selectedDayKey) ?? data.weekDays[0]
  const isCompact = layout === 'compact'

  return (
    <section
      className={dashboardSectionClassName(
        chrome,
        chrome === 'cards' ? 'md:p-6' : undefined,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Next 7 days</h2>
        </div>
      </div>
      {showInlineEvents ? (
        <div className="grid gap-3 md:grid-cols-7">
          {data.weekDays.map((day, index) => (
            <DayColumn
              key={day.key}
              day={day}
              isToday={index === 0}
              chrome={chrome}
            />
          ))}
        </div>
      ) : (
        <>
          <div className={cn('grid gap-2', !isCompact && 'md:grid-cols-7')}>
            {data.weekDays.map((day, index) => (
              <div key={day.key} className="grid content-start">
                <button
                  type="button"
                  onClick={() => setSelectedDayKey(day.key)}
                  className={cn(
                    dashboardInlinePanelClassName(
                      chrome,
                      'text-left transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none',
                    ),
                    chrome === 'cards' && 'hover:border-primary/25',
                    isCompact
                      ? 'grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3'
                      : 'grid min-h-28 content-between',
                    chrome !== 'bare' &&
                      index === 0 &&
                      'border-primary/25 bg-primary/8 text-primary',
                    chrome !== 'bare' &&
                      selectedDay?.key === day.key &&
                      'border-primary/45 bg-primary/10 ring-1 ring-primary/20',
                    showSelectedDay &&
                      selectedDay?.key === day.key &&
                      (chrome === 'cards' || chrome === 'soft') &&
                      'rounded-b-none',
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
                  <span
                    className={cn(
                      'text-2xl font-semibold',
                      isCompact && 'order-1',
                    )}
                  >
                    {day.day}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium text-muted-foreground',
                      isCompact && 'order-3 justify-self-end',
                    )}
                  >
                    {day.eventCount === 0
                      ? 'Clear'
                      : `${day.eventCount} ${day.eventCount === 1 ? 'event' : 'events'}`}
                  </span>
                </button>
                {showSelectedDay && (
                  <SelectedDayPanel
                    day={day}
                    chrome={chrome}
                    isExpanded={selectedDay?.key === day.key}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function DayColumn({
  day,
  isToday,
  chrome,
}: {
  day: DashboardLabDay
  isToday: boolean
  chrome: DashboardLabChrome
}) {
  return (
    <div
      className={cn(
        'grid content-start gap-3',
        dashboardInlinePanelClassName(chrome),
        isToday && chrome !== 'bare' && 'border-primary/25 bg-primary/8',
      )}
    >
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
          <p className={dashboardEmptyClassName(chrome, 'text-xs')}>
            Nothing planned.
          </p>
        ) : (
          day.events.map((event) => (
            <EventLinkCard
              key={event._id}
              event={event}
              density="compact"
              showDate={false}
              chrome={chrome}
            />
          ))
        )}
      </div>
    </div>
  )
}

function SelectedDayPanel({
  day,
  chrome,
  isExpanded,
}: {
  day: DashboardLabDay
  chrome: DashboardLabChrome
  isExpanded: boolean
}) {
  return (
    <div
      aria-hidden={!isExpanded}
      className={cn(
        'grid overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-out',
        isExpanded ? 'max-h-96 gap-2 opacity-100' : 'max-h-0 gap-0 opacity-0',
        chrome === 'cards' &&
          cn(
            'rounded-b-row border border-t-0 border-border-subtle bg-background/55 px-3',
            isExpanded ? 'py-3' : 'py-0',
          ),
        chrome === 'soft' &&
          cn(
            'rounded-b-row bg-background/55 px-3',
            isExpanded ? 'py-3' : 'py-0',
          ),
        chrome === 'lines' &&
          cn(
            'border-t border-border-subtle px-0',
            isExpanded ? 'py-3' : 'py-0',
          ),
        (chrome === 'open' || chrome === 'bare') &&
          (isExpanded ? 'py-3' : 'py-0'),
      )}
    >
      {isExpanded &&
        (day.events.length === 0 ? (
          <p className={dashboardEmptyClassName(chrome)}>
            Nothing planned for this day.
          </p>
        ) : (
          day.events.map((event) => (
            <EventLinkCard
              key={event._id}
              event={event}
              showDate={false}
              chrome={chrome}
            />
          ))
        ))}
    </div>
  )
}
