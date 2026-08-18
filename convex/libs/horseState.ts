import type { Doc } from '../_generated/dataModel'

export const isActiveHorse = (
  horse: Doc<'horses'> | null,
): horse is Doc<'horses'> => {
  return horse !== null && horse.deletedAt === undefined
}

export const hasActiveHorse = (
  event: Doc<'events'>,
  activeHorseIds: Set<Doc<'horses'>['_id']>,
) => {
  return (
    event.horseIds.length === 0 ||
    event.horseIds.some((horseId) => activeHorseIds.has(horseId))
  )
}

export const withActiveEventHorseIds = (
  event: Doc<'events'>,
  activeHorseIds: Set<Doc<'horses'>['_id']>,
) => ({
  ...event,
  horseIds: event.horseIds.filter((horseId) => activeHorseIds.has(horseId)),
})
