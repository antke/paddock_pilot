import { EventFormFields } from '#/components/forms/event/EventFormFields'
import { eventFormSchema } from '#/components/forms/event/eventFormSchema'
import type {
  EventFormInput,
  EventFormSchema,
} from '#/components/forms/event/eventFormSchema'
import {
  RouteFormActions,
  RouteFormCard,
} from '#/components/forms/RouteFormCard'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/events/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { stableId } = Route.useParams()
  const nav = useNavigate()
  const addEvent = useMutation(api.events.add)

  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stableId as Id<'stables'> }),
  )
  const { data: providerData } = useSuspenseQuery(
    convexQuery(api.stableProviders.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )

  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
    mode: 'onTouched',
    defaultValues: {
      stableId,
      horseIds: [],
      date: '',
      endDate: '',
      time: '',
      type: 'training',
      title: '',
      description: '',
      location: '',
      providerName: '',
      providerPhone: '',
      totalCost: undefined,
      costPerHorse: undefined,
      status: 'planned',
      notesAfterCompletion: '',
      recurring: false,
    },
  })

  const onSubmit = async (data: EventFormSchema) => {
    try {
      const newEventId = await addEvent({
        stableId: stableId as Id<'stables'>,
        horseIds: data.horseIds as Array<Id<'horses'>>,
        date: data.date,
        endDate: data.endDate,
        time: data.time,
        type: data.type,
        title: data.title,
        description: data.description,
        location: data.location,
        providerName: data.providerName,
        providerPhone: data.providerPhone,
        totalCost: data.totalCost,
        costPerHorse: data.costPerHorse,
        status: data.status,
        notesAfterCompletion: data.notesAfterCompletion,
        recurrence: data.recurring ? data.recurrence : undefined,
      })

      showAppSuccessToast({
        title: 'Event created',
        description: <p>{data.title} is ready.</p>,
      })

      nav({
        to: '/stables/$stableId/events/$eventId',
        params: { stableId, eventId: newEventId },
      })
    } catch (err) {
      showAppErrorToast()
    }
  }

  return (
    <RouteFormCard
      formId="event-form"
      title="Add event"
      onSubmit={form.handleSubmit(onSubmit)}
      actions={
        <RouteFormActions
          isSubmitting={form.formState.isSubmitting}
          onReset={() => form.reset()}
          submitLabel="Create event"
          submittingLabel="Creating…"
        />
      }
    >
      <EventFormFields
        control={form.control}
        setValue={form.setValue}
        horses={horses}
        providers={providerData.providers}
        disabled={form.formState.isSubmitting}
      />
    </RouteFormCard>
  )
}
