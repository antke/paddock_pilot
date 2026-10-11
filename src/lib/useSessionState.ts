import { useCallback, useEffect, useRef, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

/** Tab-local controls only. Restore after hydration; fixtures opt out by omitting key.
 * Writes happen in the setter, before source navigation can unmount the workspace.
 * A denied storage API or malformed snapshot never prevents exploration.
 */
export function useSessionState<T>(
  key: string | undefined,
  initial: T | (() => T),
  decode: (value: unknown) => T | undefined,
  encode: (value: T) => unknown = (value) => value,
): [T, Dispatch<SetStateAction<T>>] {
  const resolve = () =>
    typeof initial === 'function' ? (initial as () => T)() : initial
  const [value, setValue] = useState<T>(resolve)
  const current = useRef(value)
  const options = useRef({ resolve, decode, encode })
  options.current = { resolve, decode, encode }
  useEffect(() => {
    let next = options.current.resolve()
    if (key) {
      try {
        const raw = window.sessionStorage.getItem(key)
        if (raw && raw.length <= 100_000)
          next = options.current.decode(JSON.parse(raw)) ?? next
      } catch {
        /* Storage can be unavailable in private/embedded browsers. */
      }
    }
    current.current = next
    setValue(next)
  }, [key])
  const update = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      const result =
        typeof next === 'function'
          ? (next as (previous: T) => T)(current.current)
          : next
      current.current = result
      setValue(result)
      if (!key) return
      try {
        const safe = options.current.encode(result)
        if (options.current.decode(safe) !== undefined)
          window.sessionStorage.setItem(key, JSON.stringify(safe))
      } catch {
        /* Keep the working state even when persistence is unavailable. */
      }
    },
    [key],
  )
  return [value, update]
}
