import { FilteredDashboardItemList } from '#/components/list-filtering/FilteredDashboardItemList'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { HorseCardLink } from './HorseCard'
import { createHorseListFilterConfig } from './horseListFilters'
import { NoHorsesPrompt } from './NoHorsesPrompt'
import type { api } from 'convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import { isEmpty } from 'lodash'
import { useMemo } from 'react'

type Props = {
  horses: ReadonlyArray<HorseListHorse>
  stableId: string
}

export type HorseListHorse = FunctionReturnType<typeof api.horses.list>[number]

function getMatchedIdentifier(horse: HorseListHorse, query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  if (!normalizedQuery) return undefined

  if (horse.passportNumber?.toLocaleLowerCase().includes(normalizedQuery)) {
    return { label: 'Passport', value: horse.passportNumber }
  }

  if (horse.microchipNumber?.toLocaleLowerCase().includes(normalizedQuery)) {
    return { label: 'Microchip', value: horse.microchipNumber }
  }

  return undefined
}

export function HorseList({ horses, stableId }: Props) {
  const filterConfig = useMemo(createHorseListFilterConfig, [])
  const filtering = useListFiltering({ items: horses, config: filterConfig })

  if (isEmpty(horses)) {
    return <NoHorsesPrompt />
  }

  return (
    <FilteredDashboardItemList
      config={filterConfig}
      filtering={filtering}
      gap="loose"
      itemLayout="grid"
      emptyMessage="No horses have been added yet."
      filteredEmptyMessage="No horses match these filters."
      stickyFilters
      renderItem={(horse) => {
        const matchedIdentifier = getMatchedIdentifier(horse, filtering.query)

        return (
          <HorseCardLink
            key={horse._id}
            horse={horse}
            stableId={stableId}
            horseId={horse._id}
            meta={[
              horse.discipline ? (
                <span key="discipline">{horse.discipline}</span>
              ) : undefined,
              matchedIdentifier ? (
                <span key="identifier">
                  {matchedIdentifier.label} {matchedIdentifier.value}
                </span>
              ) : undefined,
            ]}
          />
        )
      }}
    />
  )
}
