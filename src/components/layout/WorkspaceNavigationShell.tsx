import { NotificationCenter } from '#/components/notifications/NotificationCenter'
import {
  StableIcon,
  EventIcon,
  HomeIcon,
  TrainingIcon,
} from '#/components/icons/domain-icons'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import {
  CaretDownIcon,
  ChartLineIcon,
  CheckSquareIcon,
  FilesIcon,
  GearIcon,
  HorseIcon,
  ListIcon,
  PhoneIcon,
  SidebarSimpleIcon,
  UsersThreeIcon,
  XIcon,
} from '@phosphor-icons/react'
import { useConvexAuth, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { DashboardBrandWordmark } from '#/components/dashboard/DashboardDisplayHeading'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useT } from '#/i18n/LocaleProvider'
import HeaderUser from '#/integrations/clerk/header-user'
import { DrawerAccount } from '#/integrations/clerk/DrawerAccount'
import { cn } from '#/lib/utils'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { AppHeader } from './AppShell'
import { AccountPreferencesDialog } from './AccountPreferencesDialog'
import { useAppUserState } from './AppUserStateProvider'
import {
  isMobileTaskPath,
  MobileBackButton,
  MobileNavigationView,
} from './MobileNavigation'
import { getWorkspaceNavigation, stableIdFromPath } from './workspaceNavigation'
import type {
  WorkspaceNavigationGroup,
  WorkspaceNavigationItem,
} from './workspaceNavigation'

export const SIDEBAR_COLLAPSED_KEY = 'paddockPilot.sidebarCollapsed'

const navigationIcons = {
  home: HomeIcon,
  events: EventIcon,
  training: TrainingIcon,
  horses: HorseIcon,
  care: CheckSquareIcon,
  contacts: PhoneIcon,
  documents: FilesIcon,
  analysis: ChartLineIcon,
  stable: StableIcon,
  people: UsersThreeIcon,
  settings: GearIcon,
  welcome: CheckSquareIcon,
}

type Workspace = { _id: string; name: string }

export function WorkspaceNavigation() {
  const { pathname, searchStr } = useLocation()
  const { stables, isLoadingStables } = useAppUserState()
  const { isAuthenticated } = useConvexAuth()
  const user = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : 'skip')
  const stableId = stableIdFromPath(pathname)
  const stable = stables.find((item) => item._id === stableId)
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  return (
    <>
      <WorkspaceNavigationView
        pathname={pathname}
        currentTab={new URLSearchParams(searchStr).get('tab') ?? undefined}
        stables={stables}
        isLoadingStables={isLoadingStables}
        canManageStable={Boolean(user && stable?.ownerId === user._id)}
        accountActions={
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <HeaderUser compact={false} showStableSwitcher={false} />
          </div>
        }
        compactAccountActions={
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <HeaderUser showStableSwitcher={false} />
          </div>
        }
        renderDrawerAccount={(closeDrawer) => (
          <DrawerAccount
            closeDrawer={closeDrawer}
            showManageStables={Boolean(stableId)}
            onPreferences={() => setPreferencesOpen(true)}
          />
        )}
        backAction={<MobileBackButton />}
      />
      <AccountPreferencesDialog
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
      />
    </>
  )
}

