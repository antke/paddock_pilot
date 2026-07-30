import type { DashboardItemAccent } from '#/components/dashboard/DashboardItemCard'
import {
  DashboardItemCard,
  DashboardItemCardContent,
  DashboardItemLinkCard,
} from '#/components/dashboard/DashboardItemCard'
import { cn } from '#/lib/utils'
import type { ReactNode } from 'react'
import { HorseAvatar } from './HorseAvatar'

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
}

type HorseCardBaseProps = {
  horse: HorseCardHorse
  accent?: DashboardItemAccent
  badges?: ReactNode
  className?: string
  meta?: ReactNode
}

type HorseCardLinkProps = HorseCardBaseProps & {
  stableId: string
  horseId: string
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

export const horseCardSurfaceClassName = 'bg-card dark:bg-card'

export function HorseCardContent({
  horse,
  badges,
  meta,
  linked = false,
}: HorseCardContentProps) {
  const metaContent = [
    horse.ownerName ? <span key="owner">{horse.ownerName}</span> : undefined,
    horse.breed ? <span key="breed">{horse.breed}</span> : undefined,
    meta,
  ].filter(
    (item): item is Exclude<ReactNode, null | undefined> =>
      item !== undefined && item !== null,
  )

  return (
    <DashboardItemCardContent
      leading={
        <HorseAvatar
          name={horse.name}
          profileImageUrl={horse.profileImageUrl}
        />
      }
      title={horse.name}
      titleTone={linked ? 'open' : 'default'}
      meta={metaContent.length > 0 ? metaContent : undefined}
      metaGap="compact"
      metaSeparator="dot"
      density="compact"
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
      chrome="cards"
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
  stableId,
  horseId,
  accent = 'none',
  badges,
  className,
  meta,
}: HorseCardLinkProps) {
  return (
    <DashboardItemLinkCard
      to="/stables/$stableId/horses/$horseId"
      params={{ stableId, horseId }}
      accent={accent}
      chrome="cards"
      density="compact"
      className={cn(
        horseCardSurfaceClassName,
        'active:bg-primary/10',
        className,
      )}
    >
      <HorseCardContent horse={horse} badges={badges} meta={meta} linked />
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
        data-selected={checked || undefined}
        className={cn(
          horseCardSurfaceClassName,
          'cursor-pointer active:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40 peer-focus-visible:outline-none',
          checked && 'border-primary ring-1 ring-primary',
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
