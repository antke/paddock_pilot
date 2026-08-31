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
import { cn } from '#/lib/utils'
import { useId, useState } from 'react'
import { EventRow } from '#/components/events/EventRow'
import type {
  DashboardCommandChrome,
  DashboardCommandData,
  DashboardCommandDay,
} from './dashboardTypes'

type MiniCalendarCardProps = {
  className?: string
  data: DashboardCommandData
  showSelectedDay?: boolean
  showInlineEvents?: boolean
  chrome?: DashboardCommandChrome
}

export function MiniCalendarCard({
  className,
  data,
  showSelectedDay = true,
  showInlineEvents = false,
  chrome = 'cards',
}: MiniCalendarCardProps) {
  const [selectedDayKey, setSelectedDayKey] = useState<string>()
  const selectedDay = data.weekDays.find((day) => day.key === selectedDayKey)
  const controlChrome = chrome
  const calendarId = useId()
  const mobilePanelId = `${calendarId}-mobile-selected-day`
  const desktopPanelId = `${calendarId}-desktop-selected-day`

  return (
    <DashboardSection
      className={className}
      chrome={chrome}
      gap="compact"
      padding={chrome === 'cards' ? 'roomy' : 'default'}
      title="Next 7 days"
      description="Select a day to see what’s planned."
      descriptionSize="sm"
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
        <div
          data-slot="calendar-week-grid"
          role="group"
          aria-label="Seven-day schedule"
          className={calendarWeekGridClassName({ isCompact: true })}
        >
          {data.weekDays.map((day, index) => {
            const isSelected = selectedDayKey === day.key
            const controlId = `${calendarId}-day-${day.key}-button`

            return (
              <div
                key={day.key}
                data-slot="calendar-week-day-column"
                className={calendarWeekDayColumnClassName('min-w-0')}
              >
                <DashboardInlinePanelButton
                  id={controlId}
                  data-slot="calendar-week-day-button"
                  onClick={() =>
                    setSelectedDayKey((currentDayKey) =>
                      currentDayKey === day.key ? undefined : day.key,
                    )
                  }
                  aria-controls={
                    showSelectedDay && isSelected
                      ? `${mobilePanelId} ${desktopPanelId}`
                      : undefined
                  }
                  aria-current={index === 0 ? 'date' : undefined}
                  aria-expanded={showSelectedDay ? isSelected : undefined}
                  aria-pressed={isSelected}
                  chrome={controlChrome}
                  className={calendarWeekDayButtonClassName({
                    chrome: controlChrome,
                    className: cn(
                      'bg-card lg:min-h-28 lg:grid-cols-1 lg:content-between lg:items-stretch lg:gap-2',
                      showSelectedDay &&
                        isSelected &&
                        'rounded-b-none lg:rounded-b-row',
                    ),
                    isCompact: true,
                    isSelected,
                    isToday: index === 0,
                  })}
                >
                  <span
                    data-slot="calendar-week-day-label"
                    className={calendarWeekDayLabelClassName({
                      isCompact: true,
                      className: 'lg:order-none',
                    })}
                  >
                    {day.label}
                  </span>
                  <span
                    data-slot="calendar-week-day-number"
                    className={calendarWeekDayNumberClassName({
                      isCompact: true,
                      className: 'lg:order-none',
                    })}
                  >
                    {day.day}
                  </span>
                  <span
                    data-slot="calendar-week-day-meta"
                    className={calendarWeekDayMetaClassName({
                      isCompact: true,
                      className:
                        'lg:order-none lg:justify-self-start lg:text-left',
                    })}
                  >
                    {day.eventCount === 0
                      ? 'Clear'
                      : formatCountLabel(day.eventCount, 'event')}
                  </span>
                </DashboardInlinePanelButton>
                {showSelectedDay && isSelected && (
                  <SelectedDayPanel
                    id={mobilePanelId}
                    labelledBy={controlId}
                    day={day}
                    chrome={controlChrome}
                    className="bg-card"
                    wrapperClassName="lg:hidden"
                  />
                )}
              </div>
            )
          })}

          {showSelectedDay && selectedDay && (
            <SelectedDayPanel
              id={desktopPanelId}
              labelledBy={`${calendarId}-day-${selectedDay.key}-button`}
              day={selectedDay}
              chrome={controlChrome}
              className="bg-card lg:mt-2 lg:rounded-row"
              wrapperClassName="hidden lg:col-span-7 lg:grid"
            />
          )}
        </div>
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
  id,
  labelledBy,
  day,
  chrome,
  className,
  wrapperClassName,
}: {
  id: string
  labelledBy: string
  day: DashboardCommandDay
  chrome: DashboardCommandChrome
  className?: string
  wrapperClassName?: string
}) {
  return (
    <div
      id={id}
      data-slot="calendar-selected-day-panel"
      role="region"
      aria-labelledby={labelledBy}
      aria-live="polite"
      className={wrapperClassName}
    >
      <div
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
  )
}
