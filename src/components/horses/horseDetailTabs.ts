/** Shared by the visible tab rail and the router's direction policy. */
export const horseDetailTabs = [
  'profile',
  'activity',
  'training',
  'care',
  'nutrition',
  'documents',
] as const

export type HorseDetailCategory = (typeof horseDetailTabs)[number]
