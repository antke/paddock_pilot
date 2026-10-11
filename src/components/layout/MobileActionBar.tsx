import type { ReactNode } from 'react'

/** A task action above the browse navigation. Forms own their own bottom controls. */
export function MobileActionBar({ children }: { children: ReactNode }) {
  return (
    <div data-slot="mobile-action-bar" className="md:hidden">
      {children}
    </div>
  )
}
