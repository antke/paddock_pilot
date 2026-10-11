import { useQuery, useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useNavigate } from '@tanstack/react-router'
import { EventEditor } from '#/components/forms/event/EventEditor'
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
  eventId,
  horseId,
  training,
  intent,
  date,
  participationId,
}: {
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
  const stableHorses = useQuery(
    api.horses.list,
    data?.event.stableId ? { stableId: data.event.stableId } : 'skip',
  )
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
  if (
    !mine ||
    (eventId &&
      (data === undefined ||
        permissions === undefined ||
        (data?.event.type === 'training' && trainingData === undefined) ||
        (data?.event.stableId && !stableHorses)))
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
      horses={
        stableHorses ?? mine.filter((h) => h.access.canEditPersonalRecords)
      }
      onSave={async (values) => {
        const { recurring, horseIds, stableId: _stableId, ...fields } = values
        const args = {
          ...fields,
          horseIds: horseIds as Array<Id<'horses'>>,
          stableId: data?.event.stableId,
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
          return eventId
        }
        return add(args)
      }}
      onSaved={(id) =>
        navigate({
          to: '/events/$eventId',
          params: { eventId: id },
          search: { date, horseId, participationId },
        })
      }
    />
  )
}
export function PersonalEventDetail({
  eventId,
  date,
  horseId,
  participationId,
}: {
  eventId: Id<'events'>
  date?: string
  horseId?: string
  participationId?: string
}) {
  const t = useT()
  const data = useQuery(api.events.getWithHorses, {
    id: eventId,
    horseId: horseId as Id<'horses'> | undefined,
    participationId: participationId as Id<'eventsHorses'> | undefined,
  })
  const permissions = useQuery(api.events.getPermissions, { id: eventId })
  const training = useQuery(
    api.training.listForEvent,
    data?.event.type === 'training'
      ? {
          eventId,
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
        event={data.event}
        editSearch={
          isTraining
            ? { date: selectedDate, horseId, participationId }
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
      {isTraining && entries.length === 0 && (
        <p role="status">{t('trainingViews.noSession')}</p>
      )}
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
