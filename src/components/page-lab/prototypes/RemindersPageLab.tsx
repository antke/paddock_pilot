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
  const horseOptions = getLabHorseOptions(data)
  const primaryHorse = horseOptions[0]
  const secondaryHorse = horseOptions[1] ?? primaryHorse
  const now = Date.now()
  const reminders: Array<CareReminderListItem> = [
    {
      reminder: createLabReminder({
        id: 'long-description-pending',
        stableId: data.stable._id,
        createdBy: data.stable.ownerId,
        title: 'Follow up on lameness notes after turnout change',
        description:
          'Long description stress test. Check whether this copy still reads as part of the main reminder content when the action buttons have more height and padding. It should not feel as though the notes have dropped underneath the button group.\n\nUse this card to tune the spacing before applying the correction.',
        category: 'vet',
        dueDate: dateKeyFromOffset(-2),
        priority: 'high',
        status: 'pending',
        horseId: primaryHorse.id,
      }),
      horseName: primaryHorse.name,
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
      canManage: true,
    },
    {
      reminder: createLabReminder({
        id: 'completed-linked-horse',
        stableId: data.stable._id,
        createdBy: data.stable.ownerId,
        title: 'Upload vaccination certificate',
        description: 'Completed state should only show the remove action.',
        category: 'admin',
        dueDate: dateKeyFromOffset(-8),
        priority: 'low',
        status: 'completed',
        horseId: secondaryHorse.id,
        completedAt: now,
      }),
      horseName: secondaryHorse.name,
      canManage: true,
    },
    {
      reminder: createLabReminder({
        id: 'dismissed-stable-wide',
        stableId: data.stable._id,
        createdBy: data.stable.ownerId,
        title: 'Review winter supplement plan',
        description:
          'Dismissed stable-wide reminder with notes, no linked horse name, and only the remove action.',
        category: 'nutrition',
        dueDate: dateKeyFromOffset(10),
        status: 'dismissed',
      }),
      canManage: true,
    },
  ]

  return (
    <FilterableCareRemindersCard
      as="h1"
      title="Care reminders"
      reminders={reminders}
      canAddReminder
      horseOptions={horseOptions}
      chrome="cards"
      emptyMessage="No fixture reminders are available."
      onAdd={async () => undefined}
      onComplete={async () => undefined}
      onDismiss={async () => undefined}
      onRemove={async () => undefined}
    />
  )
}

function getLabHorseOptions(data: DashboardLabData): Array<LabHorseOption> {
  if (data.horses.length > 0) {
    return data.horses.map((horse) => ({
      id: horse._id,
      name: horse.name,
    }))
  }

  return [
    {
      id: 'lab-horse-juniper' as Doc<'horses'>['_id'],
      name: 'Juniper',
    },
  ]
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
