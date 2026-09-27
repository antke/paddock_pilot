import { EventEditor } from '#/components/forms/event/EventEditor'
import { editEventEditorValues } from '#/components/forms/event/eventEditorValues'
import {
  RouteEntityNotFoundAlert,
  RouteStatusAlert,
} from '#/components/layout/RouteStatusAlert'
import { ButtonLink } from '#/components/ui/button'
import { showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'

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
  return (
    <EventEditor
      mode="edit"
      initialValues={editEventEditorValues(event, eventHorses)}
      horses={horses}
      providers={providers}
      onSave={async (data) => {
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
        return event._id
      }}
      onAcknowledged={(_eventId, data) => {
        showAppSuccessToast({
          title: 'Event updated',
          description: <p>{data.title} has been updated.</p>,
        })
      }}
      onSaved={async (eventId) => {
        await nav({
          to: '/stables/$stableId/events/$eventId',
          params: { stableId: event.stableId, eventId },
        })
      }}
    />
  )
}
