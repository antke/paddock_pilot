import { useEffect, useRef } from 'react'
import {
  includeMyCalendar,
  useCalendarSelection,
} from './calendarSourceSelection'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { CalendarSourceChoices } from './CalendarSourceChoices'
import { useActivityCopy } from './activityCopy'

export function useCalendarSourceSelection(
  page: 'events' | 'training' | 'dashboard',
  stableId?: string,
) {
  const stables = useQuery(api.stables.list)
  const { selected, setSelected } = useCalendarSelection(
    stableId,
    `paddock:activity-calendars:${page}:${stableId ?? 'mine'}`,
  )
  // Removed memberships must not leave a permanently failing saved selection.
  const stableIds = (stables ?? [])
    .filter((stable) => selected.includes(stable._id))
    .map((stable) => stable._id)
  return { stables, selected, setSelected, stableIds }
}

export function useActivityCalendars(training: boolean, stableId?: string) {
  const { stables, selected, setSelected, stableIds } =
    useCalendarSourceSelection(training ? 'training' : 'events', stableId)
  const personal = true
  const result = useQuery(
    api.activities.view,
    stables ? { training, personal, stableIds } : 'skip',
  )
  // Keep the displayed source context together with its results so links and
  // empty states stay correct while another selection loads. Account changes
  // unmount this hook via AccountQueryCacheBoundary; membership/page changes
  // also discard the snapshot rather than retaining access from another scope.
  const scope = JSON.stringify([
    training,
    stableId,
    stables?.map((stable) => stable._id).sort(),
  ])
  const mixedSources = true
  const previous = useRef<
    | {
        scope: string
        data: NonNullable<typeof result>
        personal: boolean
        mixedSources: boolean
      }
    | undefined
  >(undefined)
  useEffect(() => {
    if (result !== undefined) {
      previous.current = { scope, data: result, personal, mixedSources }
    } else if (previous.current?.scope !== scope) {
      previous.current = undefined
    }
  }, [scope, result, personal, mixedSources])
  const displayed =
    result !== undefined
      ? { data: result, personal, mixedSources }
      : previous.current?.scope === scope
        ? previous.current
        : undefined
  return {
    data: displayed?.data,
    loading: result === undefined,
    stables,
    selected,
    setSelected,
    personal: displayed?.personal ?? personal,
    stableIds,
    mixedSources: displayed?.mixedSources ?? mixedSources,
  }
}

export function ActivityCalendarFilter({
  stables,
  selected,
  onChange,
  loading,
}: {
  stables?: Array<{ _id: Id<'stables'>; name: string }>
  selected: string[]
  onChange: (next: string[]) => void
  loading: boolean
}) {
  const c = useActivityCopy()
  if (!stables?.length) return null

  const choices = [
    {
      id: 'mine',
      name: c.mine,
      disabled: true,
      help: { label: c.mineHelpLabel, description: c.mineHelp },
    },
    ...(stables ?? []).map((stable) => ({ id: stable._id, name: stable.name })),
  ]
  return (
    <fieldset className="min-w-0" aria-label={c.calendars} aria-busy={loading}>
      <CalendarSourceChoices
        choices={choices}
        label={c.calendars}
        value={includeMyCalendar(selected)}
        onChange={(next) => onChange(includeMyCalendar(next))}
      />
    </fieldset>
  )
}
