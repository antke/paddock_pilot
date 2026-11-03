import type { ReactNode } from 'react'
import { useClaimFloatingSlot } from './floatingActionsContext'

/** A task action above the browse navigation. Forms own their own bottom controls. */
export function MobileActionBar({ children }: { children: ReactNode }) {
  useClaimFloatingSlot()
  return (
    <div data-slot="mobile-action-bar" className="md:hidden">
      {children}
    </div>
  )
}
