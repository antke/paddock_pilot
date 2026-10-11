import type { ReactNode } from 'react'

/** A direct action in the same safe-area position as the mobile action menu. */
export function MobileFloatingAction({ children }: { children: ReactNode }) {
  return (
    <div data-slot="mobile-floating-action" className="md:hidden print:hidden">
      {children}
    </div>
  )
}
