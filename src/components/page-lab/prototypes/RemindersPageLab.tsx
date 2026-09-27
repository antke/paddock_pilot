import { useEffect, useRef, useState } from 'react'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import type { CareReminderListItem } from '#/components/reminders/CareRemindersCard'
import { FilterableCareRemindersCard } from '#/components/reminders/FilterableCareRemindersCard'
import { formatDateKey } from '#/lib/dateDisplay'
import type { Doc } from 'convex/_generated/dataModel'

type RemindersPageLabProps = {
  data: DashboardLabData
}

type CareReminderDoc = Doc<'careReminders'>

type LabHorseOption = {
  id: Doc<'horses'>['_id']
  name: string
}

type LabReminderInput = {
  id: string
  stableId: CareReminderDoc['stableId']
  createdBy: CareReminderDoc['createdBy']
  title: CareReminderDoc['title']
  description?: CareReminderDoc['description']
  category: CareReminderDoc['category']
  dueDate: CareReminderDoc['dueDate']
  priority?: CareReminderDoc['priority']
  status: CareReminderDoc['status']
  horseId?: CareReminderDoc['horseId']
  completedAt?: CareReminderDoc['completedAt']
}

export function RemindersPageLab({ data }: RemindersPageLabProps) {
  return <ReminderSampleControls key={data.stable._id} data={data} />
}

function ReminderSampleControls({ data }: RemindersPageLabProps) {
  const [scenario, setScenario] = useState('mixed')
  return (
    <div className="grid gap-6">
      <Field>
        <FieldLabel htmlFor="reminder-sample-state">
          Sample reminders
        </FieldLabel>
        <Select
          id="reminder-sample-state"
          value={scenario}
          onChange={(event) => setScenario(event.target.value)}
        >
          <option value="mixed">Mixed states and permissions</option>
          <option value="read-only">Read-only</option>
          <option value="empty">Empty list</option>
          <option value="loading">Loading list</option>
        </Select>
      </Field>
      <ReminderSample key={scenario} data={data} scenario={scenario} />
    </div>
  )
}

