import type { ReactNode } from 'react'

/** Shared application-owned boundary; authentication remains provider-owned. */
export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-full min-w-0 place-items-center">
      <div className="w-full min-w-0 max-w-md">{children}</div>
    </div>
  )
}
