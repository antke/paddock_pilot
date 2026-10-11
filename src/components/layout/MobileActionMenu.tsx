import type { ComponentProps, ReactNode, Ref } from 'react'
import { PlusIcon } from '@phosphor-icons/react'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { cn } from '#/lib/utils'

/** One thumb-reachable action menu above the mobile navigation. */
export function MobileActionMenu({
  label,
  children,
  triggerRef,
}: {
  label: string
  children: ReactNode
  triggerRef?: Ref<HTMLButtonElement>
}) {
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
