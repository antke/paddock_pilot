import { useT, useLocale } from '#/i18n/LocaleProvider'
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
import {
  getHorseBreedLabel,
  matchesBreedSearch,
} from 'shared/i18n/horseBreedLabels'

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
  const t = useT()
  const { locale } = useLocale()

  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<'required' | 'tooLong'>()
  const addButton = useRef<HTMLButtonElement>(null)
  const breedOptions = horseBreedOptions(existingBreed, additionalBreeds)
  const closeEditor = () => {
    setAdding(false)
    setError(undefined)
    addButton.current?.focus()
  }
  const addBreed = () => {
    if (disabled) return
    const trimmed = draft.trim()
    if (!trimmed || trimmed.length > 100) {
      setError(!trimmed ? 'required' : 'tooLong')
      return
    }
    const breed =
      matchHorseBreed(trimmed, existingBreed, additionalBreeds, locale) ??
      trimmed
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
      locale,
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
            value={getHorseBreedLabel(value, locale)}
            disabled={disabled}
            openOnInputClick
            autoHighlight
            itemToStringValue={(breed) => getHorseBreedLabel(breed, locale)}
            filter={matchesBreedSearch}
            onValueChange={(next) =>
              onValueChange(
                matchHorseBreed(
                  next,
                  existingBreed,
                  additionalBreeds,
                  locale,
                ) ?? next,
              )
            }
          >
            <AutocompleteInput
              ref={inputRef}
              id={id}
              name={name}
              disabled={disabled}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              placeholder={t('horseList.searchBreeds')}
              autoComplete="off"
              triggerLabel={t('horseList.showBreeds')}
              onBlur={commitKnownBreed}
            />

            <AutocompleteContent>
              <AutocompleteGroup>
                <AutocompleteGroupLabel>
                  {t('horseList.breeds')}
                </AutocompleteGroupLabel>
                <AutocompleteList>
                  {(breed: string) => {
                    const selected = breed === value

                    return (
                      <AutocompleteItem
                        key={breed}
                        value={breed}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
                      >
                        <span className="whitespace-normal break-words text-sm font-semibold text-foreground">
                          {getHorseBreedLabel(breed, locale)}
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
              <AutocompleteEmpty>{t('horseList.noBreeds')}</AutocompleteEmpty>
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
                matchHorseBreed(
                  value,
                  existingBreed,
                  additionalBreeds,
                  locale,
                ) === undefined
                  ? value
                  : '',
              )
              setError(undefined)
              setAdding(true)
            }
          }}
        >
          {t('horseList.addBreed')}
        </Button>
      </div>
      {adding && (
        <div id={`${id}-add-breed`} className="grid gap-3">
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor={`${id}-new-name`}>
              {t('horseList.newBreed')}
            </FieldLabel>
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
              {t('horseList.newBreedHelp')}
            </FieldDescription>
            {error && (
              <FieldError id={`${id}-new-error`}>
                {t(
                  error === 'required'
                    ? 'horseList.breedRequired'
                    : 'horseList.breedTooLong',
                )}
              </FieldError>
            )}
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="control"
              disabled={disabled}
              onClick={addBreed}
            >
              {t('horseList.useBreed')}
            </Button>
            <Button
              type="button"
              size="control"
              variant="outline"
              disabled={disabled}
              onClick={closeEditor}
            >
              {t('horseList.cancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
