import { Show, SignInButton, UserButton } from '@clerk/tanstack-react-start'

import { useAppUserState } from '#/components/layout/AppUserStateProvider'
import { isDevAuthBypassEnabled } from '#/lib/devAuthBypass'
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
} from '@phosphor-icons/react'
import type { Id } from 'convex/_generated/dataModel'
import { api } from 'convex/_generated/api'
import { useQuery } from 'convex/react'

export default function HeaderUser() {
  if (isDevAuthBypassEnabled()) {
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
            <DropdownMenuItem
              onClick={() =>
                navigate({
                  to: '/stables/$stableId',
                  params: { stableId: activeStableId },
                })
              }
            >
              <HouseIcon aria-hidden="true" />
              Stable overview
            </DropdownMenuItem>
            {activeStable?.ownerId === currentUser?._id && (
              <DropdownMenuItem
                onClick={() =>
                  navigate({
                    to: '/stables/$stableId/settings',
                    params: { stableId: activeStableId },
                  })
                }
              >
                <GearIcon aria-hidden="true" />
                Stable settings
              </DropdownMenuItem>
            )}
          </>
        )}
        <DropdownMenuItem onClick={() => navigate({ to: '/stables' })}>
          <BuildingsIcon aria-hidden="true" />
          Manage stables
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
