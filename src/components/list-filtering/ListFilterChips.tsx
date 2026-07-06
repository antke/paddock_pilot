import { useEffect, useState } from 'react'

import { cn } from '#/lib/utils'

const CHIP_ROW_TRANSITION_MS = 200 // Keep in sync with app-height-collapse duration.

export type ListFilterChip<TFacetId extends string = string> = {
  facetId: TFacetId
  label: string
  valueLabel: string
}

type ListFilterChipsProps<TFacetId extends string = string> = {
  chips: ReadonlyArray<ListFilterChip<TFacetId>>
  isFiltering: boolean
  onRemove: (facetId: TFacetId) => void
  onReset: () => void
  className?: string
}

export function ListFilterChips<TFacetId extends string = string>({
  chips,
  isFiltering,
  onRemove,
  onReset,
  className,
}: ListFilterChipsProps<TFacetId>) {
  const [previousChips, setPreviousChips] = useState<
    ReadonlyArray<ListFilterChip<TFacetId>>
  >(chips)

  useEffect(() => {
    if (isFiltering) {
      setPreviousChips(chips)
      return undefined
    }

    const timeoutId = setTimeout(() => {
      setPreviousChips(chips)
    }, CHIP_ROW_TRANSITION_MS)

    return () => clearTimeout(timeoutId)
  }, [chips, isFiltering])

  const visibleChips = isFiltering ? chips : previousChips

  return (
    <div
      aria-hidden={!isFiltering}
      className={cn(
        'app-height-collapse',
        isFiltering
          ? 'app-height-collapse-open'
          : 'app-height-collapse-closed',
        className,
      )}
    >
      <div className="app-height-collapse-inner">
        <div className="flex flex-wrap items-center gap-2 pt-3">
          {visibleChips.map((chip) => {
            const accessibleLabel = `${chip.label}: ${chip.valueLabel}`

            return (
              <span
                key={chip.facetId}
                className="inline-flex max-w-full min-w-0 animate-in items-center gap-1.5 rounded-control bg-muted px-2.5 py-1 text-xs text-foreground duration-200 fade-in-0 slide-in-from-top-1 zoom-in-95 motion-reduce:animate-none"
                title={accessibleLabel}
              >
                <span className="shrink-0 text-muted-foreground">
                  {chip.label}:
                </span>
                <span className="min-w-0 max-w-48 truncate font-medium">
                  {chip.valueLabel}
                </span>
                <button
                  type="button"
                  className="-mr-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none"
                  aria-label={`Remove ${accessibleLabel} filter`}
                  disabled={!isFiltering}
                  onClick={() => onRemove(chip.facetId)}
                >
                  ×
                </button>
              </span>
            )
          })}

          <button
            type="button"
            className="inline-flex h-7 items-center rounded-control px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/25 focus-visible:outline-none disabled:pointer-events-none"
            disabled={!isFiltering}
            onClick={onReset}
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  )
}
