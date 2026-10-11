import { useCallback, useEffect, useRef, useState } from 'react'

/** A brief acknowledgement belongs to this record, not the next one rendered here. */
export function useTransientConfirmation(identity: string) {
  const [confirmedIdentity, setConfirmedIdentity] = useState<string>()
  const currentIdentity = useRef(identity)
  currentIdentity.current = identity
  const mounted = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const clear = useCallback(() => {
    clearTimeout(timer.current)
    setConfirmedIdentity(undefined)
  }, [])

  useEffect(() => {
    mounted.current = true
    clear()
    return () => {
      mounted.current = false
      clearTimeout(timer.current)
    }
  }, [identity, clear])

  const confirm = () => {
    if (!mounted.current || currentIdentity.current !== identity) return
    clearTimeout(timer.current)
    setConfirmedIdentity(identity)
    timer.current = setTimeout(() => setConfirmedIdentity(undefined), 2400)
  }
  return { confirmed: confirmedIdentity === identity, confirm, clear }
}
