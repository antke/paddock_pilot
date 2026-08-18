export const shouldDeleteEventWithHorse = <THorseId>({
  horseId,
  eventHorseIds,
  associatedHorseIds,
}: {
  horseId: THorseId
  eventHorseIds: Array<THorseId>
  associatedHorseIds: Array<THorseId>
}) => {
  return ![...eventHorseIds, ...associatedHorseIds].some(
    (candidateId) => candidateId !== horseId,
  )
}
