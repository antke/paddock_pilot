import { useT, useLocale } from '#/i18n/LocaleProvider'
import { FilteredDashboardItemList } from '#/components/list-filtering/FilteredDashboardItemList'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { HorseCardLink } from './HorseCard'
import { createHorseListFilterConfig } from './horseListFilters'
import { NoHorsesPrompt } from './NoHorsesPrompt'
import type { api } from 'convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import { useMemo } from 'react'
import type { Locale } from 'shared/i18n/locale'
import { localeInstances } from '#/i18n/resources'

type Props = {
  horses: ReadonlyArray<HorseListHorse>
  stableId: string
}

export type HorseListHorse = FunctionReturnType<typeof api.horses.list>[number]

function getMatchedIdentifier(
  horse: HorseListHorse,
  query: string,
  locale: Locale,
) {
  const t = localeInstances[locale].t
  const normalizedQuery = query.trim().toLocaleLowerCase()

  if (!normalizedQuery) return undefined

  if (horse.passportNumber?.toLocaleLowerCase().includes(normalizedQuery)) {
    return { label: t('horseList.passport'), value: horse.passportNumber }
  }

  if (horse.microchipNumber?.toLocaleLowerCase().includes(normalizedQuery)) {
    return { label: t('horseList.microchip'), value: horse.microchipNumber }
  }

  return undefined
}

export function HorseList({ horses, stableId }: Props) {
  const t = useT()
  const { locale } = useLocale()

  const filterConfig = useMemo(
    () => createHorseListFilterConfig(locale),
    [locale],
  )
  const filtering = useListFiltering({ items: horses, config: filterConfig })

  return (
    <FilteredDashboardItemList
      config={filterConfig}
      filtering={filtering}
      gap="loose"
      emptyMessage={t('horseList.none')}
      emptyState={<NoHorsesPrompt />}
      filteredEmptyMessage={t('horseList.noMatches')}
      stickyFilters
      renderItem={(horse) => {
        const matchedIdentifier = getMatchedIdentifier(
          horse,
          filtering.query,
          locale,
        )

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
