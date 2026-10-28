import { useT } from '#/i18n/LocaleProvider'
import { EventCreationEditor as EventEditor } from '#/components/forms/event/EventCreationEditor'
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
  const t = useT()

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
      audienceEnabled
      key={stableId}
      mode="create"
      initialValues={createEventEditorValues(stableId)}
      horses={horses}
      providers={providerData.providers}
      onSave={async (data) => {
        return addEvent({
          sharedStableIds: data.sharedStableIds as Id<'stables'>[] | undefined,
          destination: data.destination,
          sharing: data.sharing,
          requestId: data.requestId,
          errorFormat: 'structured',
          stableId: data.stableId as Id<'stables'> | undefined,
          peopleIds: data.peopleIds as Array<Id<'users'>> | undefined,
          horseIds: data.horseIds as Array<Id<'horses'>>,
          date: data.date,
          endDate: data.endDate,
          time: data.time,
          type: data.type,
          training: data.training,
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
          title: t('trainingViews.eventCreated'),
          description: <p>{t('trainingViews.ready', { title: data.title })}</p>,
        })
      }}
      onSaved={async (eventId) => {
        await nav({
          to: '/events/$eventId',
          params: { eventId },
        })
      }}
    />
  )
}
