import { createFileRoute } from '@tanstack/react-router'
import { PersonalAppointments } from '#/components/ownership/PersonalAppointments'
import { parseAppointmentSearch } from '#/components/ownership/appointmentData'

export const Route = createFileRoute('/events/')({
  validateSearch: parseAppointmentSearch,
  component: AppointmentsPage,
})

function AppointmentsPage() {
  const { view } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <PersonalAppointments
      view={view}
      onViewChange={(next) =>
        void navigate({
          search: next === 'calendar' ? { view: 'calendar' } : {},
          resetScroll: false,
        })
      }
    />
  )
}
