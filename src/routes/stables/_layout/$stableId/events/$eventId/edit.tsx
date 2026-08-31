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
import {
  RouteEntityNotFoundAlert,
  RouteStatusAlert,
} from '#/components/layout/RouteStatusAlert'
import { ButtonLink } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/events/$eventId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { eventId, stableId } = Route.useParams()

  const { data: eventWithHorses } = useSuspenseQuery(
    convexQuery(api.events.getWithHorses, { id: eventId }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stableId as Id<'stables'> }),
  )
  const { data: providerData } = useSuspenseQuery(
    convexQuery(api.stableProviders.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.events.getPermissions, { id: eventId as Id<'events'> }),
  )

  if (!eventWithHorses || eventWithHorses.event.stableId !== stableId) {
    return <RouteEntityNotFoundAlert entity="event" />
  }
  if (!permissions?.canManageEvent) {
    return (
      <RouteStatusAlert
        tone="warning"
        title="This event is read-only for you"
        description="Only the stable owner or the member who created this event can edit its shared details."
        actions={
          <ButtonLink
            to="/stables/$stableId/events/$eventId"
            params={{ stableId, eventId }}
          >
            Return to event
          </ButtonLink>
        }
      />
    )
  }

  return (
    <EditEventForm
      key={eventWithHorses.event._id}
      event={eventWithHorses.event}
      eventHorses={eventWithHorses.eventHorses}
      horses={horses}
      providers={providerData.providers}
    />
  )
}

type EditEventFormProps = {
  event: Doc<'events'>
  eventHorses: Array<Doc<'eventsHorses'>>
  horses: Array<
    Doc<'horses'> & {
      profileImageUrl?: string | null
    }
  >
  providers: Array<Doc<'stableProviders'>>
}

function EditEventForm({
  event,
  eventHorses,
  horses,
  providers,
}: EditEventFormProps) {
  const nav = useNavigate()
  const updateEvent = useMutation(api.events.update)
  const selectedHorseIds = eventHorses
    .filter(
      (eventHorse) =>
        eventHorse.status !== 'declined' && eventHorse.status !== 'withdrawn',
    )
    .map((eventHorse) => eventHorse.horseId)

  const form = useForm<EventFormInput, unknown, EventFormSchema>({
    resolver: zodResolver(eventFormSchema),
    mode: 'onTouched',
    defaultValues: {
      stableId: event.stableId,
      horseIds: selectedHorseIds.length > 0 ? selectedHorseIds : event.horseIds,
      date: event.date,
      endDate: event.endDate ?? '',
      time: event.time,
      type: event.type,
      title: event.title,
      description: event.description ?? '',
      location: event.location ?? '',
      providerName: event.providerName ?? '',
      providerPhone: event.providerPhone ?? '',
      totalCost: event.totalCost,
      costPerHorse: event.costPerHorse,
      status: event.status ?? 'planned',
      notesAfterCompletion: event.notesAfterCompletion ?? '',
      recurring: Boolean(event.recurrence),
      recurrence: event.recurrence,
    },
  })

  const onSubmit = async (data: EventFormSchema) => {
    try {
      await updateEvent({
        id: event._id,
        stableId: event.stableId,
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
        title: 'Event updated',
        description: <p>{data.title} has been updated.</p>,
      })

      nav({
        to: '/stables/$stableId/events/$eventId',
        params: { stableId: event.stableId, eventId: event._id },
      })
    } catch (err) {
      showAppErrorToast()
    }
  }

  return (
    <RouteFormCard
      formId="event-form"
      title="Edit event"
      onSubmit={form.handleSubmit(onSubmit)}
      actions={
        <RouteFormActions
          isSubmitting={form.formState.isSubmitting}
          onReset={() => form.reset()}
          submitLabel="Update event"
          submittingLabel="Saving…"
        />
      }
    >
      <EventFormFields
        control={form.control}
        setValue={form.setValue}
        horses={horses}
        providers={providers}
        disabled={form.formState.isSubmitting}
      />
    </RouteFormCard>
  )
}
