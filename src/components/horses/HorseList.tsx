import { useT, useLocale } from '#/i18n/LocaleProvider'
import { FilteredDashboardItemList } from '#/components/list-filtering/FilteredDashboardItemList'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { HorseCard, HorseCardLink } from './HorseCard'
import type { HorseListDensity } from './HorseCard'
import { Switch } from '#/components/ui/switch'
import { cn } from '#/lib/utils'
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

function HorseListDetails({ horse }: { horse: HorseListHorse }) {
  const t = useT()
  const fields = [
    {
      label: t('horseDetail.age'),
      value: calculateHorseAge(horse.dateOfBirth) ?? horse.age,
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

  return (
    <dl className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:grid-cols-2">
      {fields.map(({ label, value }) => (
        <div key={label} className="min-w-0 space-y-1 wrap-anywhere">
          <dt className="text-sm leading-5 text-muted-foreground">{label}</dt>
          <dd className="text-base leading-6 text-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  )
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
      gap="loose"
      listActions={
        horses.length > 0 && (
          <div
            role="group"
            aria-label={t('horseList.rowDisplay')}
            className="flex min-h-11 items-center justify-end gap-3 text-sm"
          >
            <span
              className={cn(
                density === 'compact'
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {t('horseList.compact')}
            </span>
            <Switch
              aria-label={t('horseList.detailedRows')}
              checked={density === 'detailed'}
              onCheckedChange={(checked) =>
                changeDensity(checked ? 'detailed' : 'compact')
              }
            />
            <span
              className={cn(
                density === 'detailed'
                  ? 'font-semibold text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {t('horseList.detailed')}
            </span>
          </div>
        )
      }
      emptyMessage={t('horseList.none')}
      emptyState={<NoHorsesPrompt />}
      filteredEmptyMessage={t('horseList.noMatches')}
      stickyFilters
      renderItem={(horse) => {
        if (horse.canRead === false) return <HorseCard horse={horse} />
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
              density === 'detailed' ? (
                <HorseListDetails horse={horse} />
              ) : undefined
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
