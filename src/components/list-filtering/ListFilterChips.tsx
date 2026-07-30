import { useEffect, useState } from 'react'
import { XIcon } from '@phosphor-icons/react'

import { ActionGroup } from '#/components/ui/action-group'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

const CHIP_ROW_TRANSITION_MS = 200 // Keep in sync with app-height-collapse duration.
const listFilterChipClassName =
  'max-w-full min-w-0 animate-in duration-200 fade-in-0 slide-in-from-top-1 zoom-in-95 motion-reduce:animate-none'
const listFilterChipLabelClassName =
  'shrink-0 font-semibold text-muted-foreground'
const listFilterChipValueClassName = 'min-w-0 max-w-48 truncate font-medium'

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
  const [previousChips, setPreviousChips] =
    useState<ReadonlyArray<ListFilterChip<TFacetId>>>(chips)

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
        isFiltering ? 'app-height-collapse-open' : 'app-height-collapse-closed',
        className,
      )}
    >
      <div className="app-height-collapse-inner">
        <ActionGroup align="start" className="pt-3 sm:pt-4">
          {visibleChips.map((chip) => {
            const accessibleLabel = `${chip.label}: ${chip.valueLabel}`

            return (
              <ListFilterChipItem
                key={chip.facetId}
                chip={chip}
                disabled={!isFiltering}
                onRemove={() => onRemove(chip.facetId)}
                title={accessibleLabel}
              />
            )
          })}

          <Button
            type="button"
            variant="subtle"
            size="xs"
            disabled={!isFiltering}
            onClick={onReset}
          >
            Clear all
          </Button>
        </ActionGroup>
      </div>
    </div>
  )
}

function ListFilterChipItem<TFacetId extends string = string>({
  chip,
  disabled,
  onRemove,
  title,
}: {
  chip: ListFilterChip<TFacetId>
  disabled: boolean
  onRemove: () => void
  title: string
}) {
  return (
    <Badge
      variant="filter"
      size="chip"
      className={listFilterChipClassName}
      title={title}
    >
      <span className={listFilterChipLabelClassName}>
        {chip.label}:
      </span>
      <span className={listFilterChipValueClassName}>{chip.valueLabel}</span>
      <Button
        type="button"
        variant="subtle"
        size="chip-icon"
        aria-label={`Remove ${title} filter`}
        disabled={disabled}
        onClick={onRemove}
      >
        <XIcon aria-hidden={true} weight="bold" />
      </Button>
    </Badge>
  )
}
