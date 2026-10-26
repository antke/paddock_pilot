import { TrainingSessionCompletionControl } from '#/components/training/TrainingSessionCompletionControl'
import { EventParticipation } from '#/components/events/EventParticipation'
import { RecordAudienceLabel } from '#/components/sharing/RecordAudienceLabel'
import { TrainingCompletionSummary } from '#/components/training/TrainingCompletionSummary'
import { useQuery, useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { EventCreationEditor as EventEditor } from '#/components/forms/event/EventCreationEditor'
import {
  createEventEditorValues,
  editEventEditorValues,
} from '#/components/forms/event/eventEditorValues'
import { EventDetail } from '#/components/events/EventDetail'
import { EventHorseServiceDetailsCard } from '#/components/events/EventHorseServiceDetailsCard'
import { useT } from '#/i18n/LocaleProvider'
import { RoutePending } from '#/components/layout/RoutePending'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { TrainingCompletionControl } from '#/components/training/TrainingCompletionControl'
import { TrainingRecordCard } from '#/components/training/TrainingRecordCard'
import { getTrainingEntries } from '#/components/training/trainingCalendarData'
import { useLocalDateContext } from '#/lib/useLocalDateContext'

export function PersonalEventEditor({
  stableId: workspaceStableId,
  eventId,
  horseId,
  training,
  intent,
  date,
  participationId,
}: {
  stableId?: string
  eventId?: Id<'events'>
  horseId?: string
  training?: boolean
  intent?: 'record'
  date?: string
  participationId?: string
}) {
  const providers = useQuery(api.personalProviders.list)
  const mine = useQuery(api.horses.listMine)
  const data = useQuery(
    api.events.getWithHorses,
    eventId ? { id: eventId } : 'skip',
  )
  const permissions = useQuery(
    api.events.getPermissions,
    eventId ? { id: eventId } : 'skip',
  )
  // A personal carer may edit a stable-origin event without stable membership.
  // Use the authorized roster options instead of querying that stable directly.
  const stableOptions = useQuery(
    api.events.creationOptions,
    data?.event.stableId ? {} : 'skip',
  )
  const stableHorses = data?.event.stableId
    ? stableOptions?.stables.find((stable) => stable.id === data.event.stableId)
        ?.horses
    : undefined
  const trainingData = useQuery(
    api.training.listForEvent,
    eventId && data?.event.type === 'training'
      ? {
          eventId,
          horseId: horseId as Id<'horses'> | undefined,
          participationId: participationId as Id<'eventsHorses'> | undefined,
        }
      : 'skip',
  )
  const selectedRecords = trainingData?.records.filter(
    (record) =>
      record.date === (date ?? data?.event.date) &&
      (!horseId || record.horseId === horseId),
  )
  const selectedRecord =
    selectedRecords?.length === 1 &&
    (horseId || trainingData?.horses.length === 1) &&
    selectedRecords[0].canEdit &&
    (!data?.event.stableId || permissions?.role === 'owner')
      ? selectedRecords[0]
      : undefined
  const add = useMutation(api.events.add)
  const update = useMutation(api.events.update)
  const navigate = useNavigate()
  const savedSearch = useRef({ date, horseId, participationId })
  if (
    !mine ||
    (eventId &&
      (data === undefined ||
        permissions === undefined ||
        (data?.event.type === 'training' && trainingData === undefined) ||
        (data?.event.stableId && !stableOptions)))
  )
    return <RoutePending />
  if (eventId && (!data || !permissions?.canManageEvent))
    return <RouteEntityNotFoundAlert entity="event" />
  const initial = data
    ? {
        ...editEventEditorValues(data.event, data.eventHorses),
        ...(selectedRecord ? { training: selectedRecord.details } : {}),
      }
    : {
        ...createEventEditorValues(),
        horseIds: horseId ? [horseId] : [],
        ...(training ? { type: 'training' as const } : {}),
        ...(training && intent === 'record'
          ? {
              status: 'completed' as const,
              time: new Date().toTimeString().slice(0, 5),
              training: { activities: [], format: 'regular' as const },
            }
          : {}),
      }
  return (
    <EventEditor
      audienceEnabled
      eventContext={data?.event.stableId ? 'stable' : 'personal'}
      scheduleOnly={Boolean(
        data?.event.stableId && permissions?.role !== 'owner',
      )}
      key={
        eventId
          ? `${eventId}:${date ?? ''}:${horseId ?? ''}`
          : (horseId ?? 'new')
      }
      mode={eventId ? 'edit' : 'create'}
      feature={
        training || data?.event.type === 'training' ? 'training' : 'events'
      }
      initialValues={initial}
      providers={providers}
      horses={[
        ...new Map(
          [
            ...(stableHorses ??
              (data?.event.stableId
                ? []
                : mine.filter((h) => h.access.canEditPersonalRecords))),
            ...(data?.horses ?? []),
          ].map((horse) => [horse._id, horse]),
        ).values(),
      ]}
      onSave={async (values) => {
        const {
          recurring,
          horseIds,
          stableId: _stableId,
          destination,
          ...fields
        } = values
        const args = {
          ...fields,
          horseIds: horseIds as Array<Id<'horses'>>,
          stableId: eventId
            ? data?.event.stableId
            : (_stableId as Id<'stables'> | undefined),
          recurrence: recurring ? values.recurrence : undefined,
        }
        if (eventId) {
          await update({
            ...args,
            id: eventId,
            trainingOccurrenceDate: date ?? data?.event.date,
            trainingHorseId: horseId as Id<'horses'> | undefined,
            trainingRecordId: selectedRecord?._id,
          })
          const addedHorseIds = horseIds.filter(
            (id) => !data?.event.horseIds.includes(id as Id<'horses'>),
          )
          const replacedHorseId = horseId ?? selectedRecord?.horseId
          const savedDate =
            data &&
            fields.date !== data.event.date &&
            (!data.event.recurrence || selectedRecord)
              ? new Date(
                  Date.parse(`${date ?? data.event.date}T00:00:00Z`) +
                    Date.parse(`${fields.date}T00:00:00Z`) -
                    Date.parse(`${data.event.date}T00:00:00Z`),
                )
                  .toISOString()
                  .slice(0, 10)
              : date
          savedSearch.current =
            replacedHorseId &&
            !horseIds.includes(replacedHorseId) &&
            addedHorseIds.length === 1
              ? {
                  date: savedDate,
                  horseId: addedHorseIds[0],
                  participationId: undefined,
                }
              : replacedHorseId && !horseIds.includes(replacedHorseId)
                ? {
                    date: savedDate,
                    horseId: undefined,
                    participationId: undefined,
                  }
                : { date: savedDate, horseId, participationId }
          return eventId
        }
        return add({ ...args, destination, errorFormat: 'structured' })
      }}
      onSaved={(id) =>
        navigate({
          to: '/events/$eventId',
          params: { eventId: id },
          search: { ...savedSearch.current, stableId: workspaceStableId },
        })
      }
    />
  )
}
export function PersonalEventDetail({
  eventId,
  stableId,
  date,
  horseId,
  participationId,
}: {
  eventId: Id<'events'>
  stableId?: string
  date?: string
  horseId?: string
  participationId?: string
}) {
  const t = useT()
  const data = useQuery(api.events.getWithHorses, {
    id: eventId,
    stableId: stableId as Id<'stables'> | undefined,
    horseId: horseId as Id<'horses'> | undefined,
    participationId: participationId as Id<'eventsHorses'> | undefined,
  })
  const permissions = useQuery(api.events.getPermissions, { id: eventId })
  const training = useQuery(
    api.training.listForEvent,
    data?.event.type === 'training'
      ? {
          eventId,
          stableId: stableId as Id<'stables'> | undefined,
          horseId: horseId as Id<'horses'> | undefined,
          participationId: participationId as Id<'eventsHorses'> | undefined,
        }
      : 'skip',
  )
  const { today } = useLocalDateContext()
  if (data === undefined || permissions === undefined) return <RoutePending />
  if (!data || !permissions) return <RouteEntityNotFoundAlert entity="event" />
  const isTraining = data.event.type === 'training'
  if (isTraining && training === undefined) return <RoutePending />
  const selectedDate = date ?? data.event.date
  const entries = training
    ? getTrainingEntries({
        ...training,
        start: selectedDate,
        end: selectedDate,
        today,
      })
    : []
  return (
    <DashboardPage>
      <EventDetail
        stableId={stableId}
        event={data.event}
        createdByName={data.createdByName}
        editSearch={
          isTraining
            ? { date: selectedDate, horseId, participationId, stableId }
            : undefined
        }
        headerActions={
          entries.length === 1 &&
          entries[0].horse.canRecord &&
          entries[0].occurrence.startDate <= today ? (
            <TrainingCompletionControl entry={entries[0]} labelled />
          ) : undefined
        }
        horses={data.horses}
        canManageEvent={
          permissions.canManageEvent &&
          !(horseId && data.eventHorses.some((r) => r.participationEndsAt))
        }
        showHorses={!isTraining}
        showServiceDetails={!isTraining}
      />
      <EventParticipation eventId={eventId} />
      {isTraining && entries.length === 0 && (
        <p role="status">{t('trainingViews.noSession')}</p>
      )}
      {entries.map((entry) => (
        <RecordAudienceLabel
          key={entry.key}
          horseId={entry.horse._id}
          recordId={entry.occurrence.eventId}
          date={entry.occurrence.startDate}
        />
      ))}
      <TrainingCompletionSummary entries={entries} />
      <TrainingSessionCompletionControl entries={entries} stableId={stableId} />
      {entries.map((entry) => (
        <TrainingRecordCard
          key={entry.key}
          entry={entry}
          showCompletion={entries.length > 1}
        />
      ))}
      {isTraining && (
        <EventHorseServiceDetailsCard eventId={eventId} trainingDisclosure />
      )}
    </DashboardPage>
  )
}
