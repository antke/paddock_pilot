import { ArrowRightIcon, DotsThreeIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { StableRole } from 'shared/stables/stableAccess'

import {
  DashboardItemCardContent,
  DashboardItemLinkCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Button, ButtonLink } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useT } from '#/i18n/LocaleProvider'
import {
  getStableGatewayMoreDestinations,
  stableGatewayDirectDestinations,
} from './stableDestinations'

type StableCardLinkProps = {
  location?: ReactNode
  meta?: ReadonlyArray<ReactNode>
  name: string
  stableId: string
}

function metaItems(location: ReactNode, meta?: ReadonlyArray<ReactNode>) {
  const items = [location, ...(meta ?? [])].filter(
    (item): item is Exclude<ReactNode, null | undefined | false> =>
      item !== undefined && item !== null && item !== false,
  )
  return items.length > 0 ? items : undefined
}

export function StableCardLink({
  location,
  meta,
  name,
  stableId,
}: StableCardLinkProps) {
  return (
    <DashboardItemLinkCard
      to="/stables/$stableId"
      params={{ stableId }}
      chrome="flat"
      density="compact"
    >
      <DashboardItemCardContent
        className="grid-cols-[minmax(0,1fr)_auto]"
        title={name}
        titleTone="open"
        meta={metaItems(location, meta)}
        metaSeparator="dot"
        badges={
          <ArrowRightIcon
            aria-hidden="true"
            className="size-4 text-primary"
            weight="bold"
          />
        }
      />
    </DashboardItemLinkCard>
  )
}

/**
 * A Stables-list tile. The whole tile opens the overview through the stretched
 * name link; Horses, Care and More sit above it in the tile's foot, so no
 * control is nested inside another and none drifts away from the name.
 */
export function StableGatewayCard({
  location,
  name,
  stableId,
  viewerRole,
}: Omit<StableCardLinkProps, 'meta'> & { viewerRole?: StableRole }) {
  const t = useT()
  const moreDestinations = getStableGatewayMoreDestinations(viewerRole)

  return (
    <DashboardSectionCard
      className="relative"
      title={
        <Link
          to="/stables/$stableId"
          params={{ stableId }}
          className="app-control-focus rounded-control [overflow-wrap:anywhere] after:absolute after:inset-0 after:rounded-panel after:transition-colors after:content-[''] hover:after:bg-primary/5"
        >
          {name}
        </Link>
      }
      description={location}
      footerClassName="relative z-10 flex flex-wrap gap-2"
      footer={
        <>
          {stableGatewayDirectDestinations.map((destination) => (
            <ButtonLink
              key={destination.id}
              to={destination.to}
              params={{ stableId }}
              search={destination.search}
              variant="outline"
              size="sm"
              className="min-h-11"
              aria-label={`${t(destination.labelKey)}, ${name}`}
            >
              {t(destination.labelKey)}
            </ButtonLink>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-11 min-w-11"
                  aria-label={t('stables.destinations.moreLabel', { name })}
                />
              }
            >
              <DotsThreeIcon weight="bold" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {moreDestinations.map((destination) => (
                <DropdownMenuLinkItem
                  key={destination.id}
                  render={
                    <Link
                      to={destination.to}
                      params={{ stableId }}
                      search={destination.search}
                    />
                  }
                >
                  {t(destination.labelKey)}
                </DropdownMenuLinkItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      }
    />
  )
}
