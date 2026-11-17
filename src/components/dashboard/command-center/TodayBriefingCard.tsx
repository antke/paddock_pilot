import { useLocale, useT } from '#/i18n/LocaleProvider'
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
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import { EventLinkCard } from './EventLinkCard'
import { ButtonLink } from '#/components/ui/button'
import { DisclosureChevron } from '#/components/ui/disclosure-chevron'
import { SeeAllLink } from './SeeAllLink'

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
        <>
          <SeeAllLink
            to={data.stable ? '/stables/$stableId/events' : '/events'}
            params={{ stableId: data.stable?._id ?? '' }}
            search={data.stable ? undefined : { view: 'calendar' }}
          >
            {compact
              ? t('dashboard.allEvents', { count: events.length })
              : t('dashboard.fullCalendar')}
          </SeeAllLink>
          {canCreate && (
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
          )}
        </>
      }
    >
      <DashboardInlineHeader
        as="h3"
        title={
          <>
            {t('dashboard.today')} ·{' '}
            {formatShortDateKey(data.weekDays[0].key, locale)}
          </>
        }
      />
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
          className="border-t border-border-subtle"
        >
          <summary className="app-control-focus flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-2 py-3 [&::-webkit-details-marker]:hidden">
            <span className="font-semibold">{t('dashboard.week')}</span>
            <span className="text-sm text-muted-foreground">
              {t('dashboard.eventCount', { count: upcoming.events.length })}
            </span>
            <DisclosureChevron className="ml-auto" />
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
                    <DashboardInlineHeader
                      as="h3"
                      title={formatShortDateKey(date, locale)}
                    />
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
    </DashboardSection>
  )
}
