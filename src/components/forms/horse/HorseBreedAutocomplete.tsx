import { CheckIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'

import {
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteRoot,
} from '#/components/ui/autocomplete'
import { cn } from '#/lib/utils'
import { horseBreeds } from 'shared/horses/horseBreeds'

type HorseBreedAutocompleteProps = {
  id: string
  name: string
  value: string
  disabled?: boolean
  invalid?: boolean
  onBlur: () => void
  onValueChange: (value: string) => void
}

export function HorseBreedAutocomplete({
  id,
  name,
  value,
  disabled = false,
  invalid = false,
  onBlur,
  onValueChange,
}: HorseBreedAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [legacyBreed] = useState(() => {
    if (!value || horseBreeds.some((breed) => breed === value)) return undefined
    return value
  })
  const breedOptions = legacyBreed
    ? ([legacyBreed, ...horseBreeds] as const)
    : horseBreeds

  const commitKnownBreed = () => {
    const selectedBreed = breedOptions.find(
      (breed) => breed.toLocaleLowerCase() === query.toLocaleLowerCase(),
    )

    const nextValue = selectedBreed ?? ''
    setQuery(nextValue)
    onValueChange(nextValue)
    onBlur()
  }

  useEffect(() => {
    setQuery(value)
  }, [value])

  return (
    <AutocompleteRoot
      items={breedOptions}
      value={query}
      disabled={disabled}
      openOnInputClick
      autoHighlight
      onValueChange={(nextValue, eventDetails) => {
        setQuery(nextValue)

        if (eventDetails.reason === 'item-press' || nextValue === '') {
          onValueChange(nextValue)
        }
      }}
    >
      <AutocompleteInput
        id={id}
        name={name}
        disabled={disabled}
        aria-invalid={invalid}
        placeholder="Search horse breeds"
        autoComplete="off"
        triggerLabel="Show horse breeds"
        onBlur={commitKnownBreed}
      />

      <AutocompleteContent>
        <AutocompleteGroup>
          <AutocompleteGroupLabel>Horse breeds</AutocompleteGroupLabel>
          <AutocompleteList>
            {(breed: string) => {
              const selected = breed === value

              return (
                <AutocompleteItem
                  key={breed}
                  value={breed}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
                >
                  <span className="truncate text-sm font-semibold text-foreground">
                    {breed}
                  </span>
                  <CheckIcon
                    aria-hidden="true"
                    className={cn(
                      'size-4 text-primary transition-opacity',
                      selected ? 'opacity-100' : 'opacity-0',
                    )}
                    weight="bold"
                  />
                </AutocompleteItem>
              )
            }}
          </AutocompleteList>
        </AutocompleteGroup>
        <AutocompleteEmpty>
          No breed matches. Choose a breed from the available list.
        </AutocompleteEmpty>
      </AutocompleteContent>
    </AutocompleteRoot>
  )
}
