import { useState } from 'react'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { TrainingCalendar } from '#/components/training/TrainingCalendar'
import { EventEditor } from '#/components/forms/event/EventEditor'
import { createEventEditorValues } from '#/components/forms/event/eventEditorValues'
import { formatDateKey } from '#/lib/dateDisplay'
import { trainingActivities } from 'shared/training/trainingSchema'

/** Local sample records exercise the production calendar and editor without saving live data. */
export function TrainingPageLab({ data }: { data: DashboardLabData }) {
  const horses = data.horses
    .filter((horse) => horse.stableId === data.stable._id)
    .slice(0, 3)
  const today = new Date()
  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - ((today.getDay() + 6) % 7),
  )
  const [events, setEvents] = useState<Array<Doc<'events'>>>(() =>
    horses.flatMap((horse, horseIndex) =>
      [0, 2, 4].map((offset, i) => ({
        _id: `sample-training-${horseIndex}-${i}` as Id<'events'>,
        _creationTime: 0,
        stableId: data.stable._id,
        createdBy: horse.ownerId,
        horseIds: [horse._id],
        type: 'training',
        title: i === 1 ? 'Trainer lesson' : 'Training session',
        date: formatDateKey(
          new Date(
            monday.getFullYear(),
            monday.getMonth(),
            monday.getDate() + offset,
          ),
        ),
        time: '10:00',
        status: 'planned',
        training: {
          activities: [trainingActivities[(horseIndex + i) % 5]],
          format: i === 1 ? 'lesson' : 'regular',
          durationMinutes: 40,
          rider: 'Sample rider',
          focus: 'Rhythm and transitions',
          nextFocus: 'Practise balanced transitions',
        },
      })),
    ),
  )
  const [records, setRecords] = useState<Array<Doc<'trainingRecords'>>>(() =>
    events
      .filter((event) => event.date < formatDateKey(today))
      .slice(0, 5)
      .map((event) => ({
        _id: `sample-record-${event._id}` as Id<'trainingRecords'>,
        _creationTime: 0,
        stableId: event.stableId,
        eventId: event._id,
        horseId: event.horseIds[0],
        date: event.date,
        status: 'completed',
        details: event.training!,
        recordedBy: event.createdBy,
        createdAt: 0,
        updatedAt: 0,
      })),
  )
  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Training log"
        description="Preview with sample records. The form below saves only in this preview."
      />
      <TrainingCalendar
        stableId={data.stable._id}
        horses={horses}
        events={events}
        records={records}
        initialDate={formatDateKey(today)}
      />
      <EventEditor
        mode="create"
        feature="training"
        horses={horses}
        initialValues={{
          ...createEventEditorValues(data.stable._id),
          date: formatDateKey(today),
          time: '10:00',
          type: 'training',
          training: { activities: ['flatwork'], format: 'regular' },
        }}
        onSave={async (values) => {
          const event: Doc<'events'> = {
            ...values,
            _id: `sample-training-${Date.now()}` as Id<'events'>,
            _creationTime: Date.now(),
            stableId: data.stable._id,
            horseIds: values.horseIds as Array<Id<'horses'>>,
            createdBy: data.stable.ownerId,
            status: 'planned',
            recurrence: values.recurring ? values.recurrence : undefined,
          }
          setEvents((current) => [...current, event])
          if (values.status === 'completed' && values.training) {
            const details = values.training
            setRecords((current) => [
              ...current,
              ...event.horseIds.map((horseId) => ({
                _id: `sample-record-${event._id}-${horseId}` as Id<'trainingRecords'>,
                _creationTime: Date.now(),
                eventId: event._id,
                horseId,
                stableId: event.stableId,
                date: event.date,
                status: 'completed' as const,
                details,
                recordedBy: event.createdBy,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })),
            ])
          }
          return event._id
        }}
        onSaved={() => undefined}
        completionMessage="Sample training saved in this preview."
      />
    </DashboardPage>
  )
}