/** Shared production shell, also rendered with local sample data in the lab. */
export function WorkspaceNavigationView({
  pathname,
  currentTab,
  stables,
  isLoadingStables = false,
  canManageStable = false,
  accountActions,
  compactAccountActions = accountActions,
  renderDrawerAccount,
  backAction,
}: {
  pathname: string
  currentTab?: string
  stables: Workspace[]
  isLoadingStables?: boolean
  canManageStable?: boolean
  accountActions: ReactNode
  compactAccountActions?: ReactNode
  renderDrawerAccount?: (
    closeDrawer: (afterClose?: () => void) => void,
  ) => ReactNode
  backAction?: ReactNode
}) {
  const t = useT()
  const [collapsed, setCollapsed] = useState(false)
  const [open, setOpen] = useState(false)
  const [closeComplete, setCloseComplete] = useState(false)
  const small = useSmallScreen()
  const headerTrigger = useRef<HTMLButtonElement>(null)
  const collapseTrigger = useRef<HTMLButtonElement>(null)
  const moveFocus = useRef(false)
  const afterDrawerClose = useRef<(() => void) | undefined>(undefined)
  const stableId = stableIdFromPath(pathname)
  const stable = stables.find((item) => item._id === stableId)
  const name =
    stable?.name ??
    t(stableId ? 'navigation.stable' : 'navigationShell.personal')
  const groups = getWorkspaceNavigation({
    pathname,
    stableId,
    currentTab,
    canManageStable,
  })

  useEffect(() => {
    try {
      setCollapsed(
        window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true',
      )
    } catch {
      // Navigation remains usable when browser storage is unavailable.
    }
    const sync = (event: StorageEvent) => {
      if (event.key === SIDEBAR_COLLAPSED_KEY || event.key === null)
        setCollapsed(event.newValue === 'true')
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  useEffect(() => {
    afterDrawerClose.current = undefined
    setOpen(false)
  }, [pathname, currentTab])

  useEffect(() => {
    if (open || !closeComplete) return
    const action = afterDrawerClose.current
    afterDrawerClose.current = undefined
    action?.()
  }, [open, closeComplete])

  useEffect(() => {
    // A drawer must not remain modal after resizing back to an expanded sidebar.
    const media = window.matchMedia('(min-width: 64rem)')
    const close = () => setOpen(false)
    media.addEventListener('change', close)
    return () => media.removeEventListener('change', close)
  }, [])

  useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    const nextTrigger = collapsed
      ? headerTrigger.current
      : collapseTrigger.current
    nextTrigger?.focus()
  }, [collapsed])

  function changeCollapsed(value: boolean) {
    moveFocus.current = true
    setCollapsed(value)
    setOpen(false)
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value))
    } catch {
      // Keep the current session's choice even without storage.
    }
  }

  const workspace = stableId ? (
    <WorkspacePicker
      stables={stables}
      stableId={stableId}
      name={name}
      loading={isLoadingStables}
      onNavigate={() => setOpen(false)}
    />
  ) : null
  const navigation = (
    <WorkspaceLinks groups={groups} onNavigate={() => setOpen(false)} />
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          afterDrawerClose.current = undefined
          setCloseComplete(false)
        }
        setOpen(nextOpen)
      }}
      onOpenChangeComplete={(isOpen) => {
        setCloseComplete(!isOpen)
      }}
    >
      <div
        className="contents"
        data-slot="workspace-navigation"
        data-collapsed={collapsed}
      >
        {!collapsed && (
          <aside
            data-slot="app-sidebar"
            data-local-stable={Boolean(stableId)}
            aria-label={t('navigationShell.menu')}
          >
            <div className="flex items-center justify-between gap-1">
              <WorkspaceBrand />
              <Button
                ref={collapseTrigger}
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label={t('navigationShell.collapseSidebar')}
                title={t('navigationShell.collapseSidebar')}
                onClick={() => changeCollapsed(true)}
              >
                <SidebarSimpleIcon aria-hidden="true" />
              </Button>
            </div>
            {workspace}
            {navigation}
            <div className="app-workspace-account">{accountActions}</div>
          </aside>
        )}

        <AppHeader className="app-workspace-header">
          <div className="flex min-h-16 min-w-0 items-center gap-1 px-4 py-2 sm:gap-3">
            {backAction && (
              <div className="shrink-0 lg:hidden">{backAction}</div>
            )}
            {(!small || isMobileTaskPath(pathname)) && (
              <DialogPrimitive.Trigger
                render={
                  <Button
                    ref={headerTrigger}
                    variant="ghost"
                    className="min-h-11 min-w-11 shrink-0 px-2"
                    aria-label={t('navigationShell.openMenu')}
                  />
                }
              >
                <ListIcon aria-hidden="true" className="size-5" />
                <span className="hidden sm:inline">
                  {t('navigationShell.menu')}
                </span>
              </DialogPrimitive.Trigger>
            )}
            <WorkspaceBrand />
            {stableId && (
              <span
                className="ml-3 hidden min-w-0 truncate border-l border-border-subtle pl-4 text-sm text-muted-foreground md:block"
                title={name}
              >
                {name}
              </span>
            )}
            <div className="ml-auto shrink-0">{compactAccountActions}</div>
          </div>
        </AppHeader>

        <MobileNavigationView
          pathname={pathname}
          stableId={stableId}
          renderMore={(button) => <DialogPrimitive.Trigger render={button} />}
        />
      </div>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Viewport className="app-workspace-menu-viewport fixed inset-0 z-50 flex items-stretch justify-start overflow-hidden">
          <DialogPrimitive.Popup
            data-slot="workspace-drawer"
            data-local-stable={Boolean(stableId)}
            className="app-workspace-drawer bg-sidebar text-sidebar-foreground outline-none"
            finalFocus={() => {
              if (!collapsed && window.matchMedia('(min-width: 64rem)').matches)
                return collapseTrigger.current
              // The bottom menu button disappears at tablet widths.
              if (window.matchMedia('(min-width: 48rem)').matches)
                return headerTrigger.current
              // On mobile Base UI restores the bottom button or the form header trigger.
              return true
            }}
          >
            <div className="flex min-w-0 items-center justify-between gap-3">
              <DialogTitle>Paddock Pilot</DialogTitle>
              <DialogClose
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-11 shrink-0"
                    aria-label={t('navigationShell.closeMenu')}
                  />
                }
              >
                <XIcon aria-hidden="true" className="size-5" />
              </DialogClose>
            </div>
            <DialogDescription className="sr-only">
              {t('navigationShell.menuDescription')}
            </DialogDescription>
            {workspace}
            <div
              data-slot="workspace-drawer-scroll"
              className="app-workspace-drawer-scroll"
            >
              {navigation}
              <div className="app-workspace-account">
                {renderDrawerAccount
                  ? renderDrawerAccount((afterClose) => {
                      afterDrawerClose.current = afterClose
                      setOpen(false)
                    })
                  : accountActions}
              </div>
              <Button
                variant="ghost"
                className="hidden min-h-11 w-full justify-start gap-2 lg:flex"
                onClick={() => changeCollapsed(false)}
              >
                <SidebarSimpleIcon aria-hidden="true" />
                {t('navigationShell.expandSidebar')}
              </Button>
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Viewport>
      </DialogPortal>
    </Dialog>
  )
}

