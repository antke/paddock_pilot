import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react'

export const CalendarSelectionAccount = createContext<string | null>(null)
const changedEvent = 'paddock:calendar-selection-changed'
const memory = new Map<string, string>()
export const calendarSelectionKey = (account: string | null) =>
  `paddock:calendar-selection:${account ?? 'anonymous'}`

export const includeMyCalendar = (selected: string[]) => [
  'mine',
  ...new Set(selected.filter((id) => id !== 'mine')),
]

function decode(raw: string | null): string[] | undefined {
  if (!raw || raw.length > 100_000) return undefined
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value) &&
      value.length <= 1000 &&
      value.every((id) => typeof id === 'string')
      ? includeMyCalendar(value)
      : undefined
  } catch {
    return undefined
  }
}
function read(key: string) {
  if (typeof window === 'undefined') return null
  try {
    return memory.get(key) ?? window.localStorage.getItem(key)
  } catch {
    return memory.get(key) ?? null
  }
}
function write(key: string, selected: string[]) {
  const raw = JSON.stringify(includeMyCalendar(selected))
  try {
    window.localStorage.setItem(key, raw)
    memory.delete(key)
  } catch {
    memory.set(key, raw)
  }
  window.dispatchEvent(new Event(changedEvent))
}
function subscribe(listener: () => void) {
  window.addEventListener(changedEvent, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(changedEvent, listener)
    window.removeEventListener('storage', listener)
  }
}
const serverSnapshot = () => null

/** One account-scoped viewing preference, shared by every mounted selector and tab.
 * Creation audiences remain drafts; only a successful save adds them to this preference.
 */
export function useCalendarSelection(
  initialStableId?: string,
  legacyStorageKey?: string,
) {
  const account = useContext(CalendarSelectionAccount)
  const key = calendarSelectionKey(account)
  const snapshot = useCallback(() => read(key), [key])
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  const selected = useMemo(
    () =>
      decode(raw) ?? (initialStableId ? ['mine', initialStableId] : ['mine']),
    [raw, initialStableId],
  )
  useEffect(() => {
    if (decode(read(key))) return
    let previous: string[] | undefined
    try {
      if (legacyStorageKey)
        previous = decode(window.sessionStorage.getItem(legacyStorageKey))
    } catch {
      /* Storage is optional. */
    }
    write(
      key,
      previous ?? (initialStableId ? ['mine', initialStableId] : ['mine']),
    )
  }, [key, initialStableId, legacyStorageKey])
  const setSelected = useCallback((next: string[]) => write(key, next), [key])
  const includeSavedStables = useCallback(
    (stableIds: string[]) => {
      if (stableIds.length)
        write(key, [...(decode(read(key)) ?? ['mine']), ...stableIds])
    },
    [key],
  )
  return { selected, setSelected, includeSavedStables }
}
