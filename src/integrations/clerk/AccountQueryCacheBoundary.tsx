import { CalendarSelectionAccount } from '#/components/events/calendarSourceSelection'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'

/** Account data can survive a route change, but never an identity change. */
export function AccountQueryCacheBoundary({
  identity,
  client,
  children,
}: {
  identity: string | null | undefined
  client: QueryClient
  children: ReactNode
}) {
  const [prepared, setPrepared] = useState<{ identity: string | null }>()
  useEffect(() => {
    client.clear()
    setPrepared(identity === undefined ? undefined : { identity })
  }, [identity, client])

  return prepared && prepared.identity === identity ? (
    <CalendarSelectionAccount.Provider value={prepared.identity}>
      {children}
    </CalendarSelectionAccount.Provider>
  ) : null
}
