import { EventEditor } from '#/components/forms/event/EventEditor'
import { createEventEditorValues } from '#/components/forms/event/eventEditorValues'
import { showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'

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

  return (
    <EventEditor
      key={stableId}
      mode="create"
      initialValues={createEventEditorValues(stableId)}
      horses={horses}
      providers={providerData.providers}
      onSave={async (data) => {
        return addEvent({
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
      }}
      onAcknowledged={(_eventId, data) => {
        showAppSuccessToast({
          title: 'Event created',
          description: <p>{data.title} is ready.</p>,
        })
      }}
      onSaved={async (eventId) => {
        await nav({
          to: '/stables/$stableId/events/$eventId',
          params: { stableId, eventId },
        })
      }}
    />
  )
}
