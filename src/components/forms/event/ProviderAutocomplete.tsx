import { useT } from '#/i18n/LocaleProvider'
import { useRef } from 'react'
import type { Ref } from 'react'
import { CheckIcon } from '@phosphor-icons/react'

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
import { Badge } from '#/components/ui/badge'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'
import type { Id } from 'convex/_generated/dataModel'

type ProviderOption = {
  _id: Id<'stableProviders'>
  type:
    'trainer' | 'vet' | 'farrier' | 'dentist' | 'physio' | 'saddler' | 'other'
  name: string
  phone?: string
}

type ProviderAutocompleteProps = {
  id: string
  name: string
  value: string
  providers: Array<ProviderOption>
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  inputRef?: Ref<HTMLInputElement>
  onBlur: () => void
  onValueChange: (value: string) => void
  onProviderSelect: (provider: ProviderOption) => void
}

function getProviderInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function ProviderAutocomplete({
  id,
  name,
  value,
  providers,
  disabled = false,
  invalid = false,
  describedBy,
  inputRef,
  onBlur,
  onValueChange,
  onProviderSelect,
}: ProviderAutocompleteProps) {
  const t = useT()

  const highlightedProvider = useRef<ProviderOption | undefined>(undefined)
  if (providers.length === 0) {
    return (
      <Input
        ref={inputRef}
        id={id}
        name={name}
        value={value}
        type="text"
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        placeholder={t('eventForm.providerName')}
        autoComplete="off"
        onBlur={onBlur}
        onChange={(event) => onValueChange(event.target.value)}
      />
    )
  }

  return (
    <AutocompleteRoot
      items={providers}
      value={value}
      disabled={disabled}
      openOnInputClick
      autoHighlight
      itemToStringValue={(provider) => provider.name}
      filter={(provider, query) => {
        const normalizedQuery = query.toLocaleLowerCase()
        const queryMatchesSavedProvider = providers.some(
          (option) => option.name.toLocaleLowerCase() === normalizedQuery,
        )

        if (queryMatchesSavedProvider) return true

        const searchableText = [
          provider.name,
          t(`stables.providerTypes.${provider.type}`),
          provider.phone,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase()

        return searchableText.includes(normalizedQuery)
      }}
      onItemHighlighted={(provider) => {
        highlightedProvider.current = provider
      }}
      onValueChange={(nextValue, details) => {
        onValueChange(nextValue)
        if (details.reason === 'item-press') {
          const provider =
            highlightedProvider.current?.name === nextValue
              ? highlightedProvider.current
              : providers.find((option) => option.name === nextValue)
          if (provider) onProviderSelect(provider)
        }
      }}
    >
      <AutocompleteInput
        ref={inputRef}
        id={id}
        name={name}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        placeholder={t('eventForm.selectProvider')}
        autoComplete="off"
        triggerLabel={t('eventForm.showProviders')}
        onBlur={onBlur}
      />

      <AutocompleteContent>
        <AutocompleteGroup>
          <AutocompleteGroupLabel>
            {t('eventForm.savedProviders')}
          </AutocompleteGroupLabel>
          <AutocompleteList>
            {(provider: ProviderOption) => {
              const selected = provider.name === value

              return (
                <AutocompleteItem
                  key={provider._id}
                  value={provider}
                  onClick={() => onProviderSelect(provider)}
                  className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-8 items-center justify-center rounded-full border border-border-subtle bg-surface-muted font-sans text-xs font-bold text-foreground"
                  >
                    {getProviderInitials(provider.name)}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {provider.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {provider.phone || t('eventForm.noPhone')}
                    </span>
                  </span>

                  <span className="flex items-center gap-2">
                    <Badge variant="neutral" size="micro">
                      {t(`stables.providerTypes.${provider.type}`)}
                    </Badge>
                    <CheckIcon
                      aria-hidden="true"
                      className={cn(
                        'size-4 text-primary transition-opacity',
                        selected ? 'opacity-100' : 'opacity-0',
                      )}
                      weight="bold"
                    />
                  </span>
                </AutocompleteItem>
              )
            }}
          </AutocompleteList>
        </AutocompleteGroup>
        <AutocompleteEmpty>{t('eventForm.noProviders')}</AutocompleteEmpty>
      </AutocompleteContent>
    </AutocompleteRoot>
  )
}
