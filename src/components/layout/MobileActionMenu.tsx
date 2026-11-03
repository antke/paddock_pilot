import type { ComponentProps, ReactNode, Ref } from 'react'
import { PlusIcon } from '@phosphor-icons/react'
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
    <div data-slot="mobile-action-menu" className="md:hidden print:hidden">
      <DropdownMenu modal={false}>
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
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <DropdownMenuGroup className="grid gap-0.5">
      <DropdownMenuLabel className="px-3 pt-1 pb-1 text-xs font-semibold text-muted-foreground">
        {label}
      </DropdownMenuLabel>
      {children}
    </DropdownMenuGroup>
  )
}

/** Full-bleed divider with equal space above and below inside the p-2 popup. */
export function MobileActionMenuSeparator() {
  return <DropdownMenuSeparator className="-mx-2 my-2" />
}
