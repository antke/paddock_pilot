import type { ComponentProps, ReactNode, Ref } from 'react'
import { PlusIcon } from '@phosphor-icons/react'
import { Menu as MenuPrimitive } from '@base-ui/react/menu'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { cn } from '#/lib/utils'
import { useClaimFloatingSlot } from './floatingActionsContext'

/** One thumb-reachable action menu above the mobile navigation. */
export function MobileActionMenu({
  label,
  children,
  triggerRef,
  claimSlot = true,
}: {
  label: string
  children: ReactNode
  triggerRef?: Ref<HTMLButtonElement>
  /** Page menus own the floating slot; the shortcut registry passes false. */
  claimSlot?: boolean
}) {
  useClaimFloatingSlot(claimSlot)
  return (
    // While open the round button (now Close) rises above the scrim.
    <div
      data-slot="mobile-action-menu"
      className="md:hidden print:hidden has-[[aria-expanded=true]]:z-60!"
    >
      <DropdownMenu modal={false}>
        <MenuPrimitive.Portal>
          {/* Same scrim as dialogs and the menu sheet: dims the page so the menu reads on its own. */}
          <MenuPrimitive.Backdrop
            data-slot="mobile-action-menu-backdrop"
            className="fixed inset-0 isolate z-50 bg-foreground/15 app-overlay-motion supports-backdrop-filter:backdrop-blur-xs motion-reduce:animate-none motion-reduce:transition-none md:hidden"
          />
        </MenuPrimitive.Portal>
        <DropdownMenuTrigger
          render={
            <Button
              ref={triggerRef}
              size="fab"
              className="app-action-menu-trigger"
              aria-label={label}
            />
          }
        >
          <PlusIcon
            className="app-action-menu-icon"
            weight="bold"
            aria-hidden="true"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          data-slot="mobile-action-menu-popup"
          aria-label={label}
          side="top"
          align="end"
          sideOffset={12}
          className="app-action-menu-motion w-64 max-w-[calc(100vw-2rem)] p-2 md:hidden"
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function MobileActionMenuItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuItem>) {
  return (
    <DropdownMenuItem
      className={cn('min-h-12 gap-3 px-3 text-base', className)}
      {...props}
    />
  )
}

/** A labelled section of the action menu, such as Add or Go to. */
export function MobileActionMenuGroup({
  label,
  nested = false,
  children,
}: {
  /** Omit for a group that a separator alone sets apart. */
  label?: string
  /** A sub-group inside a labelled group: its label is a quieter sub-heading. */
  nested?: boolean
  children: ReactNode
}) {
  return (
    <DropdownMenuGroup className="grid gap-0.5">
      {label && (
        <DropdownMenuLabel
          className={cn(
            'px-3 pb-1 text-xs text-muted-foreground',
            nested ? 'truncate pt-2 font-normal' : 'pt-1 font-semibold',
          )}
        >
          {label}
        </DropdownMenuLabel>
      )}
      {children}
    </DropdownMenuGroup>
  )
}

/** Full-bleed divider with equal space above and below inside the p-2 popup. */
export function MobileActionMenuSeparator() {
  return <DropdownMenuSeparator className="-mx-2 my-2" />
}
