import { describe, expect, it } from 'vitest'
import { localeInstances, resources } from './resources'

function flatten(value: object, prefix = ''): Record<string, string> {
  return Object.fromEntries(
    Object.entries(value).flatMap(([key, item]) => {
      const path = prefix ? `${prefix}.${key}` : key
      return typeof item === 'string'
        ? [[path, item]]
        : Object.entries(flatten(item, path))
    }),
  )
}
const baseKey = (key: string) =>
  key.replace(/_(one|two|few|many|zero|other)$/, '')
const parameters = (value: string) =>
  [...value.matchAll(/{{\s*(\w+)\s*}}/g)].map((m) => m[1]).sort()

describe('translation catalogs', () => {
  it('covers the same messages and interpolation parameters in both languages', () => {
    const english = flatten(resources.en.app)
    const polish = flatten(resources.pl.app)
    expect([...new Set(Object.keys(polish).map(baseKey))].sort()).toEqual(
      [...new Set(Object.keys(english).map(baseKey))].sort(),
    )
    for (const [key, translation] of Object.entries(polish)) {
      const source = english[key] ?? english[`${baseKey(key)}_other`]
      expect(translation.trim(), key).not.toBe('')
      expect(parameters(translation), key).toEqual(parameters(source))
    }
    for (const [locale, messages] of [
      ['en', english],
      ['pl', polish],
    ] as const) {
      const pluralBases = new Set(
        Object.keys(messages)
          .filter((key) => key.endsWith('_other'))
          .map(baseKey),
      )
      for (const base of pluralBases) {
        for (const suffix of new Intl.PluralRules(locale).resolvedOptions()
          .pluralCategories) {
          expect(
            messages[`${base}_${suffix}`],
            `${locale}:${base}_${suffix}`,
          ).toBeTruthy()
        }
      }
    }
  })
  it.each([
    [0, 'koni'],
    [1, 'koń'],
    [2, 'konie'],
    [5, 'koni'],
    [12, 'koni'],
    [22, 'konie'],
    [25, 'koni'],
    [1.5, 'konia'],
  ])('renders Polish horse count %s', (count, word) => {
    expect(
      localeInstances.pl.t('counts.horses', { count: Number(count) }),
    ).toBe(`${count} ${word}`)
  })
  it('keeps language instances isolated and uses English fallback', () => {
    expect(localeInstances.pl.t('navigation.home')).toBe('Strona główna')
    expect(localeInstances.en.t('navigation.home')).toBe('Home')
    expect(localeInstances.pl.t('navigation.home', { lng: 'de' })).toBe('Home')
    expect(localeInstances.pl.language).toBe('pl')
  })
})
