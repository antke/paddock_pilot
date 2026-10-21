import type { CalendarHorse } from 'shared/horses/horseCalendarColours'
import { useT } from '#/i18n/LocaleProvider'
import type { Doc } from 'convex/_generated/dataModel'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardTabbedCard } from '#/components/dashboard/DashboardTabbedCard'
import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { ButtonLink } from '#/components/ui/button'
import { EventTable } from './EventList'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { MobileActionBar } from '#/components/layout/MobileActionBar'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'

export type EventsView = 'calendar' | 'log'
export function parseEventsSearch(search: Record<string, unknown>): {
  view?: 'log'
} {
  return search.view === 'log' ? { view: 'log' } : {}
}

export function StableEventsPage({
  stableId,
  events,
  horses = [],
  view = 'calendar',
  onViewChange,
}: {
  stableId: string
  events: Array<Doc<'events'>>
  horses?: ReadonlyArray<CalendarHorse>
  view?: EventsView
  onViewChange: (view: EventsView) => void
}) {
  const t = useT()
  const small = useSmallScreen()
  const taskState = useTaskOriginState()
  const addEvent = (
    <ButtonLink
      to="/stables/$stableId/events/create"
      params={{ stableId }}
      state={taskState}
      action="schedule"
    >
      {t('eventViews.add')}
    </ButtonLink>
  )

  const views = [
    { id: 'calendar', label: t('eventViews.calendar') },
    { id: 'log', label: t('eventViews.log') },
  ] as const
  return (
    <DashboardPage>
      <DashboardPageHeader title={t('eventViews.events')} />
      <DashboardTabbedCard
        activeId={view}
        items={views}
        ariaLabel={t('eventViews.views')}
        onSelect={onViewChange}
        actions={small ? undefined : addEvent}
      >
        {view === 'calendar' ? (
          <StableEventsCalendar
            events={events}
            horses={horses}
            surface="flat"
            storageKey={`paddock:events:${stableId}:month`}
          />
        ) : (
          <EventTable stableId={stableId} events={events} />
        )}
      </DashboardTabbedCard>
      {small && <MobileActionBar>{addEvent}</MobileActionBar>}
    </DashboardPage>
  )
}
