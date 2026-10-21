/** Stable identity tokens, independent of coat colour, activity and status. */
export const horseCalendarColourIds = [
  'sage',
  'sky',
  'amber',
  'violet',
  'rose',
  'teal',
  'terracotta',
  'indigo',
  'olive',
  'orchid',
  'slate',
  'gold',
] as const

export type HorseCalendarColourId = (typeof horseCalendarColourIds)[number]
export type HorseCalendarColour = HorseCalendarColourId | `#${string}`

export function isCustomHorseColour(
  value: string | undefined,
): value is `#${string}` {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
}

export function horseCalendarColourCss(colour: HorseCalendarColour): string {
  return isCustomHorseColour(colour) ? colour : `var(--horse-${colour})`
}

export type CalendarHorse = {
  _id: string
  name: string
  nickname?: string
  useNickname?: boolean
  calendarColourId?: string
}

export function getHorseCalendarColour(
  horse: Pick<CalendarHorse, '_id' | 'calendarColourId'>,
): HorseCalendarColour {
  if (isCustomHorseColour(horse.calendarColourId))
    return horse.calendarColourId.toUpperCase() as `#${string}`
  if (
    horseCalendarColourIds.includes(
      horse.calendarColourId as HorseCalendarColourId,
    )
  )
    return horse.calendarColourId as HorseCalendarColourId
  // Legacy records have the same fallback for every viewer, regardless of roster/order.
  let hash = 0
  for (const character of horse._id)
    hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0
  return horseCalendarColourIds[hash % horseCalendarColourIds.length]
}

/** Prefer unused colours, then the least-used colour once the palette is exhausted. */
export function nextHorseCalendarColour(
  horses: ReadonlyArray<CalendarHorse>,
): HorseCalendarColourId {
  const counts = new Map<HorseCalendarColour, number>()
  for (const horse of horses) {
    const colour = getHorseCalendarColour(horse)
    counts.set(colour, (counts.get(colour) ?? 0) + 1)
  }
  return [...horseCalendarColourIds].sort(
    (a, b) => (counts.get(a) ?? 0) - (counts.get(b) ?? 0),
  )[0]
}

export function uniqueCalendarHorses(
  horses: ReadonlyArray<CalendarHorse>,
): Array<CalendarHorse> {
  return [...new Map(horses.map((horse) => [horse._id, horse])).values()].sort(
    (a, b) => a._id.localeCompare(b._id),
  )
}

/** Contextual history must never imply participation by another horse. */
export function eventCalendarHorses(
  event: { horseIds: ReadonlyArray<string>; contextHorseId?: string },
  horses: ReadonlyArray<CalendarHorse>,
): Array<CalendarHorse> {
  const ids = event.contextHorseId ? [event.contextHorseId] : event.horseIds
  return uniqueCalendarHorses(horses.filter((horse) => ids.includes(horse._id)))
}
