import { ArrowRightIcon, CaretDownIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { StableRole } from 'shared/stables/stableAccess'

import {
  DashboardItemCardContent,
  DashboardItemLinkCard,
  DashboardItemRecordCard,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
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
 * A Stables-list gateway row. The whole row opens the overview; Horses and
 * Care sit above it as separate links, and less frequent destinations live in
 * More. No control is nested inside another interactive element.
 */
export function StableGatewayCard({
  location,
  meta,
  name,
  stableId,
  viewerRole,
}: StableCardLinkProps & { viewerRole?: StableRole }) {
  const t = useT()
  const moreDestinations = getStableGatewayMoreDestinations(viewerRole)

  return (
    <DashboardItemRecordCard
      chrome="flat"
      density="compact"
      className="relative"
      actionColumnClassName="relative z-10 sm:self-center"
      actionsClassName="justify-start sm:justify-end"
      actions={
        <>
          {stableGatewayDirectDestinations.map((destination) => (
            <ButtonLink
              key={destination.id}
              to={destination.to}
              params={{ stableId }}
              search={destination.search}
              variant="ghost"
              size="sm"
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
                  variant="ghost"
                  size="sm"
                  aria-label={t('stables.destinations.moreLabel', { name })}
                />
              }
            >
              {t('stables.destinations.more')}
              <CaretDownIcon data-icon="inline-end" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
    >
      <DashboardItemRecordContent
        headingLevel={2}
        titleTone="open"
        // The name link stretches over the row; the destination links sit
        // above it, so no control is nested inside another.
        title={
          <Link
            to="/stables/$stableId"
            params={{ stableId }}
            className="app-control-focus inline-flex items-center gap-1.5 rounded-control text-foreground after:absolute after:inset-0 after:rounded-row after:content-['']"
          >
            <span className="[overflow-wrap:anywhere]">{name}</span>
            <ArrowRightIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground"
            />
          </Link>
        }
        meta={metaItems(location, meta)}
        metaSeparator="dot"
      />
    </DashboardItemRecordCard>
  )
}
