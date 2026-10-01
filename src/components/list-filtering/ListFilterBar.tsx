import { useT } from '#/i18n/LocaleProvider'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
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

const listFilterBarClassName = 'rounded-row bg-surface p-3 sm:p-4'
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
  onFocusWithinChange?: (focused: boolean) => void
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
  onFocusWithinChange,
}: ListFilterBarProps<TFacetId>) {
  const t = useT()

  const idPrefix = useId()
  const searchId = `${idPrefix}-search`
  const panelId = `${idPrefix}-filters`
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const search = useRef<HTMLInputElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const focusedPanelControl = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const rememberFocus = (event: FocusEvent) => {
      const target = event.target
      focusedPanelControl.current =
        target instanceof HTMLElement &&
        (panel.current?.contains(target) || target === toggle.current)
          ? target
          : null
    }
    document.addEventListener('focusin', rememberFocus)
    return () => document.removeEventListener('focusin', rememberFocus)
  }, [])
  useLayoutEffect(() => {
    const focused = focusedPanelControl.current
    if (
      !focused ||
      (document.activeElement !== focused &&
        document.activeElement !== document.body)
    )
      return
    if (
      !focused.isConnected ||
      (!isPanelOpen && panel.current?.contains(focused))
    ) {
      const target = toggle.current?.isConnected
        ? toggle.current
        : search.current
      target?.focus()
    }
  }, [config.facets, isPanelOpen])
  const activeChips = getActiveFacetChips(config, selectedFacets)
  const activeFacetCount = activeChips.length
  const hasFacets = config.facets.length > 0
  const filterButtonLabel =
    activeFacetCount > 0
      ? t('listControls.activeToggle', { count: activeFacetCount })
      : t('listControls.toggle')

  return (
    <div
      data-slot="list-filter-bar"
      data-sticky={sticky || undefined}
      onFocusCapture={() => onFocusWithinChange?.(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onFocusWithinChange?.(false)
        }
      }}
      className={cn(
        listFilterBarClassName,
        sticky &&
          'lg:sticky lg:top-[var(--app-header-scroll-clearance,1rem)] lg:z-30',
        className,
      )}
    >
      <div className="grid">
        <div className={listFilterHeaderClassName}>
          <Field className="min-w-0">
            <FieldLabel htmlFor={searchId}>
              {config.searchLabel ?? t('listControls.search')}
            </FieldLabel>
            <Input
              ref={search}
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
              ref={toggle}
              type="button"
              variant="outline"
              size="control"
              aria-expanded={isPanelOpen}
              aria-controls={panelId}
              aria-label={filterButtonLabel}
              onClick={() => setIsPanelOpen((current) => !current)}
            >
              <FunnelSimpleIcon aria-hidden={true} weight="bold" />
              <span className="hidden sm:inline">
                {t('listControls.filters')}
              </span>
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
          fallbackFocus={() => search.current}
        />

        {hasFacets && (
          <div
            ref={panel}
            id={panelId}
            aria-hidden={!isPanelOpen}
            inert={!isPanelOpen}
            onKeyDown={(event) => {
              if (isPanelOpen && event.key === 'Escape') {
                event.preventDefault()
                setIsPanelOpen(false)
                toggle.current?.focus()
              }
            }}
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
                  onFacetChange={(facetId, value) => {
                    if (isPanelOpen) onFacetChange(facetId, value)
                  }}
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
