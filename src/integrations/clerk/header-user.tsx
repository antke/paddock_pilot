import { Show, SignInButton, UserButton } from '@clerk/tanstack-react-start'

import { useAppUserState } from '#/components/layout/AppUserStateProvider'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { TextLabel } from '#/components/ui/text-label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Button } from '#/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import {
  BuildingsIcon,
  CaretDownIcon,
  CreditCardIcon,
  GearIcon,
  HouseIcon,
  ListChecksIcon,
  UserCircleIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react'
import type { Id } from 'convex/_generated/dataModel'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'

export default function HeaderUser() {
  const devAuthBypassEnabled = useDevAuthBypassEnabled()

  if (devAuthBypassEnabled) {
    return (
      <TextLabel
        weight="semibold"
        tracking="wide"
        className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary"
      >
        Dev fixture
      </TextLabel>
    )
  }

  return (
    <>
      <Show when="signed-out">
        <SignInButton />
      </Show>
      <Show when="signed-in">
        <SignedInUserControls />
      </Show>
    </>
  )
}

function SignedInUserControls() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-1">
      <StableSwitcher />

      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label="Your profile"
            labelIcon={<UserCircleIcon />}
            onClick={() => navigate({ to: '/profile' })}
          />
          <UserButton.Action
            label="Manage stables"
            labelIcon={<BuildingsIcon />}
            onClick={() => navigate({ to: '/stables' })}
          />
          <UserButton.Action
            label="Plans and billing"
            labelIcon={<CreditCardIcon />}
            onClick={() => navigate({ to: '/pricing' })}
          />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  )
}

function StableSwitcher() {
  const navigate = useNavigate()
  const currentUser = useQuery(api.users.getCurrentUser)
  const {
    activeStable,
    activeStableId,
    isLoadingStables,
    setActiveStableId,
    stables,
  } = useAppUserState()

  if (isLoadingStables || stables.length === 0) return null

  const onStableChange = (stableId: string) => {
    const nextStableId = stableId as Id<'stables'>
    setActiveStableId(nextStableId)
    navigate({
      to: '/stables/$stableId',
      params: { stableId: nextStableId },
    })
  }

  return (
    <StableSwitcherView
      stables={stables}
      activeStableId={activeStableId}
      onStableChange={onStableChange}
      canManage={activeStable?.ownerId === currentUser?._id}
      onOpen={(destination) => {
        if (destination === 'stables') {
          void navigate({ to: '/stables' })
          return
        }
        if (!activeStableId) return
        const routes = {
          overview: '/stables/$stableId',
          members: '/stables/$stableId/members',
          welcome: '/stables/$stableId/welcome',
          settings: '/stables/$stableId/settings',
        } as const
        void navigate({
          to: routes[destination],
          params: { stableId: activeStableId },
        })
      }}
    />
  )
}

type StableDestination =
  'overview' | 'members' | 'welcome' | 'settings' | 'stables'
export function StableSwitcherView({
  stables,
  activeStableId,
  onStableChange,
  canManage,
  onOpen,
}: {
  stables: Array<{ _id: string; name: string }>
  activeStableId?: string
  onStableChange: (id: string) => void
  canManage: boolean
  onOpen: (destination: StableDestination) => void
}) {
  const activeStable = stables.find((stable) => stable._id === activeStableId)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={`Active stable: ${activeStable?.name ?? 'select stable'}`}
            className="max-w-44"
          />
        }
      >
        <BuildingsIcon aria-hidden="true" />
        <span className="truncate">
          {activeStable?.name ?? 'Select stable'}
        </span>
        <CaretDownIcon aria-hidden="true" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Active stable</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={activeStableId}
            onValueChange={onStableChange}
          >
            {stables.map((stable) => (
              <DropdownMenuRadioItem key={stable._id} value={stable._id}>
                {stable.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {activeStableId && (
          <>
            <DropdownMenuItem onClick={() => onOpen('overview')}>
              <HouseIcon aria-hidden="true" />
              Stable overview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpen('members')}>
              <UsersThreeIcon aria-hidden="true" />
              Stable people
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpen('welcome')}>
              <ListChecksIcon aria-hidden="true" />
              Getting started
            </DropdownMenuItem>
            {canManage && (
              <DropdownMenuItem onClick={() => onOpen('settings')}>
                <GearIcon aria-hidden="true" />
                Stable settings
              </DropdownMenuItem>
            )}
          </>
        )}
        <DropdownMenuItem onClick={() => onOpen('stables')}>
          <BuildingsIcon aria-hidden="true" />
          Manage stables
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
