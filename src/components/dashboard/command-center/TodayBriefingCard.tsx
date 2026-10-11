import { useLocale, useT } from '#/i18n/LocaleProvider'
import { CaretDownIcon } from '@phosphor-icons/react'
import { formatShortDateKey } from '#/lib/dateDisplay'
import { dashboardUpcomingEvents } from './dashboardUpcomingEvents'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import type {
  DashboardCommandChrome,
  DashboardActivityData,
} from './dashboardTypes'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { EventLinkCard } from './EventLinkCard'
import { ButtonLink } from '#/components/ui/button'

type TodayBriefingCardProps = {
  className?: string
  data: DashboardActivityData
  chrome?: DashboardCommandChrome
  compact?: boolean
  canCreate?: boolean
  showWeek?: boolean
}

export function TodayBriefingCard({
  className,
  data,
  chrome = 'soft',
  compact = false,
  canCreate = true,
  showWeek = !compact,
}: TodayBriefingCardProps) {
  const t = useT()
  const { locale } = useLocale()
  const taskState = useTaskOriginState()
  const upcoming = dashboardUpcomingEvents(data)

  const events = data.todayEvents
  const recordChrome = 'flat' as const

  return (
    <DashboardSection
      chrome={chrome}
      className={className}
      padding={chrome === 'cards' ? 'roomy' : 'default'}
      title={t('dashboard.events')}
      size="section"
      titleStyle="display"
      headerLayout="inline"
      actions={
        !compact &&
        canCreate && (
          <ButtonLink
            to={
              data.stable
                ? '/stables/$stableId/events/create'
                : '/events/create'
            }
            params={{ stableId: data.stable?._id ?? '' }}
            state={taskState}
            action="schedule"
            size="sm"
            className="min-h-11"
          >
            {t('dashboard.addEvent')}
          </ButtonLink>
        )
      }
    >
      {!compact && (
        <h3 className="text-base font-semibold">
          {t('dashboard.today')} ·{' '}
          {formatShortDateKey(data.weekDays[0].key, locale)}
        </h3>
      )}
      {events.length === 0 ? (
        <DashboardEmptyState chrome={recordChrome} spacing="flush">
          {t('dashboard.quietDay')}
        </DashboardEmptyState>
      ) : (
        <DashboardItemList className="max-md:gap-3">
          {(compact ? events.slice(0, 2) : events).map((event) => (
            <EventLinkCard
              key={event.occurrenceKey ?? event._id}
              event={event}
              chrome={recordChrome}
              accent="primary"
              showDate={false}
              dayKey={data.weekDays[0]?.key}
            />
          ))}
        </DashboardItemList>
      )}
      {showWeek && (
        <details
          key={data.stable?._id ?? 'personal'}
          className="group border-t border-border-subtle"
        >
          <summary className="app-control-focus flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-2 py-3 [&::-webkit-details-marker]:hidden">
            <CaretDownIcon
              aria-hidden="true"
              className="shrink-0 group-open:rotate-180"
            />
            <span className="font-semibold">{t('dashboard.week')}</span>
            <span className="text-sm text-muted-foreground">
              {t('dashboard.eventCount', { count: upcoming.events.length })}
            </span>
          </summary>
          <div className="grid gap-4 pb-2">
            <p className="text-sm text-muted-foreground">
              {formatShortDateKey(upcoming.startKey, locale)} –{' '}
              {formatShortDateKey(upcoming.endKey, locale)}
            </p>
            {upcoming.events.length ? (
              [...new Set(upcoming.events.map((event) => event.date))].map(
                (date) => (
                  <section key={date} className="grid gap-2">
                    <h3 className="text-base font-semibold">
                      {formatShortDateKey(date, locale)}
                    </h3>
                    <DashboardItemList className="max-md:gap-3">
                      {upcoming.events
                        .filter((event) => event.date === date)
                        .map((event) => (
                          <EventLinkCard
                            key={event.occurrenceKey ?? event._id}
                            event={event}
                            chrome="flat"
                            showDate={false}
                            dayKey={date}
                          />
                        ))}
                    </DashboardItemList>
                  </section>
                ),
              )
            ) : (
              <DashboardEmptyState chrome="flat" spacing="flush">
                {t('dashboard.noUpcomingEvents')}
              </DashboardEmptyState>
            )}
          </div>
        </details>
      )}
      <ButtonLink
        to={data.stable ? '/stables/$stableId/events' : '/events'}
        params={{ stableId: data.stable?._id ?? '' }}
        search={data.stable ? undefined : { view: 'calendar' }}
        variant="link"
        className="min-h-11 justify-self-start px-0"
      >
        {compact
          ? t('dashboard.allEvents', { count: events.length })
          : t('dashboard.fullCalendar')}
      </ButtonLink>
    </DashboardSection>
  )
}
