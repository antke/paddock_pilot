import type { Doc } from 'convex/_generated/dataModel'
import type { EventFormInput } from './eventFormSchema'

/** Store visible defaults once, so validation, reset and dirty checks agree. */
export function getEventEditorDefaults(
  values: EventFormInput,
  includeTrainingDetails = false,
): EventFormInput {
  const recurrence = values.recurrence
  const monthlyMode = recurrence?.monthlyMode ?? 'dayOfMonth'
  return {
    ...values,
    status: values.status ?? 'planned',
    recurrence: recurrence
      ? {
          ...recurrence,
          end: recurrence.end ?? { type: 'never' },
          ...(recurrence.frequency === 'monthly'
            ? {
                monthlyMode,
                ...(monthlyMode === 'dayOfMonth' &&
                (recurrence.dayOfMonth ?? 0) >= 29
                  ? {
                      missingDateStrategy:
                        recurrence.missingDateStrategy ?? 'lastDayOfMonth',
                    }
                  : {}),
              }
            : {}),
        }
      : undefined,
    ...(includeTrainingDetails
      ? {
          training: {
            ...values.training,
            activities: values.training?.activities ?? [],
            format: values.training?.format ?? 'regular',
          },
        }
      : {}),
  }
}

export function createEventEditorValues(stableId?: string): EventFormInput {
  return {
    stableId,
    horseIds: [],
    peopleIds: [],
    date: '',
    endDate: '',
    time: '',
    type: 'other',
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
  eventHorses: Array<
    Pick<Doc<'eventsHorses'>, 'horseId' | 'status' | 'participationEndsAt'>
  >,
): EventFormInput {
  const selectedHorseIds = eventHorses
    .filter(
      ({ status, participationEndsAt }) =>
        !participationEndsAt && status !== 'declined' && status !== 'withdrawn',
    )
    .map(({ horseId }) => horseId)

  return {
    stableId: event.stableId,
    peopleIds: event.peopleIds ?? [],
    horseIds: selectedHorseIds.length > 0 ? selectedHorseIds : event.horseIds,
    date: event.date,
    endDate: event.endDate ?? '',
    time: event.time,
    type: event.type,
    training: event.training,
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
