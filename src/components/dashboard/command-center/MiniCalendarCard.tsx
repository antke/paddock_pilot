import { formatShortWeekdayDate } from '#/lib/dateDisplay'
import { useT, useLocale } from '#/i18n/LocaleProvider'
import {
  calendarSelectedDayPanelClassName,
  calendarWeekDayButtonClassName,
  calendarWeekDayColumnClassName,
  calendarWeekDayLabelClassName,
  calendarWeekDayMetaClassName,
  calendarWeekDayNumberClassName,
  calendarWeekDayPanelClassName,
  calendarWeekGridClassName,
  calendarWeekPaperClassName,
} from '#/components/events/EventCalendarChrome'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import {
  DashboardInlinePanel,
  DashboardInlinePanelButton,
} from '#/components/dashboard/DashboardInlinePanel'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { cn } from '#/lib/utils'
import { useId, useState } from 'react'
import { EventLinkCard } from './EventLinkCard'
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
  chrome = 'soft',
}: MiniCalendarCardProps) {
  const t = useT()
  const { locale } = useLocale()

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
      title={t('dashboard.week')}
      description={t('dashboard.weekHelp')}
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
          aria-label={t('dashboard.weekSchedule')}
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
                      'lg:min-h-28 lg:grid-cols-1 lg:content-between lg:items-stretch lg:justify-items-center lg:text-center lg:gap-2',
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
                    {index === 0
                      ? t('dashboard.today')
                      : formatShortWeekdayDate(day.date, locale)}
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
                        'lg:order-none lg:justify-self-center lg:text-center',
                    })}
                  >
                    {day.eventCount === 0
                      ? t('dashboard.noEntries')
                      : t('dashboard.entries', { count: day.eventCount })}
                  </span>
                </DashboardInlinePanelButton>
                {showSelectedDay && isSelected && (
                  <SelectedDayPanel
                    id={mobilePanelId}
                    labelledBy={controlId}
                    day={day}
                    chrome={controlChrome}
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
              className="lg:mt-2 lg:rounded-row"
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
  const t = useT()
  const { locale } = useLocale()

  return (
    <DashboardInlinePanel
      data-slot="calendar-week-day-panel"
      chrome={chrome}
      stack="default"
      className={calendarWeekDayPanelClassName({
        isToday,
      })}
    >
      <div>
        <p
          data-slot="calendar-week-day-label"
          className={calendarWeekDayLabelClassName()}
        >
          {isToday
            ? t('dashboard.today')
            : formatShortWeekdayDate(day.date, locale)}
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
            {day.eventCount === 0 ? t('dashboard.noEntries') : day.eventCount}
          </p>
        </div>
      </div>

      <DashboardItemList gap="compact">
        {day.events.length === 0 ? (
          <DashboardEmptyState
            chrome={chrome}
            className={calendarWeekPaperClassName()}
            bodyClassName="text-xs leading-5"
          >
            {t('dashboard.calendarEmpty')}
          </DashboardEmptyState>
        ) : (
          day.events.map((event) => (
            <EventLinkCard
              key={event.occurrenceKey ?? event._id}
              event={event}
              density="compact"
              chrome={chrome}
              className={calendarWeekPaperClassName()}
              showDate={false}
              dayKey={day.key}
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
  const t = useT()

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
          <DashboardEmptyState
            chrome={chrome}
            className={calendarWeekPaperClassName()}
          >
            {t('dashboard.dayEmpty')}
          </DashboardEmptyState>
        ) : (
          <DashboardItemList>
            {day.events.map((event) => (
              <EventLinkCard
                key={event.occurrenceKey ?? event._id}
                event={event}
                chrome={chrome}
                className={calendarWeekPaperClassName()}
                showDate={false}
                dayKey={day.key}
              />
            ))}
          </DashboardItemList>
        )}
      </div>
    </div>
  )
}
