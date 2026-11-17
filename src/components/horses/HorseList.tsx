import { useT, useLocale } from '#/i18n/LocaleProvider'
import { FilteredDashboardItemList } from '#/components/list-filtering/FilteredDashboardItemList'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { HorseCard, HorseCardLink } from './HorseCard'
import type { HorseListDensity } from './HorseCard'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { createHorseListFilterConfig } from './horseListFilters'
import { NoHorsesPrompt } from './NoHorsesPrompt'
import type { api } from 'convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'
import { useEffect, useMemo, useState } from 'react'
import type { Locale } from 'shared/i18n/locale'
import { localeInstances } from '#/i18n/resources'
import { calculateHorseAge } from 'shared/horses/horseAge'
import { useSmallScreen } from '#/lib/useSmallScreen'

type Props = {
  horses: ReadonlyArray<HorseListHorse>
  stableId: string
}

export type HorseListHorse = Omit<
  FunctionReturnType<typeof api.horses.list>[number],
  'canRead'
> & { canRead?: boolean }

/** Detailed-row facts; HorseCard merges them into its one muted fact line. */
function horseListDetails(horse: HorseListHorse, t: ReturnType<typeof useT>) {
  const age = calculateHorseAge(horse.dateOfBirth) ?? horse.age
  const fields = [
    {
      label: t('horseDetail.age'),
      value:
        typeof age === 'number' ? t('horseForm.years', { count: age }) : age,
    },
    {
      label: t('horseDetail.sex'),
      value: horse.sex ? t(`horseList.${horse.sex}`) : undefined,
    },
    { label: t('horseDetail.height'), value: horse.height?.trim() },
    {
      label: t('horseDetail.shoeing'),
      value: horse.shoeingStatus
        ? t(`horseList.${horse.shoeingStatus}`)
        : undefined,
    },
  ].filter(({ value }) => value !== undefined && value !== '')

  // Labels stay for screen readers.
  return fields.map(({ label, value }) => (
    <span key={label}>
      <span className="sr-only">{label}: </span>
      {value}
    </span>
  ))
}

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
  const small = useSmallScreen()
  const [density, setDensity] = useState<HorseListDensity>('detailed')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('horse-list-density')
      if (saved === 'compact' || saved === 'detailed') setDensity(saved)
      else setDensity(small ? 'compact' : 'detailed')
    } catch {
      setDensity(small ? 'compact' : 'detailed')
      // The display preference is optional when browser storage is unavailable.
    }
  }, [small])
  const changeDensity = (next: HorseListDensity) => {
    setDensity(next)
    try {
      localStorage.setItem('horse-list-density', next)
    } catch {
      // Keep the selected layout for this visit even without storage.
    }
  }

  const filterConfig = useMemo(
    () => createHorseListFilterConfig(locale),
    [locale],
  )
  const filtering = useListFiltering({
    items: horses,
    config: filterConfig,
    storageKey: `paddock:horses:${stableId}`,
  })

  return (
    <FilteredDashboardItemList
      config={filterConfig}
      filtering={filtering}
      getItemKey={(item) => item._id}
      gap="loose"
      toolbarEnd={
        horses.length > 0 && (
          <ChoiceButtonGroup
            layout="segmented"
            aria-label={t('horseList.rowDisplay')}
            value={density}
            options={[
              { value: 'compact', label: t('horseList.compact') },
              { value: 'detailed', label: t('horseList.detailed') },
            ]}
            onValueChange={changeDensity}
          />
        )
      }
      emptyMessage={t('horseList.none')}
      emptyState={<NoHorsesPrompt />}
      filteredEmptyMessage={t('horseList.noMatches')}
      stickyFilters
      renderItem={(horse) => {
        if (horse.canRead === false)
          return (
            <HorseCard
              key={horse._id}
              horse={horse}
              meta={
                <span>
                  {locale === 'pl'
                    ? 'Tylko lista stajni. Poproś właściciela konia o zaproszenie do opieki, aby zobaczyć jego wpisy.'
                    : 'Stable roster only. Ask the horse’s owner for a carer invitation to see its records.'}
                </span>
              }
            />
          )
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
            listDensity={density}
            details={
              density === 'detailed' ? horseListDetails(horse, t) : undefined
            }
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
