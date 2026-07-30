import { useId, useState } from 'react'
import type { ChangeEvent } from 'react'
import { FunnelSimpleIcon } from '@phosphor-icons/react'

import { DashboardCountBadge } from '#/components/dashboard/DashboardBadges'
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

const listFilterBarClassName = 'app-panel mb-2 p-3 sm:p-4'
const listFilterHeaderClassName =
  'grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3'

type ListFilterBarProps<TFacetId extends string = string> = {
  config: ListFilterUiConfig<TFacetId>
  query: string
  onQueryChange: (query: string) => void
  selectedFacets: Readonly<ListFilterSelectedFacets<TFacetId>>
  onFacetChange: (facetId: TFacetId, value: string) => void
  onReset: () => void
  isFiltering: boolean
  className?: string
  sticky?: boolean
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
  sticky = false,
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
    <div
      data-slot="list-filter-bar"
      data-sticky={sticky || undefined}
      className={cn(
        listFilterBarClassName,
        sticky && 'sticky top-36 z-30 sm:top-24',
        className,
      )}
    >
      <div className="grid">
        <div className={listFilterHeaderClassName}>
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
              size="control"
              aria-expanded={isPanelOpen}
              aria-controls={panelId}
              aria-label={filterButtonLabel}
              onClick={() => setIsPanelOpen((current) => !current)}
            >
              <FunnelSimpleIcon aria-hidden={true} weight="bold" />
              <span className="hidden sm:inline">Filters</span>
              {activeFacetCount > 0 && (
                <DashboardCountBadge count={activeFacetCount} />
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
              <div className="px-0.5 pt-3 pb-0.5 sm:pt-4">
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
