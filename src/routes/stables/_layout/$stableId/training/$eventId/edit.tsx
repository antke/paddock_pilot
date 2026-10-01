import { useT } from '#/i18n/LocaleProvider'
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
  '/stables/_layout/$stableId/training/$eventId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const t = useT()

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

  if (
    !eventWithHorses ||
    eventWithHorses.event.stableId !== stableId ||
    eventWithHorses.event.type !== 'training'
  ) {
    return <RouteEntityNotFoundAlert entity="event" />
  }
  if (!permissions?.canManageEvent) {
    return (
      <RouteStatusAlert
        tone="warning"
        title={t('trainingViews.readOnlyTraining')}
        description={t('trainingViews.editPermission')}
        actions={
          <ButtonLink
            to="/stables/$stableId/training/$eventId"
            params={{ stableId, eventId }}
          >
            {t('uiRemainder.returnTraining')}
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
  const t = useT()

  const nav = useNavigate()
  const updateEvent = useMutation(api.events.update)
  return (
    <EventEditor
      mode="edit"
      feature="training"
      initialValues={{
        ...editEventEditorValues(event, eventHorses),
        training: event.training ?? {
          activities: ['other'],
          format: 'regular',
        },
      }}
      horses={horses}
      providers={providers}
      onSave={async (data) => {
        await updateEvent({
          errorFormat: 'structured',
          id: event._id,
          stableId: event.stableId,
          horseIds: data.horseIds as Array<Id<'horses'>>,
          date: data.date,
          endDate: data.endDate,
          time: data.time,
          type: 'training',
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
        return event._id
      }}
      onAcknowledged={(_eventId, data) => {
        showAppSuccessToast({
          title: t('trainingViews.sessionUpdated'),
          description: (
            <p>{t('trainingViews.updated', { title: data.title })}</p>
          ),
        })
      }}
      onSaved={async (eventId) => {
        await nav({
          to: '/stables/$stableId/training/$eventId',
          params: { stableId: event.stableId, eventId },
        })
      }}
    />
  )
}
