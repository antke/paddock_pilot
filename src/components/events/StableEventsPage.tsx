import type { ReactNode } from 'react'
import type { CalendarHorse } from 'shared/horses/horseCalendarColours'
import { useT } from '#/i18n/LocaleProvider'
import type { Doc } from 'convex/_generated/dataModel'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { CalendarViewControl } from './CalendarToolbar'
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
  filters,
  notices,
  events,
  horses = [],
  view = 'calendar',
  onViewChange,
}: {
  stableId: string
  filters?: ReactNode
  notices?: ReactNode
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
      size="control"
      action="schedule"
    >
      {t('eventViews.add')}
    </ButtonLink>
  )

  const views = [
    { value: 'calendar', label: t('eventViews.calendar') },
    { value: 'log', label: t('eventViews.log') },
  ] as const
  const viewControl = (
    <CalendarViewControl
      value={view}
      options={views}
      label={t('eventViews.views')}
      onValueChange={onViewChange}
    />
  )
  return (
    <DashboardPage>
      <DashboardPageHeader
        showWorkspace={false}
        title={t('eventViews.events')}
      />
      {filters}
      {notices}
      {view === 'calendar' ? (
        <StableEventsCalendar
          events={events}
          horses={horses}
          viewControl={viewControl}
          actions={addEvent}
          storageKey={`paddock:events:${stableId}:month`}
        />
      ) : (
        <DashboardSectionCard>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {viewControl}
            {!small && addEvent}
          </div>
          <EventTable stableId={stableId} events={events} />
        </DashboardSectionCard>
      )}
      {small && <MobileActionBar>{addEvent}</MobileActionBar>}
    </DashboardPage>
  )
}
