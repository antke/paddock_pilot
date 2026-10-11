import { getHorseBreedLabel } from 'shared/i18n/horseBreedLabels'
import { useLocale } from '#/i18n/LocaleProvider'
import type { DashboardItemAccent } from '#/components/dashboard/DashboardItemCard'
import {
  DashboardItemCard,
  DashboardItemCardContent,
  DashboardItemLinkCard,
} from '#/components/dashboard/DashboardItemCard'
import { cn } from '#/lib/utils'
import { Children } from 'react'
import type { ReactNode } from 'react'
import { HorseAvatar } from './HorseAvatar'
import { DashboardMetaList } from '#/components/dashboard/DashboardMetaList'

export type HorseListDensity = 'compact' | 'detailed'

export type HorseCardHorse = {
  name: string
  ownerName?: string
  breed?: string
  profileImageUrl?: string | null
}

type HorseCardContentProps = {
  horse: HorseCardHorse
  badges?: ReactNode
  meta?: ReactNode
  linked?: boolean
  listDensity?: HorseListDensity
}

type HorseCardBaseProps = {
  horse: HorseCardHorse
  accent?: DashboardItemAccent
  badges?: ReactNode
  className?: string
  meta?: ReactNode
}

type HorseCardLinkProps = HorseCardBaseProps & {
  stableId?: string
  horseId: string
  listDensity?: HorseListDensity
  details?: ReactNode
}

type HorseSelectionCardProps = HorseCardBaseProps & {
  id: string
  checked: boolean
  disabled?: boolean
  invalid?: boolean
  name?: string
  onCheckedChange: (checked: boolean) => void
  value?: string
}

export const horseCardSurfaceClassName = 'text-foreground'

export function HorseCardContent({
  horse,
  badges,
  meta,
  linked = false,
  listDensity,
}: HorseCardContentProps) {
  const { locale } = useLocale()
  const horseMeta = Children.toArray([
    horse.breed ? (
      <span key="breed">{getHorseBreedLabel(horse.breed, locale)}</span>
    ) : undefined,
    meta,
  ])
  const metaContent = Children.toArray([
    horse.ownerName ? <span key="owner">{horse.ownerName}</span> : undefined,
    horseMeta,
  ])

  return (
    <DashboardItemCardContent
      className={listDensity && 'w-full gap-4 sm:gap-4'}
      leading={
        <HorseAvatar
          name={horse.name}
          profileImageUrl={horse.profileImageUrl}
          size={listDensity === 'detailed' ? 'lg' : 'md'}
          className={
            listDensity === 'detailed'
              ? 'size-20'
              : listDensity === 'compact'
                ? 'size-12 sm:size-12'
                : undefined
          }
        />
      }
      title={horse.name}
      titleTone={linked ? 'open' : 'default'}
      titleClassName={
        listDensity === 'detailed'
          ? 'line-clamp-none text-xl leading-7 wrap-anywhere'
          : listDensity === 'compact'
            ? 'text-base leading-6'
            : undefined
      }
      meta={
        metaContent.length > 0 ? (
          listDensity === 'detailed' ? (
            <>
              {horse.ownerName && <span>{horse.ownerName}</span>}
              {horseMeta.length > 0 && (
                <DashboardMetaList
                  separator="dot"
                  className="text-base leading-6"
                >
                  {horseMeta}
                </DashboardMetaList>
              )}
            </>
          ) : (
            metaContent
          )
        ) : undefined
      }
      metaGap="compact"
      metaSeparator={listDensity === 'detailed' ? 'none' : 'dot'}
      metaClassName={
        listDensity === 'detailed'
          ? 'grid gap-1 text-base leading-6 wrap-anywhere'
          : listDensity === 'compact'
            ? 'text-sm leading-5 wrap-anywhere'
            : undefined
      }
      density={listDensity ? 'comfortable' : 'compact'}
      badges={badges}
    />
  )
}

export function HorseCard({
  horse,
  accent = 'none',
  badges,
  className,
  meta,
}: HorseCardBaseProps) {
  return (
    <DashboardItemCard
      accent={accent}
      chrome="flat"
      density="compact"
      interactive={false}
      className={cn(horseCardSurfaceClassName, className)}
    >
      <HorseCardContent horse={horse} badges={badges} meta={meta} />
    </DashboardItemCard>
  )
}

export function HorseCardLink({
  horse,
  horseId,
  accent = 'none',
  badges,
  className,
  meta,
  listDensity,
  details,
}: HorseCardLinkProps) {
  return (
    <DashboardItemLinkCard
      to="/horses/$horseId"
      params={{ horseId }}
      accent={accent}
      chrome="flat"
      density="compact"
      className={cn(
        horseCardSurfaceClassName,
        'hover:bg-surface-elevated active:bg-surface',
        listDensity === 'detailed' &&
          'grid min-h-30 items-center gap-5 px-4 py-5',
        listDensity === 'detailed' &&
          details &&
          'lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)] lg:gap-8',
        listDensity === 'compact' && 'flex min-h-20 items-center px-4 py-3',
        className,
      )}
      data-horse-list-density={listDensity}
    >
      <HorseCardContent
        horse={horse}
        badges={badges}
        meta={meta}
        linked
        listDensity={listDensity}
      />
      {listDensity === 'detailed' && details}
    </DashboardItemLinkCard>
  )
}

export function HorseSelectionCard({
  horse,
  id,
  checked,
  disabled = false,
  invalid = false,
  name,
  onCheckedChange,
  value,
  accent = 'none',
  badges,
  className,
  meta,
}: HorseSelectionCardProps) {
  return (
    <label
      htmlFor={id}
      data-disabled={disabled || undefined}
      data-selected={checked || undefined}
      className="block w-full"
    >
      <input
        id={id}
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="peer sr-only"
      />
      <DashboardItemCard
        accent={accent}
        chrome="cards"
        density="compact"
        interactive={!disabled}
        selected={checked}
        className={cn(
          horseCardSurfaceClassName,
          'cursor-pointer active:bg-selection-surface peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:outline-none',
          invalid && 'border-destructive/70 ring-2 ring-destructive/20',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <HorseCardContent horse={horse} badges={badges} meta={meta} />
      </DashboardItemCard>
    </label>
  )
}
