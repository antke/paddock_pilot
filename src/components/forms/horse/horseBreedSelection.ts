import { horseBreeds } from 'shared/horses/horseBreeds'

/** Suggestions stay controlled, while an existing record can retain its legacy breed. */
export function horseBreedOptions(
  existingBreed?: string,
): ReadonlyArray<string> {
  const legacy = existingBreed?.trim()
  return legacy && !horseBreeds.some((breed) => breed === legacy)
    ? [legacy, ...horseBreeds]
    : horseBreeds
}

export function matchHorseBreed(value: string, existingBreed?: string) {
  const query = value.trim().toLocaleLowerCase()
  if (!query) return ''
  return horseBreedOptions(existingBreed).find(
    (breed) => breed.toLocaleLowerCase() === query,
  )
}
