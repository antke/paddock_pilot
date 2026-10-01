import { useT } from '#/i18n/LocaleProvider'
import type { Doc } from 'convex/_generated/dataModel'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardTabbedCard } from '#/components/dashboard/DashboardTabbedCard'
import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { ButtonLink } from '#/components/ui/button'
import { EventTable } from './EventList'

export type EventsView = 'calendar' | 'log'
export function parseEventsSearch(search: Record<string, unknown>): {
  view?: 'log'
} {
  return search.view === 'log' ? { view: 'log' } : {}
}

export function StableEventsPage({
  stableId,
  events,
  view = 'calendar',
  onViewChange,
}: {
  stableId: string
  events: Array<Doc<'events'>>
  view?: EventsView
  onViewChange: (view: EventsView) => void
}) {
  const t = useT()

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
        actions={
          <ButtonLink
            to="/stables/$stableId/events/create"
            params={{ stableId }}
            action="create"
          >
            {t('eventViews.add')}
          </ButtonLink>
        }
      >
        {view === 'calendar' ? (
          <StableEventsCalendar events={events} surface="flat" />
        ) : (
          <EventTable stableId={stableId} events={events} />
        )}
      </DashboardTabbedCard>
    </DashboardPage>
  )
}