function WorkspaceBrand() {
  return (
    <Link
      to="/"
      activeOptions={{ exact: true }}
      className="app-control-focus flex min-h-11 min-w-0 shrink-0 items-center rounded-control"
      aria-label="Paddock Pilot"
    >
      <DashboardBrandWordmark className="whitespace-nowrap text-xl">
        Paddock Pilot
      </DashboardBrandWordmark>
    </Link>
  )
}

function WorkspacePicker({
  stables,
  stableId,
  name,
  loading,
  onNavigate,
}: {
  stables: Workspace[]
  stableId?: string
  name: string
  loading: boolean
  onNavigate: () => void
}) {
  const t = useT()
  const navigate = useNavigate()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="secondary"
            className="min-h-11 min-w-0 w-full justify-between gap-2 text-left font-medium"
            aria-label={t('navigationShell.currentStableName', { name })}
            disabled={loading}
          />
        }
      >
        <span className="min-w-0 truncate">{name}</span>
        <CaretDownIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-(--anchor-width) min-w-64 max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            {t('navigationShell.switchStable')}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={stableId}
            onValueChange={(value) => {
              onNavigate()
              void navigate({
                to: '/stables/$stableId',
                params: { stableId: value },
              })
            }}
          >
            {stables.map((stable) => (
              <DropdownMenuRadioItem
                key={stable._id}
                value={stable._id}
                className="min-h-11 text-sm [overflow-wrap:anywhere]"
              >
                {stable.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="min-h-11 text-sm"
          onClick={() => {
            onNavigate()
            void navigate({ to: '/stables' })
          }}
        >
          <StableIcon aria-hidden="true" />
          {t('navigation.manageStables')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function WorkspaceLink({
  item,
  onNavigate,
}: {
  item: WorkspaceNavigationItem
  onNavigate: () => void
}) {
  const t = useT()
  const Icon = navigationIcons[item.icon]
  const [path, query] = item.href.split('?')
  return (
    <Link
      to={path}
      search={query ? Object.fromEntries(new URLSearchParams(query)) : {}}
      activeOptions={{ exact: true, includeSearch: true }}
      activeProps={{ 'aria-current': undefined }}
      aria-current={item.active ? 'page' : undefined}
      className={cn(
        'app-workspace-link app-control-focus app-navigation-item',
        item.active &&
          'bg-sidebar-accent font-semibold text-sidebar-accent-foreground',
      )}
      onClick={onNavigate}
    >
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      <span>{t(item.labelKey)}</span>
    </Link>
  )
}

function WorkspaceLinks({
  groups,
  onNavigate,
}: {
  groups: WorkspaceNavigationGroup[]
  onNavigate: () => void
}) {
  const t = useT()
  const navigation = useRef<HTMLElement>(null)
  const activeId = groups
    .flatMap((group) => group.items)
    .find((item) => item.active)?.id
  useEffect(() => {
    const element =
      navigation.current?.closest<HTMLElement>(
        '[data-slot="workspace-drawer-scroll"]',
      ) ?? navigation.current
    if (!element) return
    const revealCurrent = () => {
      const active = element.querySelector<HTMLElement>('[aria-current="page"]')
      if (
        !active ||
        !element.clientHeight ||
        element.scrollHeight <= element.clientHeight
      )
        return
      const bounds = element.getBoundingClientRect()
      const row = active.getBoundingClientRect()
      if (row.top < bounds.top) element.scrollTop -= bounds.top - row.top
      else if (row.bottom > bounds.bottom)
        element.scrollTop += row.bottom - bounds.bottom
    }
    revealCurrent()
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(revealCurrent)
    observer?.observe(element)
    return () => observer?.disconnect()
  }, [activeId])
  return (
    <nav
      ref={navigation}
      aria-label={t('navigation.primary')}
      className="app-workspace-links"
    >
      {groups.map((group) => (
        <div key={group.id} className="app-workspace-group">
          {group.labelKey && (
            <h2 className="px-3 text-sm font-medium text-muted-foreground">
              {t(group.labelKey)}
            </h2>
          )}
          <ul className="grid gap-1">
            {group.items.map((item) => (
              <li key={item.id}>
                <WorkspaceLink item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
