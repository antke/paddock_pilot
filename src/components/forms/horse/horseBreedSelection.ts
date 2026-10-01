import {
  getHorseBreedLabel,
  normalizeBreedSearch,
} from 'shared/i18n/horseBreedLabels'
import type { Locale } from 'shared/i18n/locale'
import { horseBreeds } from 'shared/horses/horseBreeds'

/** Keep canonical built-in names and reuse custom breeds saved in this stable. */
export function horseBreedOptions(
  existingBreed?: string,
  additionalBreeds: ReadonlyArray<string> = [],
): ReadonlyArray<string> {
  const options = new Map(
    horseBreeds.map((breed) => [breed.toLocaleLowerCase(), breed as string]),
  )
  for (const value of [...additionalBreeds, existingBreed]) {
    const breed = value?.trim()
    if (breed && !options.has(breed.toLocaleLowerCase()))
      options.set(breed.toLocaleLowerCase(), breed)
  }
  return [...options.values()]
}

export function matchHorseBreed(
  value: string,
  existingBreed?: string,
  additionalBreeds: ReadonlyArray<string> = [],
  locale: Locale = 'en',
) {
  const query = normalizeBreedSearch(value)
  if (!query) return ''
  const options = horseBreedOptions(existingBreed, additionalBreeds)
  // Prefer an existing custom value over a colliding translated label.
  return (
    options.find((breed) => normalizeBreedSearch(breed) === query) ??
    options.find(
      (breed) =>
        normalizeBreedSearch(getHorseBreedLabel(breed, locale)) === query,
    )
  )
}
