import type { Ref } from 'react'
import {
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteRoot,
} from '#/components/ui/autocomplete'
import { Input } from '#/components/ui/input'
import { useLocale, useT } from '#/i18n/LocaleProvider'

/** Suggestions fill a display name; they never select an account or transfer ownership. */
export function HorseOwnerAutocomplete({
  suggestions,
  value,
  onValueChange,
  inputRef,
  ...inputProps
}: {
  suggestions: ReadonlyArray<string>
  value: string
  onValueChange: (value: string) => void
  inputRef: Ref<HTMLInputElement>
  id: string
  name: string
  disabled?: boolean
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  onBlur: () => void
}) {
  const t = useT()
  const { locale } = useLocale()
  const names = Array.from(
    new Map(
      suggestions
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => [name.toLocaleLowerCase(locale), name]),
    ).values(),
  )

  if (names.length === 0) {
    return (
      <Input
        {...inputProps}
        ref={inputRef}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        autoComplete="off"
        placeholder="Penny Chenery"
      />
    )
  }

  return (
    <AutocompleteRoot
      items={names}
      value={value}
      onValueChange={onValueChange}
      disabled={inputProps.disabled}
      openOnInputClick
    >
      <AutocompleteInput
        {...inputProps}
        ref={inputRef}
        autoComplete="off"
        triggerLabel={t('horseForm.showOwnerSuggestions')}
        placeholder={t('horseForm.ownerSuggestionPlaceholder')}
      />
      <AutocompleteContent>
        <AutocompleteEmpty>
          {t('horseForm.noOwnerSuggestions')}
        </AutocompleteEmpty>
        <AutocompleteList>
          {(name: string) => (
            <AutocompleteItem
              key={name}
              value={name}
              className="min-h-11 wrap-anywhere"
            >
              {name}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </AutocompleteRoot>
  )
}
