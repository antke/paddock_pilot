import { FilteredDashboardItemList } from '#/components/list-filtering/FilteredDashboardItemList'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { HorseCardLink } from './HorseCard'
import { createHorseListFilterConfig } from './horseListFilters'
import { NoHorsesPrompt } from './NoHorsesPrompt'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { isEmpty } from 'lodash'
import { useMemo } from 'react'

type Props = {
  stableId: string
}

export function HorseList({ stableId }: Props) {
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId: stableId as Id<'stables'> }),
  )
  const filterConfig = useMemo(createHorseListFilterConfig, [])
  const filtering = useListFiltering({ items: horses, config: filterConfig })

  if (isEmpty(horses)) {
    return <NoHorsesPrompt stableId={stableId} />
  }

  return (
    <FilteredDashboardItemList
      config={filterConfig}
      filtering={filtering}
      gap="comfortable"
      emptyMessage="No horses have been added yet."
      filteredEmptyMessage="No horses match these filters."
      stickyFilters
      renderItem={(horse) => (
        <HorseCardLink
          key={horse._id}
          horse={horse}
          stableId={stableId}
          horseId={horse._id}
        />
      )}
    />
  )
}
