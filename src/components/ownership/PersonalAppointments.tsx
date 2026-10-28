import type { ReactNode } from 'react'
import {
  ActivityCalendarFilter,
  useActivityCalendars,
} from '#/components/events/ActivityCalendarFilter'
import { MyActivityInvitations } from '#/components/events/ActivityPeople'
import type { CalendarHorse } from 'shared/horses/horseCalendarColours'
import { useMemo } from 'react'
import type { api } from 'convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { CalendarViewControl } from '#/components/events/CalendarToolbar'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { EventTable } from '#/components/events/EventList'
import { EventRow } from '#/components/events/EventRow'
import { formatEventDate } from '#/components/events/eventDisplay'
import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
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
  const calendars = useActivityCalendars(false)
  return (
    <PersonalAppointmentsView
      horses={calendars.data?.horses ?? []}
      events={calendars.data?.events ?? []}
      {...props}
      notices={<MyActivityInvitations invitationsOnly />}
      filters={
        <ActivityCalendarFilter
          stables={calendars.stables}
          selected={calendars.selected}
          onChange={calendars.setSelected}
          loading={calendars.loading}
        />
      }
    />
  )
}

export function PersonalAppointmentsView({
  events,
  filters,
  notices,
  horses = [],
  view = 'calendar',
  onViewChange,
}: ViewProps & {
  events: Appointments
  filters?: ReactNode
  notices?: ReactNode
  horses?: ReadonlyArray<CalendarHorse>
}) {
  const c = useAppointmentCopy()
  const small = useSmallScreen()
  const taskState = useTaskOriginState()
  const addEvent = (
    <ButtonLink
      to="/events/create"
      action="schedule"
      size="control"
      state={taskState}
    >
      {c.add}
    </ButtonLink>
  )
  const viewControl = (
    <CalendarViewControl
      value={view}
      options={[
        { value: 'calendar', label: c.calendar },
        { value: 'list', label: c.list },
      ]}
      label={c.views}
      onValueChange={onViewChange}
    />
  )
  return (
    <DashboardPage>
      <DashboardPageHeader
        showWorkspace={false}
        title={c.title}
        description={c.intro}
      />
      {filters}
      {notices}
      {view === 'calendar' ? (
        <StableEventsCalendar
          horses={horses}
          events={events}
          storageKey="paddock:events:personal:month"
          viewControl={viewControl}
          actions={addEvent}
        />
      ) : (
        <DashboardSectionCard>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {viewControl}
            {!small && addEvent}
          </div>
          <EventTable
            events={events}
            chrome="flat"
            emptyTitle={c.empty}
            emptyDescription={c.emptyHelp}
          />
        </DashboardSectionCard>
      )}
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
        <ButtonLink to="/events" search={{ view: 'list' }} variant="outline">
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
