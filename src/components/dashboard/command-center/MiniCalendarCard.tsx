import {
  calendarSelectedDayPanelClassName,
  calendarWeekDayButtonClassName,
  calendarWeekDayColumnClassName,
  calendarWeekDayLabelClassName,
  calendarWeekDayMetaClassName,
  calendarWeekDayNumberClassName,
  calendarWeekDayPanelClassName,
  calendarWeekGridClassName,
} from '#/components/events/EventCalendarChrome'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import {
  DashboardInlinePanel,
  DashboardInlinePanelButton,
} from '#/components/dashboard/DashboardInlinePanel'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { formatCountLabel } from '#/lib/numberDisplay'
import { useEffect, useRef, useState } from 'react'
import { EventRow } from '#/components/events/EventRow'
import type {
  DashboardCommandChrome,
  DashboardCommandData,
  DashboardCommandDay,
} from './dashboardTypes'

type MiniCalendarCardProps = {
  data: DashboardCommandData
  layout?: 'wide' | 'compact'
  showSelectedDay?: boolean
  showInlineEvents?: boolean
  chrome?: DashboardCommandChrome
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
  const controlChrome = chrome

  return (
    <DashboardSection
      chrome={chrome}
      gap="compact"
      padding={chrome === 'cards' ? 'roomy' : 'default'}
      title="Next 7 days"
      size="panel"
      titleStyle="display"
    >
      {showInlineEvents ? (
        <div
          data-slot="calendar-week-grid"
          className={calendarWeekGridClassName({ variant: 'columns' })}
        >
          {data.weekDays.map((day, index) => (
            <DayColumn
              key={day.key}
              day={day}
              isToday={index === 0}
              chrome={controlChrome}
            />
          ))}
        </div>
      ) : (
        <>
          <div
            data-slot="calendar-week-grid"
            className={calendarWeekGridClassName({ isCompact })}
          >
            {data.weekDays.map((day, index) => (
              <div
                key={day.key}
                data-slot="calendar-week-day-column"
                className={calendarWeekDayColumnClassName()}
              >
                <DashboardInlinePanelButton
                  data-slot="calendar-week-day-button"
                  onClick={() => setSelectedDayKey(day.key)}
                  chrome={controlChrome}
                  className={calendarWeekDayButtonClassName({
                    chrome: controlChrome,
                    className: 'bg-card',
                    isCompact,
                    isExpanded: selectedDay?.key === day.key,
                    isSelected: selectedDay?.key === day.key,
                    isToday: index === 0,
                    showSelectedDay,
                  })}
                >
                  <span
                    data-slot="calendar-week-day-label"
                    className={calendarWeekDayLabelClassName({ isCompact })}
                  >
                    {day.label}
                  </span>
                  <span
                    data-slot="calendar-week-day-number"
                    className={calendarWeekDayNumberClassName({ isCompact })}
                  >
                    {day.day}
                  </span>
                  <span
                    data-slot="calendar-week-day-meta"
                    className={calendarWeekDayMetaClassName({ isCompact })}
                  >
                    {day.eventCount === 0
                      ? 'Clear'
                      : formatCountLabel(day.eventCount, 'event')}
                  </span>
                </DashboardInlinePanelButton>
                {showSelectedDay && isCompact && (
                  <SelectedDayPanel
                    day={day}
                    chrome={controlChrome}
                    isExpanded={selectedDay?.key === day.key}
                    className="bg-card"
                  />
                )}
              </div>
            ))}
          </div>
          {showSelectedDay && !isCompact && selectedDay && (
            <SelectedDayPanel
              day={selectedDay}
              chrome={controlChrome}
              isExpanded={true}
              className="mt-2 rounded-row bg-card"
            />
          )}
        </>
      )}
    </DashboardSection>
  )
}

function DayColumn({
  day,
  isToday,
  chrome,
}: {
  day: DashboardCommandDay
  isToday: boolean
  chrome: DashboardCommandChrome
}) {
  return (
    <DashboardInlinePanel
      data-slot="calendar-week-day-panel"
      chrome={chrome}
      stack="default"
      className={calendarWeekDayPanelClassName({
        isToday,
        className: 'bg-card',
      })}
    >
      <div>
        <p
          data-slot="calendar-week-day-label"
          className={calendarWeekDayLabelClassName()}
        >
          {day.label}
        </p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <p
            data-slot="calendar-week-day-number"
            className={calendarWeekDayNumberClassName()}
          >
            {day.day}
          </p>
          <p
            data-slot="calendar-week-day-meta"
            className={calendarWeekDayMetaClassName()}
          >
            {day.eventCount === 0 ? 'Clear' : day.eventCount}
          </p>
        </div>
      </div>

      <DashboardItemList gap="compact">
        {day.events.length === 0 ? (
          <DashboardEmptyState
            chrome={chrome}
            className="bg-card"
            bodyClassName="text-xs leading-5"
          >
            Nothing planned.
          </DashboardEmptyState>
        ) : (
          day.events.map((event) => (
            <EventRow
              key={event._id}
              event={event}
              density="compact"
              chrome={chrome}
              className="bg-card"
              variant="contextual"
            />
          ))
        )}
      </DashboardItemList>
    </DashboardInlinePanel>
  )
}

function SelectedDayPanel({
  day,
  chrome,
  isExpanded,
  className,
}: {
  day: DashboardCommandDay
  chrome: DashboardCommandChrome
  isExpanded: boolean
  className?: string
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    const content = contentRef.current
    if (!content) return undefined

    const updateHeight = () => {
      const styles = window.getComputedStyle(content)
      const verticalMargins =
        Number.parseFloat(styles.marginTop) +
        Number.parseFloat(styles.marginBottom)

      setContentHeight(
        Math.ceil(content.getBoundingClientRect().height + verticalMargins),
      )
    }

    updateHeight()

    const resizeObserver = new ResizeObserver(updateHeight)
    resizeObserver.observe(content)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div
      data-slot="calendar-selected-day-panel"
      aria-hidden={!isExpanded}
      className={`app-height-collapse overflow-hidden ${
        isExpanded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        gridTemplateRows:
          isExpanded && contentHeight > 0 ? `${contentHeight}px` : '0px',
      }}
    >
      <div className="min-h-0 overflow-hidden" inert={!isExpanded}>
        <div
          ref={contentRef}
          className={calendarSelectedDayPanelClassName({
            chrome,
            className,
          })}
        >
          {day.events.length === 0 ? (
            <DashboardEmptyState chrome={chrome} className="bg-card">
              Nothing planned for this day.
            </DashboardEmptyState>
          ) : (
            <DashboardItemList>
              {day.events.map((event) => (
                <EventRow
                  key={event._id}
                  event={event}
                  chrome={chrome}
                  className="bg-card"
                  variant="contextual"
                />
              ))}
            </DashboardItemList>
          )}
        </div>
      </div>
    </div>
  )
}
