import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { DashboardTabbedCard } from '#/components/dashboard/DashboardTabbedCard'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { EventTable } from '#/components/events/EventList'
import { EventRow } from '#/components/events/EventRow'
import { formatEventDate } from '#/components/events/eventDisplay'
import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { RoutePending } from '#/components/layout/RoutePending'
import { MobileActionBar } from '#/components/layout/MobileActionBar'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { ButtonLink } from '#/components/ui/button'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { useAppointmentCopy } from './appointmentCopy'
import { getUpcomingAppointmentOccurrences } from './appointmentData'
import type { AppointmentView } from './appointmentData'

type Appointments = FunctionReturnType<typeof api.events.list>
type ViewProps = {
  view?: AppointmentView
  onViewChange: (view: AppointmentView) => void
}

export function PersonalAppointments(props: ViewProps) {
  const { data: events } = useQuery({
    ...convexQuery(api.events.list),
    throwOnError: true,
  })
  if (events === undefined) return <RoutePending />
  return <PersonalAppointmentsView events={events} {...props} />
}

export function PersonalAppointmentsView({
  events,
  view = 'list',
  onViewChange,
}: ViewProps & { events: Appointments }) {
  const c = useAppointmentCopy()
  const small = useSmallScreen()
  const taskState = useTaskOriginState()
  const addEvent = (
    <ButtonLink to="/events/create" action="schedule" state={taskState}>
      {c.add}
    </ButtonLink>
  )
  return (
    <DashboardPage>
      <DashboardPageHeader title={c.title} description={c.intro} />
      <DashboardTabbedCard
        activeId={view}
        items={[
          { id: 'list', label: c.list, description: c.listHelp },
          { id: 'calendar', label: c.calendar },
        ]}
        ariaLabel={c.views}
        onSelect={onViewChange}
        actions={small ? undefined : addEvent}
      >
        {view === 'calendar' ? (
          <StableEventsCalendar events={events} surface="flat" />
        ) : (
          <EventTable
            events={events}
            chrome="flat"
            emptyTitle={c.empty}
            emptyDescription={c.emptyHelp}
          />
        )}
      </DashboardTabbedCard>
      {small && <MobileActionBar>{addEvent}</MobileActionBar>}
    </DashboardPage>
  )
}

export function UpcomingAppointments({ events }: { events: Appointments }) {
  const c = useAppointmentCopy()
  const t = useT()
  const { locale } = useLocale()
  const { today } = useLocalDateContext()
  const occurrences = useMemo(
    () => getUpcomingAppointmentOccurrences(events, today),
    [events, today],
  )
  return (
    <DashboardSectionCard
      title={c.upcoming}
      description={c.previewHelp}
      actions={
        <ButtonLink to="/events" variant="outline">
          {c.viewAll}
        </ButtonLink>
      }
    >
      {occurrences.length === 0 ? (
        <DashboardEmptyState chrome="flat" spacing="flush">
          {c.emptyUpcoming}
        </DashboardEmptyState>
      ) : (
        <DashboardItemList gap="compact">
          {occurrences.map((occurrence) => (
            <EventRow
              key={occurrence.occurrenceKey}
              event={{
                ...occurrence.event,
                date: occurrence.startDate,
                endDate:
                  occurrence.durationDays > 1 ? occurrence.endDate : undefined,
              }}
              chrome="flat"
              horseCount={occurrence.event.horseIds.length}
              supplementalMeta={
                occurrence.durationDays > 1
                  ? [
                      t('calendar.through', {
                        date: formatEventDate(occurrence.endDate, locale),
                      }),
                    ]
                  : []
              }
            />
          ))}
        </DashboardItemList>
      )}
    </DashboardSectionCard>
  )
}
