export const supportedLocales = ['en', 'pl'] as const
export type Locale = (typeof supportedLocales)[number]
export const defaultLocale: Locale = 'en'
export const displayLocales = { en: 'en-GB', pl: 'pl-PL' } as const

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'pl'
}

export function resolveLocale(
  saved: unknown,
  languages: ReadonlyArray<string> = [],
): Locale {
  if (isLocale(saved)) return saved
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0]
    if (isLocale(base)) return base
  }
  return defaultLocale
}
