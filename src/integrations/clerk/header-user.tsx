import { useT } from '#/i18n/LocaleProvider'
import { Show, SignInButton, UserButton } from '@clerk/tanstack-react-start'
import { useRef, useState } from 'react'

import { AccountPreferencesDialog } from '#/components/layout/AccountPreferencesDialog'
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

type HeaderUserProps = {
  compact?: boolean
  showStableSwitcher?: boolean
}

export default function HeaderUser({
  compact = true,
  showStableSwitcher = true,
}: HeaderUserProps) {
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
        <SignedInUserControls
          compact={compact}
          showStableSwitcher={showStableSwitcher}
        />
      </Show>
    </>
  )
}

function SignedInUserControls({
  compact,
  showStableSwitcher,
}: Required<HeaderUserProps>) {
  const t = useT()
  const navigate = useNavigate()
  const controlsRef = useRef<HTMLDivElement>(null)
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  return (
    <div
      ref={controlsRef}
      className={
        compact
          ? 'flex min-w-0 items-center gap-1'
          : 'flex w-full min-w-0 items-center gap-1'
      }
    >
      {showStableSwitcher && <StableSwitcher />}

      <UserButton
        showName={!compact}
        appearance={{
          elements: {
            rootBox: { width: compact ? 'auto' : '100%', minWidth: 0 },
            userButtonTrigger: compact
              ? 'min-h-11 min-w-11 justify-center'
              : 'min-h-12 w-full min-w-0 rounded-control px-2 text-left hover:bg-accent',
            userButtonBox: compact
              ? undefined
              : 'w-full min-w-0 flex-row-reverse justify-end gap-3',
            userButtonOuterIdentifier:
              'min-w-0 flex-1 truncate text-left font-sans text-sm font-medium text-foreground',
            avatarBox: 'size-8 shrink-0',
          },
        }}
      >
        <UserButton.MenuItems>
          <UserButton.Action
            label={t('navigation.profile')}
            labelIcon={<UserCircleIcon />}
            onClick={() => navigate({ to: '/profile' })}
          />
          <UserButton.Action
            label={t('navigation.manageStables')}
            labelIcon={<BuildingsIcon />}
            onClick={() => navigate({ to: '/stables' })}
          />
          <UserButton.Action
            label={t('navigation.billing')}
            labelIcon={<CreditCardIcon />}
            onClick={() => navigate({ to: '/pricing' })}
          />
          <UserButton.Action
            label={t('navigation.accountPreferences')}
            labelIcon={<GearIcon />}
            onClick={() => setPreferencesOpen(true)}
          />
        </UserButton.MenuItems>
      </UserButton>
      <AccountPreferencesDialog
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        finalFocus={() =>
          controlsRef.current?.querySelector<HTMLElement>(
            '.cl-userButtonTrigger',
          ) ?? null
        }
      />
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
          members: '/stables/$stableId/stable',
          welcome: '/stables/$stableId/welcome',
          settings: '/stables/$stableId/settings',
        } as const
        void navigate({
          to: routes[destination],
          params: { stableId: activeStableId },
          search: destination === 'members' ? { tab: 'people' } : {},
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
  const t = useT()
  const activeStable = stables.find((stable) => stable._id === activeStableId)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label={t('navigation.activeStableName', {
              name: activeStable?.name ?? t('navigation.selectStable'),
            })}
            className="min-h-11 min-w-11 max-w-44 px-2 sm:px-3"
          />
        }
      >
        <BuildingsIcon aria-hidden="true" />
        <span className="hidden truncate sm:inline">
          {activeStable?.name ?? t('navigation.selectStable')}
        </span>
        <CaretDownIcon aria-hidden="true" className="hidden sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('navigation.activeStable')}</DropdownMenuLabel>
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
              {t('navigation.overview')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpen('members')}>
              <UsersThreeIcon aria-hidden="true" />
              {t('navigation.people')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpen('welcome')}>
              <ListChecksIcon aria-hidden="true" />
              {t('navigation.gettingStarted')}
            </DropdownMenuItem>
            {canManage && (
              <DropdownMenuItem onClick={() => onOpen('settings')}>
                <GearIcon aria-hidden="true" />
                {t('navigation.settings')}
              </DropdownMenuItem>
            )}
          </>
        )}
        <DropdownMenuItem onClick={() => onOpen('stables')}>
          <BuildingsIcon aria-hidden="true" />
          {t('navigation.manageStables')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
