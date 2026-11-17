import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
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
import { SelectionCheckMark } from '#/components/forms/FormLayout'

export type HorseListDensity = 'compact' | 'detailed'

export type HorseCardHorse = {
  name: string
  nickname?: string
  useNickname?: boolean
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
  /** Detailed list facts, shown as the last line under the name. */
  details?: ReactNode
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
  details,
}: HorseCardContentProps) {
  const { locale } = useLocale()
  const horseMeta = Children.toArray([
    horse.breed ? (
      <span key="breed">{getHorseBreedLabel(horse.breed, locale)}</span>
    ) : undefined,
    meta,
  ])
  // Detailed rows: breed, discipline and the detail facts share one muted line.
  const facts = Children.toArray([horseMeta, details])
  const metaContent = Children.toArray([
    horse.ownerName ? <span key="owner">{horse.ownerName}</span> : undefined,
    horseMeta,
  ])

  return (
    <DashboardItemCardContent
      className={listDensity && 'w-full gap-4 sm:gap-4'}
      leading={
        <HorseAvatar
          name={getHorseDisplayName(horse)}
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
      title={getHorseDisplayName(horse)}
      titleTone={linked ? 'open' : 'default'}
      titleClassName={
        listDensity === 'detailed'
          ? 'line-clamp-none text-xl leading-7 wrap-anywhere'
          : listDensity === 'compact'
            ? 'text-base leading-6'
            : undefined
      }
      meta={
        metaContent.length > 0 || facts.length > 0 ? (
          listDensity === 'detailed' ? (
            <>
              {horse.ownerName && (
                <span className="text-foreground">{horse.ownerName}</span>
              )}
              {facts.length > 0 && (
                <DashboardMetaList
                  separator="dot"
                  gap="compact"
                  className="text-base leading-6"
                >
                  {facts}
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
        // List rows take the shared hover band, so text stays on the title edge.
        !listDensity && 'hover:bg-surface-elevated active:bg-surface',
        listDensity === 'detailed' && 'flex min-h-30 items-center py-4',
        listDensity === 'compact' && 'flex min-h-20 items-center py-3',
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
        details={listDensity === 'detailed' ? details : undefined}
      />
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
      // A grid cell, so the row fills a stretched label and cards sharing a picker row match.
      className="grid w-full"
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
      {/* An open row, not a boxed card: hover band, pale stone fill and tick when chosen. */}
      <DashboardItemCard
        accent={accent}
        chrome="flat"
        density="compact"
        interactive={!disabled}
        data-selected={checked || undefined}
        className={cn(
          horseCardSurfaceClassName,
          'flex min-h-11 cursor-pointer items-center gap-3 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:outline-none',
          checked && 'bg-selection-surface hover:bg-selection-surface',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        <div className="min-w-0 flex-1">
          <HorseCardContent horse={horse} badges={badges} meta={meta} />
        </div>
        <SelectionCheckMark
          checked={checked}
          className={cn(invalid && !checked && 'border-destructive')}
        />
      </DashboardItemCard>
    </label>
  )
}
