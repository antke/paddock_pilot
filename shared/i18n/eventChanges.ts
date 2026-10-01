import type { Locale } from './locale'

export const eventChangeMessages = {
  title: { en: 'Event title changed', pl: 'Zmieniono nazwę wydarzenia' },
  date: { en: 'Event date changed', pl: 'Zmieniono datę wydarzenia' },
  time: { en: 'Event time changed', pl: 'Zmieniono godzinę wydarzenia' },
  location: { en: 'Location changed', pl: 'Zmieniono miejsce' },
  status: { en: 'Event status changed', pl: 'Zmieniono status wydarzenia' },
  provider: { en: 'Provider changed', pl: 'Zmieniono specjalistę' },
  horses: { en: 'Horse participation changed', pl: 'Zmieniono udział koni' },
} as const
export type EventChangeCode = keyof typeof eventChangeMessages

export function translateEventChange(change: string, locale: Locale = 'en') {
  const entry = Object.entries(eventChangeMessages).find(
    ([key, value]) => key === change || value.en === change,
  )?.[1]
  // Older deliveries may include free-form descriptions. Preserve those verbatim.
  return entry?.[locale] ?? change
}
