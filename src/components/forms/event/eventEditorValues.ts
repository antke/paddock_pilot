import type { Doc } from 'convex/_generated/dataModel'
import type { EventFormInput } from './eventFormSchema'

export function createEventEditorValues(stableId: string): EventFormInput {
  return {
    stableId,
    horseIds: [],
    date: '',
    endDate: '',
    time: '',
    type: 'training',
    title: '',
    description: '',
    location: '',
    providerName: '',
    providerPhone: '',
    totalCost: undefined,
    costPerHorse: undefined,
    status: 'planned',
    notesAfterCompletion: '',
    recurring: false,
  }
}

export function editEventEditorValues(
  event: Doc<'events'>,
  eventHorses: Array<Pick<Doc<'eventsHorses'>, 'horseId' | 'status'>>,
): EventFormInput {
  const selectedHorseIds = eventHorses
    .filter(({ status }) => status !== 'declined' && status !== 'withdrawn')
    .map(({ horseId }) => horseId)

  return {
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
  }
}
