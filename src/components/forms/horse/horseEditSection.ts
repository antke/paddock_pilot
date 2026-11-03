/** Contextual horse edit entries open the shared editor at one of these tasks. */
export const horseEditSections = [
  'photo',
  'profile',
  'identification',
  'care',
  'feeding',
] as const

export type HorseEditSection = (typeof horseEditSections)[number]

export type HorseEditSearch = { section?: HorseEditSection }

export function parseHorseEditSearch(
  search: Record<string, unknown>,
): HorseEditSearch {
  return horseEditSections.includes(search.section as HorseEditSection)
    ? { section: search.section as HorseEditSection }
    : {}
}

/** The collapsible editor section that owns each contextual task. */
export const horseEditFormSection = {
  photo: 'details',
  profile: 'details',
  identification: 'care',
  care: 'care',
  feeding: 'nutrition',
} as const satisfies Record<HorseEditSection, 'details' | 'care' | 'nutrition'>
