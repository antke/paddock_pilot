import { useClaimedNavigationSection } from './navigationSection'
import { NotificationCenter } from '#/components/notifications/NotificationCenter'
import {
  StableIcon,
  EventIcon,
  HomeIcon,
  TrainingIcon,
} from '#/components/icons/domain-icons'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import {
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
import { useT } from '#/i18n/LocaleProvider'
import HeaderUser from '#/integrations/clerk/header-user'
import { DrawerAccount } from '#/integrations/clerk/DrawerAccount'
import { cn } from '#/lib/utils'
import { DisclosureChevron } from '#/components/ui/disclosure-chevron'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { AppHeader } from './AppShell'
import { AccountPreferencesDialog } from './AccountPreferencesDialog'
import { useAppUserState } from './AppUserStateProvider'
import { isMobileTaskPath, MobileNavigationView } from './MobileNavigation'
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

type Workspace = { _id: string; name: string; canManage?: boolean }

export function WorkspaceNavigation() {
  const { pathname, searchStr } = useLocation()
  const { stables } = useAppUserState()
  const { isAuthenticated } = useConvexAuth()
  const user = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : 'skip')
  const stableId = stableIdFromPath(pathname)
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  return (
    <>
      <WorkspaceNavigationView
        pathname={pathname}
        currentTab={new URLSearchParams(searchStr).get('tab') ?? undefined}
        stables={stables.map((stable) => ({
          _id: stable._id,
          name: stable.name,
          canManage: Boolean(user && stable.ownerId === user._id),
        }))}
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
  accountActions,
  compactAccountActions = accountActions,
  renderDrawerAccount,
  backAction,
}: {
  pathname: string
  currentTab?: string
  stables: Workspace[]
  accountActions: ReactNode
  compactAccountActions?: ReactNode
  renderDrawerAccount?: (
    closeDrawer: (afterClose?: () => void) => void,
  ) => ReactNode
  backAction?: ReactNode
}) {
  const t = useT()
  const [collapsed, setCollapsed] = useState(false)
  // Set by the toggle only, so restoring the saved width on load does not animate.
  const [animated, setAnimated] = useState(false)
  const [open, setOpen] = useState(false)
  const [closeComplete, setCloseComplete] = useState(false)
  const small = useSmallScreen()
  const headerTrigger = useRef<HTMLButtonElement>(null)
  const collapseTrigger = useRef<HTMLButtonElement>(null)
  const afterDrawerClose = useRef<(() => void) | undefined>(undefined)
  const stableId = stableIdFromPath(pathname)
  const stable = stables.find((item) => item._id === stableId)
  const name =
    stable?.name ??
    t(stableId ? 'navigation.stable' : 'navigationShell.personal')
  const section = useClaimedNavigationSection()
  const groups = getWorkspaceNavigation({ pathname, stables, section })
  // Stables the user opened or closed; others follow the route.
  const [disclosed, setDisclosed] = useState<Record<string, boolean>>({})

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

  // Collapsing narrows the sidebar to an icon rail; it never hides it, and the same toggle keeps focus.
  function changeCollapsed(value: boolean) {
    setAnimated(true)
    setCollapsed(value)
    try {
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value))
    } catch {
      // Keep the current session's choice even without storage.
    }
  }

  const navigation = (
    <WorkspaceLinks
      groups={groups}
      disclosed={disclosed}
      onDisclose={(id, value) =>
        setDisclosed((current) => ({ ...current, [id]: value }))
      }
      onNavigate={() => setOpen(false)}
    />
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
        data-animated={animated || undefined}
      >
        <aside
          data-slot="app-sidebar"
          data-collapsed={collapsed}
          data-animated={animated || undefined}
          aria-label={t('navigationShell.menu')}
        >
          <div className="flex items-center justify-between gap-1">
            {!collapsed && <WorkspaceBrand />}
            <Button
              ref={collapseTrigger}
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label={t(
                collapsed
                  ? 'navigationShell.expandSidebar'
                  : 'navigationShell.collapseSidebar',
              )}
              onClick={() => changeCollapsed(!collapsed)}
            >
              <SidebarSimpleIcon aria-hidden="true" />
            </Button>
          </div>
          {collapsed ? <WorkspaceRail groups={groups} /> : navigation}
          <div className="app-workspace-account empty:hidden">
            {collapsed ? compactAccountActions : accountActions}
          </div>
        </aside>

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
            {(!small || !stableId) && <WorkspaceBrand />}
            {stableId && (
              <span
                className="min-w-0 truncate font-display text-xl font-semibold md:ml-3 md:border-l md:border-border-subtle md:pl-4 md:font-sans md:text-sm md:font-normal md:text-muted-foreground"
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
            className="app-workspace-drawer bg-sidebar text-sidebar-foreground outline-none"
            finalFocus={() => {
              if (window.matchMedia('(min-width: 64rem)').matches)
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
            {/* Account sits at the bottom, as in the sidebar. */}
            <div
              data-slot="workspace-drawer-scroll"
              className="app-workspace-drawer-scroll flex! flex-col [&>*]:shrink-0"
            >
              {navigation}
              <div className="app-workspace-account mt-auto empty:hidden">
                {renderDrawerAccount
                  ? renderDrawerAccount((afterClose) => {
                      afterDrawerClose.current = afterClose
                      setOpen(false)
                    })
                  : accountActions}
              </div>
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

function WorkspaceLink({
  item,
  onNavigate,
  plain = false,
}: {
  item: WorkspaceNavigationItem
  onNavigate: () => void
  /** Nested pages sit under their stable without icons. */
  plain?: boolean
}) {
  const t = useT()
  const Icon = navigationIcons[item.icon]
  return (
    <Link {...workspaceLinkProps(item)} onClick={onNavigate}>
      {!plain && <Icon aria-hidden="true" className="size-5 shrink-0" />}
      <span className="min-w-0 [overflow-wrap:anywhere]">
        {item.label ?? t(item.labelKey)}
      </span>
    </Link>
  )
}

function workspaceLinkProps(item: WorkspaceNavigationItem) {
  const [path, query] = item.href.split('?')
  return {
    to: path,
    search: query ? Object.fromEntries(new URLSearchParams(query)) : {},
    activeOptions: { exact: true, includeSearch: true },
    activeProps: { 'aria-current': undefined },
    'aria-current': item.active ? ('page' as const) : undefined,
    className: cn(
      'app-workspace-link app-control-focus app-navigation-item',
      item.active &&
        'bg-sidebar-accent font-semibold text-sidebar-accent-foreground',
    ),
  }
}

/** The collapsed sidebar: daily destinations and personal contacts as icons, named by tooltip. */
function WorkspaceRail({ groups }: { groups: WorkspaceNavigationGroup[] }) {
  const t = useT()
  const items = groups
    .filter((group) => group.id !== 'management')
    .flatMap((group) => group.items)
  return (
    <nav aria-label={t('navigation.primary')} className="app-workspace-links">
      <ul className="grid gap-1">
        {items.map((item) => {
          const Icon = navigationIcons[item.icon]
          const label = item.label ?? t(item.labelKey)
          return (
            <li key={item.id}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Link {...workspaceLinkProps(item)} aria-label={label} />
                  }
                >
                  <Icon aria-hidden="true" className="size-5 shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {label}
                </TooltipContent>
              </Tooltip>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function WorkspaceLinks({
  groups,
  disclosed,
  onDisclose,
  onNavigate,
}: {
  groups: WorkspaceNavigationGroup[]
  disclosed: Record<string, boolean>
  onDisclose: (id: string, open: boolean) => void
  onNavigate: () => void
}) {
  const t = useT()
  const navigation = useRef<HTMLElement>(null)
  const navigationId = useId()
  const activeId = groups
    .flatMap((group) => group.items)
    .flatMap((item) => [item, ...(item.children ?? [])])
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
            <h2 className="px-3 text-sm font-medium text-muted-foreground [overflow-wrap:anywhere]">
              {t(group.labelKey)}
            </h2>
          )}
          <ul className="grid gap-1">
            {group.items.map((item) => {
              if (!item.children)
                return (
                  <li key={item.id}>
                    <WorkspaceLink item={item} onNavigate={onNavigate} />
                  </li>
                )
              const open = disclosed[item.id] ?? Boolean(item.current)
              const listId = `${navigationId}-${item.id}`
              const name = item.label ?? t(item.labelKey)
              return (
                <li key={item.id}>
                  {/* Link and toggle are siblings, so neither click reaches the other. */}
                  <div className="app-workspace-row">
                    <WorkspaceLink item={item} onNavigate={onNavigate} />
                    <Button
                      variant="ghost"
                      size="icon"
                      // The caret alone shows the state (The Disclosure Rule).
                      className="size-11 shrink-0 aria-expanded:bg-transparent aria-expanded:hover:bg-primary/8"
                      aria-expanded={open}
                      aria-controls={listId}
                      aria-label={t('navigationShell.stablePages', { name })}
                      onClick={() => onDisclose(item.id, !open)}
                    >
                      <DisclosureChevron open={open} />
                    </Button>
                  </div>
                  <ul
                    id={listId}
                    hidden={!open}
                    className="app-workspace-sublist"
                  >
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <WorkspaceLink
                          item={child}
                          onNavigate={onNavigate}
                          plain
                        />
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
