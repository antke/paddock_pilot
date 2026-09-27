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
) {
  const query = value.trim().toLocaleLowerCase()
  if (!query) return ''
  return horseBreedOptions(existingBreed, additionalBreeds).find(
    (breed) => breed.toLocaleLowerCase() === query,
  )
}
