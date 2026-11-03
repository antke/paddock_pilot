import { ArrowRightIcon, CaretDownIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { Button, ButtonLink } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useOwnershipCopy } from '#/components/ownership/ownershipCopy'
import { useT } from '#/i18n/LocaleProvider'

/**
 * Section-header shortcut from a dashboard roster to the full horse list.
 * A single list opens directly; when Home combines personal horses with
 * stable rosters, a small menu names each list so the destination is explicit.
 */
export function HorseListShortcut({
  stables = [],
}: {
  stables?: ReadonlyArray<{ _id: string; name: string }>
}) {
  const t = useT()
  const c = useOwnershipCopy()
  const label = t('dashboard.allHorses')

  if (stables.length === 0) {
    return (
      <ButtonLink to="/horses" variant="ghost" size="sm" className="min-h-11">
        {label}
        <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
      </ButtonLink>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11"
          />
        }
      >
        {label}
        <CaretDownIcon data-icon="inline-end" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-auto min-w-48 max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuLinkItem render={<Link to="/horses" />}>
          {c.title}
        </DropdownMenuLinkItem>
        {stables.map((stable) => (
          <DropdownMenuLinkItem
            key={stable._id}
            render={
              <Link
                to="/stables/$stableId/horses"
                params={{ stableId: stable._id }}
              />
            }
          >
            <span className="[overflow-wrap:anywhere]">{stable.name}</span>
          </DropdownMenuLinkItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Stable roster shortcut: the stable's own horse list, with its size. */
export function StableHorseListShortcut({
  stableId,
  count,
}: {
  stableId: string
  count: number
}) {
  const t = useT()
  return (
    <ButtonLink
      to="/stables/$stableId/horses"
      params={{ stableId }}
      variant="ghost"
      size="sm"
      className="min-h-11"
    >
      {t('dashboard.allHorses')} ({count})
      <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
    </ButtonLink>
  )
}
