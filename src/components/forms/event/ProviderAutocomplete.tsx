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
import { stableProviderTypeLabels } from 'shared/stables/stableProviderSchema'
import type { Id } from 'convex/_generated/dataModel'

type ProviderOption = {
  _id: Id<'stableProviders'>
  type: 'vet' | 'farrier' | 'dentist' | 'physio' | 'saddler' | 'other'
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
  onBlur,
  onValueChange,
  onProviderSelect,
}: ProviderAutocompleteProps) {
  if (providers.length === 0) {
    return (
      <Input
        id={id}
        name={name}
        value={value}
        type="text"
        disabled={disabled}
        aria-invalid={invalid}
        placeholder="Provider name"
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
          stableProviderTypeLabels[provider.type],
          provider.phone,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase()

        return searchableText.includes(normalizedQuery)
      }}
      onValueChange={onValueChange}
    >
      <AutocompleteInput
        id={id}
        name={name}
        disabled={disabled}
        aria-invalid={invalid}
        placeholder="Select or enter a provider"
        autoComplete="off"
        triggerLabel="Show saved providers"
        onBlur={onBlur}
      />

      <AutocompleteContent>
        <AutocompleteGroup>
          <AutocompleteGroupLabel>Saved providers</AutocompleteGroupLabel>
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
                    className="flex size-8 items-center justify-center rounded-full border border-border-subtle bg-surface-muted font-mono text-xs font-bold text-foreground"
                  >
                    {getProviderInitials(provider.name)}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {provider.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {provider.phone || 'No phone saved'}
                    </span>
                  </span>

                  <span className="flex items-center gap-2">
                    <Badge variant="neutral" size="micro">
                      {stableProviderTypeLabels[provider.type]}
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
        <AutocompleteEmpty>
          No saved providers match. Keep typing to use a new provider.
        </AutocompleteEmpty>
      </AutocompleteContent>
    </AutocompleteRoot>
  )
}
