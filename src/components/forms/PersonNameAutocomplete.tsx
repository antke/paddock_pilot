import { useState } from 'react'
import type { ComponentProps, Ref } from 'react'
import {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Combobox,
} from '#/components/ui/combobox'
import { Input } from '#/components/ui/input'
import { useLocale, useT } from '#/i18n/LocaleProvider'

export type PersonNameSuggestion =
  string | { name: string; isCurrentUser?: boolean }

export type PersonNameAutocompleteProps = Omit<
  ComponentProps<typeof Input>,
  'value' | 'onChange' | 'ref'
> & {
  suggestions: ReadonlyArray<PersonNameSuggestion>
  value: string
  onValueChange: (value: string) => void
  inputRef?: Ref<HTMLInputElement>
  triggerLabel?: string
  emptyMessage?: string
  showEmptySuggestions?: boolean
}

/** A free-text name with optional suggestions, never an account/permission picker. */
export function PersonNameAutocomplete({
  suggestions,
  value,
  onValueChange,
  inputRef,
  triggerLabel,
  emptyMessage,
  showEmptySuggestions = false,
  ...inputProps
}: PersonNameAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const t = useT()
  const { locale } = useLocale()
  const uniqueNames = new Map<
    string,
    { name: string; isCurrentUser: boolean }
  >()
  // Keep the signed-in person first, even if another suggestion has the same name.
  const people = suggestions
    .map((person) =>
      typeof person === 'string'
        ? { name: person.trim(), isCurrentUser: false }
        : {
            name: person.name.trim(),
            isCurrentUser: person.isCurrentUser === true,
          },
    )
    .sort((a, b) => Number(b.isCurrentUser) - Number(a.isCurrentUser))
  for (const person of people) {
    const key = person.name.toLocaleLowerCase(locale)
    if (key && !uniqueNames.has(key)) uniqueNames.set(key, person)
  }
  const names = [...uniqueNames.values()]

  if (names.length === 0 && !showEmptySuggestions)
    return (
      <Input
        {...inputProps}
        ref={inputRef}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        autoComplete="off"
      />
    )

  return (
    <Combobox
      open={!inputProps.disabled && open}
      onOpenChange={setOpen}
      items={names}
      value={names.find((person) => person.name === value) ?? null}
      inputValue={value}
      onInputValueChange={(name, details) => {
        // Combobox clears its search on dismissal when no item is selected.
        // This field also accepts free text, so only edits should change it.
        if (details.reason === 'input-change') onValueChange(name)
      }}
      onValueChange={(person) => {
        if (person) onValueChange(person.name)
      }}
      itemToStringLabel={(person) => person.name}
      isItemEqualToValue={(a, b) => a.name === b.name}
      disabled={inputProps.disabled}
      openOnInputClick
    >
      <ComboboxInput
        {...inputProps}
        ref={inputRef}
        placeholder={
          inputProps.placeholder ?? t('listControls.personPlaceholder')
        }
        autoComplete="off"
        triggerLabel={triggerLabel ?? t('listControls.showPeopleSuggestions')}
      />
      <ComboboxContent>
        <ComboboxEmpty>
          {emptyMessage ?? t('listControls.noPeopleSuggestions')}
        </ComboboxEmpty>
        <ComboboxList>
          {(person: { name: string; isCurrentUser: boolean }) => (
            <ComboboxItem
              key={person.name}
              value={person}
              className="min-h-11 wrap-anywhere"
            >
              {person.isCurrentUser
                ? t('listControls.currentPerson', { name: person.name })
                : person.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
