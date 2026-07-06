import { EventFormFields } from '#/components/forms/event/EventFormFields'
import { eventFormSchema } from '#/components/forms/event/eventFormSchema'
import type {
  EventFormInput,
  EventFormSchema,
} from '#/components/forms/event/eventFormSchema'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { convexQuery } from '@convex-dev/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/events/$eventId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { eventId, stableId } = Route.useParams()

  const { data: eventWithHorses } = useSuspenseQuery(
    convexQuery(api.events.getWithHorses, { id: eventId as Id<'events'> }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stableId as Id<'stables'> }),
  )
  const { data: providerData } = useSuspenseQuery(
    convexQuery(api.stableProviders.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )

  if (!eventWithHorses || eventWithHorses.event.stableId !== stableId) {
    return <div>Event not found</div>
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
    .filter((eventHorse) => eventHorse.status !== 'declined')
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

      toast.success('Event updated', {
        description: <p>{data.title} has been updated.</p>,
        position: 'top-right',
      })

      nav({
        to: '/stables/$stableId/events/$eventId',
        params: { stableId: event.stableId, eventId: event._id },
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  return (
    <form id="event-form" onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="w-full bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">Edit event</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <EventFormFields
            control={form.control}
            setValue={form.setValue}
            horses={horses}
            providers={providers}
            disabled={form.formState.isSubmitting}
          />
        </CardContent>

        <CardFooter className="justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting}
            onClick={() => form.reset()}
          >
            Reset
          </Button>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Update Event'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
