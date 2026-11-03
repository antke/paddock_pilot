import { Link, useLocation } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useConvexAuth, useQuery } from 'convex/react'
import type { StableRole } from 'shared/stables/stableAccess'

import {
  DashboardNavigation,
  DashboardNavigationLinkItem,
  DashboardNavigationMenuGroup,
  DashboardNavigationMenuLink,
} from '#/components/dashboard/DashboardNavigation'
import { useAppUserState } from '#/components/layout/AppUserStateProvider'
import { useT } from '#/i18n/LocaleProvider'
import {
  getStableRailDestination,
  getStableRailMoreDestinations,
  stableRailDirectDestinations,
} from './stableDestinations'
import type { StableDestination } from './stableDestinations'

/**
 * Phone-only local rail for stable collection and management screens. Desktop
 * keeps the workspace sidebar; nested detail pages, calendars and create/edit
 * forms keep their own navigation or task controls.
 */
export function StableLocalNavigation({ stableId }: { stableId: string }) {
  const { pathname, searchStr } = useLocation()
  const { stables } = useAppUserState()
  const { isAuthenticated } = useConvexAuth()
  const user = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : 'skip')
  const stable = stables.find((item) => item._id === stableId)
  const role: StableRole | undefined = stable
    ? user && stable.ownerId === user._id
      ? 'owner'
      : 'member'
    : undefined

  return (
    <StableLocalNavigationView
      stableId={stableId}
      stableName={stable?.name}
      pathAfterStable={pathname.slice(`/stables/${stableId}`.length)}
      directoryTab={new URLSearchParams(searchStr).get('tab') ?? undefined}
      role={role}
    />
  )
}

export function StableLocalNavigationView({
  stableId,
  stableName,
  pathAfterStable,
  directoryTab,
  role,
}: {
  stableId: string
  stableName?: string
  pathAfterStable: string
  directoryTab?: string
  role?: StableRole
}) {
  const t = useT()
  const active = getStableRailDestination(pathAfterStable, directoryTab)
  if (!active) return null
  const moreDestinations = getStableRailMoreDestinations(role)
  const link = ({ to, search }: StableDestination) => (
    <Link
      to={to}
      params={{ stableId }}
      search={search}
      resetScroll={false}
      activeOptions={{ exact: true, includeSearch: Boolean(search) }}
    />
  )

  return (
    <div className="min-w-0 md:hidden print:hidden">
      <DashboardNavigation
        ariaLabel={t('stables.destinations.label', {
          name: stableName ?? t('navigation.stable'),
        })}
        overflow="scroll"
        inset={false}
        className="w-full border-b border-border-subtle pb-2"
        listClassName="p-1"
      >
        {stableRailDirectDestinations.map((destination) => (
          <DashboardNavigationLinkItem
            key={destination.id}
            variant="section"
            className="h-11"
            active={active === destination.id}
            render={link(destination)}
          >
            {t(destination.labelKey)}
          </DashboardNavigationLinkItem>
        ))}
        <DashboardNavigationMenuGroup
          active={moreDestinations.some(({ id }) => id === active)}
          label={t('stables.destinations.more')}
          contentWidth="sm"
          variant="section"
          triggerClassName="h-11"
        >
          {moreDestinations.map((destination) => (
            <DashboardNavigationMenuLink
              key={destination.id}
              variant="section"
              active={active === destination.id}
              render={link(destination)}
            >
              {t(destination.labelKey)}
            </DashboardNavigationMenuLink>
          ))}
        </DashboardNavigationMenuGroup>
      </DashboardNavigation>
    </div>
  )
}
