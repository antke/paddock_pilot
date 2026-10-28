import type { ReactNode } from 'react'

/** Shared application-owned boundary; authentication remains provider-owned. */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    // Keep mobile auth in normal flow so a tall parent cannot push the form
    // below the initial viewport. Only center vertically on larger screens.
    <div className="grid min-w-0 justify-items-center sm:min-h-full sm:items-center">
      <div className="w-full min-w-0 max-w-md">{children}</div>
    </div>
  )
}