function ReminderSample({
  data,
  scenario,
}: RemindersPageLabProps & { scenario: string }) {
  const [outcome, setOutcome] = useState('success')
  const [delay, setDelay] = useState('150')
  const [pending, setPending] = useState(0)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const generation = useRef(0)
  const serial = useRef(0)
  useEffect(
    () => () => {
      generation.current += 1
    },
    [],
  )
  const horseOptions = getLabHorseOptions(data)
  const primaryHorse = horseOptions[0]
  const secondaryHorse = horseOptions[1] ?? primaryHorse
  const now = Date.now()
  const [reminders, setReminders] = useState<Array<CareReminderListItem>>(() =>
    scenario === 'empty'
      ? []
      : [
          {
            reminder: createLabReminder({
              id: 'long-description-pending',
              stableId: data.stable._id,
              createdBy: data.stable.ownerId,
              title: 'Follow up on lameness notes after turnout change',
              description:
                'Check the notes from the last visit and ask whether the new turnout routine has helped. Record any changes in gait before arranging the next check.\n\nShare the update with the horse’s owner and the vet.',
              category: 'vet',
              dueDate: dateKeyFromOffset(-2),
              priority: 'high',
              status: 'pending',
              horseId: primaryHorse?.id,
            }),
            horseName: primaryHorse?.name,
            canManage: true,
          },
          {
            reminder: createLabReminder({
              id: 'no-description-stable-wide',
              stableId: data.stable._id,
              createdBy: data.stable.ownerId,
              title: 'Order yard first-aid refills',
              category: 'admin',
              dueDate: dateKeyFromOffset(4),
              priority: 'medium',
              status: 'pending',
            }),
            canManage: false,
          },
          {
            reminder: createLabReminder({
              id: 'completed-linked-horse',
              stableId: data.stable._id,
              createdBy: data.stable.ownerId,
              title: 'Upload vaccination certificate',
              description:
                'The certificate is filed with the horse’s documents.',
              category: 'admin',
              dueDate: dateKeyFromOffset(-8),
              priority: 'low',
              status: 'completed',
              horseId: secondaryHorse?.id,
              completedAt: now,
            }),
            horseName: secondaryHorse?.name,
            canManage: true,
          },
          {
            reminder: createLabReminder({
              id: 'dismissed-stable-wide',
              stableId: data.stable._id,
              createdBy: data.stable.ownerId,
              title: 'Review winter supplement plan',
              description:
                'Reviewed with the owner. No change is needed this season.',
              category: 'nutrition',
              dueDate: dateKeyFromOffset(10),
              status: 'dismissed',
            }),
            canManage: true,
          },
        ],
  )

  const apply = async (description: string, update: () => void) => {
    const currentGeneration = generation.current
    setPending((count) => count + 1)
    setFailed(false)
    setMessage('Sample request pending. No change has been applied yet.')
    try {
      await new Promise((resolve) => setTimeout(resolve, Number(delay)))
      if (currentGeneration !== generation.current)
        throw new Error('Sample changed')
      if (outcome === 'failure') {
        setOutcome('success')
        setFailed(true)
        setMessage(
          'Sample request failed. Nothing changed; try the action again.',
        )
        throw new Error('Simulated reminder failure')
      }
      update()
      setMessage(
        `${description} applied locally. No live reminder was saved or removed.`,
      )
    } finally {
      if (currentGeneration === generation.current)
        setPending((count) => count - 1)
    }
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Sample reminders · Add, complete, dismiss and remove affect this preview
        only. No live records change.
      </p>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor="reminder-sample-outcome">
            Next sample result
          </FieldLabel>
          <Select
            id="reminder-sample-outcome"
            disabled={pending > 0}
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
          >
            <option value="success">Success</option>
            <option value="failure">Failure, then retry</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="reminder-sample-delay">
            Sample response time
          </FieldLabel>
          <Select
            id="reminder-sample-delay"
            disabled={pending > 0}
            value={delay}
            onChange={(event) => setDelay(event.target.value)}
          >
            <option value="150">Quick response</option>
            <option value="3000">3 seconds — inspect pending state</option>
          </Select>
        </Field>
      </FieldGrid>
      {message ? (
        failed ? (
          <Alert variant="destructive">
            <AlertTitle>Sample request failed</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : (
          <p role="status" className="text-sm text-foreground">
            {message}
          </p>
        )
      ) : null}
      <FilterableCareRemindersCard
        pageLayout
        reminders={
          scenario === 'read-only'
            ? reminders.map((item) => ({ ...item, canManage: false }))
            : reminders
        }
        canAddReminder={scenario !== 'read-only' && scenario !== 'loading'}
        horseOptions={horseOptions}
        chrome="flat"
        isLoading={scenario === 'loading'}
        emptyMessage="No care reminders have been added for this stable yet."
        onAdd={(values) =>
          apply('Sample addition', () => {
            const horseIds =
              values.targetType === 'horses'
                ? values.horseIds
                : values.targetType === 'horse'
                  ? [values.horseId]
                  : [undefined]
            const additions = horseIds.map((horseId) => ({
              reminder: createLabReminder({
                ...values,
                id: `added-${++serial.current}`,
                stableId: data.stable._id,
                createdBy: data.stable.ownerId,
                status: 'pending',
                horseId: horseId as CareReminderDoc['horseId'],
              }),
              horseName: horseOptions.find((horse) => horse.id === horseId)
                ?.name,
              canManage: true,
            }))
            setReminders((items) => [...additions, ...items])
          })
        }
        onComplete={(reminder) =>
          apply('Sample completion', () =>
            setReminders((items) =>
              items.map((item) =>
                item.reminder._id === reminder._id
                  ? {
                      ...item,
                      reminder: {
                        ...item.reminder,
                        status: 'completed',
                        completedAt: Date.now(),
                      },
                    }
                  : item,
              ),
            ),
          )
        }
        onDismiss={(reminder) =>
          apply('Sample dismissal', () =>
            setReminders((items) =>
              items.map((item) =>
                item.reminder._id === reminder._id
                  ? {
                      ...item,
                      reminder: { ...item.reminder, status: 'dismissed' },
                    }
                  : item,
              ),
            ),
          )
        }
        onRemove={(reminder) =>
          apply('Sample removal', () =>
            setReminders((items) =>
              items.filter((item) => item.reminder._id !== reminder._id),
            ),
          )
        }
      />
    </>
  )
}

function getLabHorseOptions(data: DashboardLabData): Array<LabHorseOption> {
  return data.horses.map((horse) => ({ id: horse._id, name: horse.name }))
}

function createLabReminder({
  id,
  stableId,
  createdBy,
  title,
  description,
  category,
  dueDate,
  priority,
  status,
  horseId,
  completedAt,
}: LabReminderInput): CareReminderDoc {
  const createdAt = Date.now()

  return {
    _id: `lab-reminder-${id}` as CareReminderDoc['_id'],
    _creationTime: createdAt,
    stableId,
    ...(horseId ? { horseId } : {}),
    title,
    ...(description ? { description } : {}),
    category,
    dueDate,
    ...(priority ? { priority } : {}),
    status,
    ...(completedAt ? { completedAt } : {}),
    createdBy,
    createdAt,
    updatedAt: createdAt,
  }
}

function dateKeyFromOffset(offsetDays: number) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return formatDateKey(date)
}
