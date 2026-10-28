import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import { useCalendarSourceSelection } from '#/components/events/ActivityCalendarFilter'

export function useDashboardData(today: string) {
  const selection = useCalendarSourceSelection('dashboard')
  const { data: result } = useQuery({
    ...convexQuery(api.dashboard.view, {
      stableIds: selection.stableIds,
      today,
    }),
    enabled: selection.stables !== undefined,
    throwOnError: true,
  })
  // Retain a complete dashboard while its sources change, never across a
  // membership/day boundary. Account changes unmount via the account gate.
  const scope = JSON.stringify([
    today,
    selection.stables?.map((stable) => stable._id).sort(),
  ])
  const previous = useRef<
    { scope: string; data: NonNullable<typeof result> } | undefined
  >(undefined)
  useEffect(() => {
    if (result !== undefined) previous.current = { scope, data: result }
    else if (previous.current?.scope !== scope) previous.current = undefined
  }, [scope, result])
  return {
    ...selection,
    loading: result === undefined,
    data:
      result ??
      (previous.current?.scope === scope ? previous.current.data : undefined),
  }
}
