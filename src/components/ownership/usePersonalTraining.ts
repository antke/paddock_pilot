import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import type { FunctionReturnType } from 'convex/server'
import { api } from 'convex/_generated/api'

type HorseTraining = FunctionReturnType<typeof api.training.listForHorse>

/** Reuse the same permission-checked, reactive history as each horse's training tab. */
export function usePersonalTraining() {
  const { data: roster } = useQuery({
    ...convexQuery(api.horses.listMine),
    throwOnError: true,
  })
  const requests = useMemo(
    () =>
      (roster ?? []).map((horse) => ({
        ...convexQuery(api.training.listForHorse, { horseId: horse._id }),
        throwOnError: true,
      })),
    [roster],
  )
  const results = useQueries({ queries: requests })
  return useMemo(() => {
    if (!roster) return undefined
    const rows: HorseTraining[] = []
    for (const { data: result } of results) {
      if (result === undefined) return undefined
      rows.push(result)
    }
    return {
      roster,
      horses: roster.map((horse) => ({
        ...horse,
        canRecord: horse.access.canEditPersonalRecords,
      })),
      events: rows.flatMap((row) => row.events),
      records: rows.flatMap((row) => row.records),
    }
  }, [roster, results])
}
