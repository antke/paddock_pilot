import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { EventFormFields } from '#/components/forms/event/EventFormFields'
import type {
  EventFormInput,
  EventFormSchema,
} from '#/components/forms/event/eventFormSchema'
import {
  RouteFormActions,
  RouteFormCard,
} from '#/components/forms/RouteFormCard'
import type { Id } from 'convex/_generated/dataModel'
import { useForm } from 'react-hook-form'

const fixtureProviders = [
  {
    _id: 'lab-provider-vet' as Id<'stableProviders'>,
    type: 'vet' as const,
    name: 'Dr. Halley Morse',
    phone: '(555) 014-3300',
  },
  {
    _id: 'lab-provider-farrier' as Id<'stableProviders'>,
    type: 'farrier' as const,
    name: 'Ben Carter',
    phone: '(555) 014-1902',
  },
]

export function FormsPageLab({ data }: { data: DashboardLabData }) {
  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    defaultValues: {
      stableId: data.stable._id,
      horseIds: [data.horses[0]._id],
      date: '2026-07-24',
      endDate: '',
      time: '10:30',
      type: 'hoof_trimming',
      title: 'Summer shoeing visit',
      description: '',
      location: 'Main yard',
      providerName: 'Ben Carter',
      providerPhone: '(555) 014-1902',
      totalCost: 240,
      costPerHorse: 80,
      status: 'planned',
      notesAfterCompletion: '',
      recurring: false,
    },
  })

  return (
    <RouteFormCard
      formId="page-lab-event-form"
      title="Add event"
      onSubmit={(event) => event.preventDefault()}
      actions={
        <RouteFormActions
          isSubmitting={false}
          onReset={() => form.reset()}
          submitLabel="Create event"
          submittingLabel="Creating event..."
          resetLabel="Reset"
        />
      }
    >
      <EventFormFields
        control={form.control}
        setValue={form.setValue}
        horses={data.horses}
        providers={fixtureProviders}
      />
    </RouteFormCard>
  )
}
