import { CheckIcon } from '@phosphor-icons/react'
import type { Ref } from 'react'

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
import { horseBreedOptions, matchHorseBreed } from './horseBreedSelection'

type HorseBreedAutocompleteProps = {
  id: string
  name: string
  value: string
  existingBreed?: string
  inputRef?: Ref<HTMLInputElement>
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  onBlur: () => void
  onValueChange: (value: string) => void
}

export function HorseBreedAutocomplete({
  id,
  name,
  value,
  existingBreed,
  inputRef,
  disabled = false,
  invalid = false,
  describedBy,
  onBlur,
  onValueChange,
}: HorseBreedAutocompleteProps) {
  const breedOptions = horseBreedOptions(existingBreed)

  const commitKnownBreed = () => {
    // Preserve unresolved text so the form can explain it and block submission.
    const selectedBreed = matchHorseBreed(value, existingBreed)
    if (selectedBreed !== undefined && selectedBreed !== value)
      onValueChange(selectedBreed)
    onBlur()
  }

  return (
    <AutocompleteRoot
      items={breedOptions}
      value={value}
      disabled={disabled}
      openOnInputClick
      autoHighlight
      onValueChange={onValueChange}
    >
      <AutocompleteInput
        ref={inputRef}
        id={id}
        name={name}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
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
          No breed matches. Choose a breed from the list, or clear this field.
        </AutocompleteEmpty>
      </AutocompleteContent>
    </AutocompleteRoot>
  )
}
