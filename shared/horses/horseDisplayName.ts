export type HorseName = {
  name: string
  nickname?: string
  useNickname?: boolean
}

export function getHorseDisplayName(horse: HorseName): string
export function getHorseDisplayName(
  horse: HorseName | null | undefined,
): string | undefined
export function getHorseDisplayName(horse: HorseName | null | undefined) {
  if (!horse) return undefined
  return (horse.useNickname && horse.nickname?.trim()) || horse.name
}
