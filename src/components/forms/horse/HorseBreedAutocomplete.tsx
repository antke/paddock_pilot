import { CheckIcon } from '@phosphor-icons/react'
import type { Ref } from 'react'
import { useState, useRef } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '#/components/ui/field'
import { horseBreedSchema } from 'shared/horses/horseSchema'

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
  additionalBreeds?: ReadonlyArray<string>
  onAddBreed: (breed: string) => void
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
  additionalBreeds = [],
  onAddBreed,
  inputRef,
  disabled = false,
  invalid = false,
  describedBy,
  onBlur,
  onValueChange,
}: HorseBreedAutocompleteProps) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string>()
  const addButton = useRef<HTMLButtonElement>(null)
  const breedOptions = horseBreedOptions(existingBreed, additionalBreeds)
  const closeEditor = () => {
    setAdding(false)
    setError(undefined)
    addButton.current?.focus()
  }
  const addBreed = () => {
    if (disabled) return
    const result = horseBreedSchema
      .min(1, 'Enter a breed name.')
      .safeParse(draft)
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    const breed =
      matchHorseBreed(result.data, existingBreed, additionalBreeds) ??
      result.data
    onAddBreed(breed)
    onValueChange(breed)
    closeEditor()
  }

  const commitKnownBreed = () => {
    // Preserve unresolved text so the form can explain it and block submission.
    const selectedBreed = matchHorseBreed(
      value,
      existingBreed,
      additionalBreeds,
    )
    if (selectedBreed !== undefined && selectedBreed !== value)
      onValueChange(selectedBreed)
    onBlur()
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
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
                No breed matches. Use Add breed to enter a local breed.
              </AutocompleteEmpty>
            </AutocompleteContent>
          </AutocompleteRoot>
        </div>
        <Button
          ref={addButton}
          type="button"
          variant="outline"
          size="control"
          action="create"
          disabled={disabled}
          aria-expanded={adding}
          aria-controls={adding ? `${id}-add-breed` : undefined}
          onClick={() => {
            if (adding) closeEditor()
            else {
              setDraft(
                matchHorseBreed(value, existingBreed, additionalBreeds) ===
                  undefined
                  ? value
                  : '',
              )
              setError(undefined)
              setAdding(true)
            }
          }}
        >
          Add breed
        </Button>
      </div>
      {adding && (
        <div id={`${id}-add-breed`} className="grid gap-3">
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor={`${id}-new-name`}>New breed name</FieldLabel>
            <Input
              id={`${id}-new-name`}
              autoFocus
              value={draft}
              disabled={disabled}
              aria-invalid={Boolean(error)}
              aria-describedby={`${id}-new-help${error ? ` ${id}-new-error` : ''}`}
              onChange={(event) => {
                setDraft(event.target.value)
                setError(undefined)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addBreed()
                }
                if (event.key === 'Escape') {
                  event.preventDefault()
                  event.stopPropagation()
                  closeEditor()
                }
              }}
            />
            <FieldDescription id={`${id}-new-help`}>
              This breed will be saved with the horse and suggested for other
              horses in this stable.
            </FieldDescription>
            {error && <FieldError id={`${id}-new-error`}>{error}</FieldError>}
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="control"
              disabled={disabled}
              onClick={addBreed}
            >
              Use breed
            </Button>
            <Button
              type="button"
              size="control"
              variant="outline"
              disabled={disabled}
              onClick={closeEditor}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
