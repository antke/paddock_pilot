import { useId, useState } from 'react'
import type { ChangeEvent } from 'react'

import { Button } from '#/components/ui/button'
import { Field, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'

import type {
  ListFilterSelectedFacets,
  ListFilterUiConfig,
} from './listFiltering'
import { ListFilterChips } from './ListFilterChips'
import type { ListFilterChip } from './ListFilterChips'
import { ListFilterPanel } from './ListFilterPanel'

type ListFilterBarProps<TFacetId extends string = string> = {
  config: ListFilterUiConfig<TFacetId>
  query: string
  onQueryChange: (query: string) => void
  selectedFacets: Readonly<ListFilterSelectedFacets<TFacetId>>
  onFacetChange: (facetId: TFacetId, value: string) => void
  onReset: () => void
  isFiltering: boolean
  className?: string
}

export function ListFilterBar<TFacetId extends string = string>({
  config,
  query,
  onQueryChange,
  selectedFacets,
  onFacetChange,
  onReset,
  isFiltering,
  className,
}: ListFilterBarProps<TFacetId>) {
  const idPrefix = useId()
  const searchId = `${idPrefix}-search`
  const panelId = `${idPrefix}-filters`
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const activeChips = getActiveFacetChips(config, selectedFacets)
  const activeFacetCount = activeChips.length
  const hasFacets = config.facets.length > 0
  const filterButtonLabel = `Toggle filters${
    activeFacetCount > 0 ? `, ${activeFacetCount} active` : ''
  }`

  return (
    <div className={cn('mb-2 rounded-row', className)}>
      <div className="grid">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
          <Field className="min-w-0">
            <FieldLabel htmlFor={searchId}>
              {config.searchLabel ?? 'Search'}
            </FieldLabel>
            <Input
              id={searchId}
              type="search"
              value={query}
              placeholder={config.searchPlaceholder}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onQueryChange(event.target.value)
              }
            />
          </Field>

          {hasFacets && (
            <Button
              type="button"
              variant="outline"
              className="min-w-10 px-3"
              aria-expanded={isPanelOpen}
              aria-controls={panelId}
              aria-label={filterButtonLabel}
              onClick={() => setIsPanelOpen((current) => !current)}
            >
              <FilterIcon className="size-4" aria-hidden={true} />
              <span className="hidden sm:inline">Filters</span>
              {activeFacetCount > 0 && (
                <span className="inline-flex size-5 flex-none items-center justify-center rounded-full bg-primary text-[0.625rem] font-medium leading-none text-primary-foreground">
                  {activeFacetCount}
                </span>
              )}
            </Button>
          )}
        </div>

        <ListFilterChips
          chips={activeChips}
          isFiltering={isFiltering}
          onRemove={(facetId) => onFacetChange(facetId, '')}
          onReset={onReset}
        />

        {hasFacets && (
          <div
            id={panelId}
            aria-hidden={!isPanelOpen}
            className={cn(
              'app-height-collapse',
              isPanelOpen
                ? 'app-height-collapse-open'
                : 'app-height-collapse-closed',
            )}
          >
            <div className="app-height-collapse-inner">
              <div className="pt-5">
                <ListFilterPanel
                  facets={config.facets}
                  selectedFacets={selectedFacets}
                  onFacetChange={onFacetChange}
                  idPrefix={idPrefix}
                  disabled={!isPanelOpen}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getActiveFacetChips<TFacetId extends string>(
  config: ListFilterUiConfig<TFacetId>,
  selectedFacets: Readonly<ListFilterSelectedFacets<TFacetId>>,
): Array<ListFilterChip<TFacetId>> {
  return config.facets.flatMap((facet) => {
    const selectedValue = selectedFacets[facet.id]

    if (!selectedValue) return []

    const selectedOption = facet.options.find(
      (option) => option.value === selectedValue,
    )

    return [
      {
        facetId: facet.id,
        label: facet.label,
        valueLabel: selectedOption?.label ?? selectedValue,
      },
    ]
  })
}

type FilterIconProps = {
  className?: string
  'aria-hidden'?: true
}

function FilterIcon(props: FilterIconProps) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M7 12h10" strokeLinecap="round" />
      <path d="M10 17h4" strokeLinecap="round" />
    </svg>
  )
}
