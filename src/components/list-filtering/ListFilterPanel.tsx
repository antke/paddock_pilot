import type { ChangeEvent } from 'react'

import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { cn } from '#/lib/utils'

import type {
  ListFilterSelectedFacets,
  ListFilterUiFacet,
} from './listFiltering'

type ListFilterPanelProps<TFacetId extends string = string> = {
  facets: ReadonlyArray<ListFilterUiFacet<TFacetId>>
  selectedFacets: Readonly<ListFilterSelectedFacets<TFacetId>>
  onFacetChange: (facetId: TFacetId, value: string) => void
  idPrefix: string
  disabled?: boolean
  className?: string
}

export function ListFilterPanel<TFacetId extends string = string>({
  facets,
  selectedFacets,
  onFacetChange,
  idPrefix,
  disabled = false,
  className,
}: ListFilterPanelProps<TFacetId>) {
  return (
    <div
      className={cn(
        'grid min-w-0 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))] xl:grid-cols-[repeat(3,minmax(0,1fr))]',
        className,
      )}
    >
      {facets.map((facet) => {
        const selectId = `${idPrefix}-${facet.id}`

        return (
          <Field key={facet.id} className="min-w-0">
            <FieldLabel htmlFor={selectId}>
              {facet.label}
            </FieldLabel>
            <Select
              id={selectId}
              className="truncate"
              disabled={disabled}
              value={selectedFacets[facet.id] ?? ''}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                onFacetChange(facet.id, event.target.value)
              }
            >
              <option value="">{facet.allLabel}</option>
              {facet.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        )
      })}
    </div>
  )
}
