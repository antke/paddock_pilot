import type { ReactNode } from 'react'
import { useClaimFloatingSlot } from './floatingActionsContext'

/**
 * A direct action in the same safe-area position as the mobile action menu.
 * It claims the page's floating slot so registered shortcuts do not stack on
 * top of it; the registry's own outlet passes `claimSlot={false}`.
 */
export function MobileFloatingAction({
  children,
  claimSlot = true,
}: {
  children: ReactNode
  claimSlot?: boolean
}) {
  useClaimFloatingSlot(claimSlot)
  return (
    <div data-slot="mobile-floating-action" className="md:hidden print:hidden">
      {children}
    </div>
  )
}
