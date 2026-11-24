export const currencies = [
  'GBP',
  'EUR',
  'PLN',
  'USD',
  'CHF',
  'SEK',
  'NOK',
  'DKK',
  'CZK',
  'CAD',
  'AUD',
  'NZD',
] as const
export type Currency = (typeof currencies)[number]

export const isCurrency = (value: unknown): value is Currency =>
  currencies.includes(value as Currency)

// shortcut: only regions whose currency is listed above; extend both when a new market needs it.
const regionCurrency: Record<string, Currency> = {
  GB: 'GBP',
  PL: 'PLN',
  US: 'USD',
  CH: 'CHF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  CZ: 'CZK',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  ...Object.fromEntries(
    'AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK'
      .split(' ')
      .map((region) => [region, 'EUR' as const]),
  ),
}

/** The currency of the first browser language that names a known country, e.g. pl-PL. */
export function currencyForLanguages(languages: ReadonlyArray<string>) {
  for (const tag of languages) {
    try {
      const region = new Intl.Locale(tag).region
      if (region && regionCurrency[region]) return regionCurrency[region]
    } catch {
      /* Ignore malformed language tags. */
    }
  }
  return undefined
}
