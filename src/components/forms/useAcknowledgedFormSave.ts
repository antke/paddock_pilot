import { useEffect, useRef, useState } from 'react'

/** A server acknowledgement is durable; retries repeat only a failed continuation. */
export function useAcknowledgedFormSave<TValues, TResult>({
  save,
  onSaved,
  saveError,
  continueError,
  onAcknowledged,
  onPendingChange,
}: {
  save: (values: TValues) => Promise<TResult>
  onSaved: (result: TResult) => void | Promise<void>
  saveError: string
  continueError: string
  onAcknowledged?: (result: TResult, values: TValues) => void
  onPendingChange?: (pending: boolean) => void
}) {
  const lock = useRef(false)
  const saved = useRef<{ result: TResult } | null>(null)
  const epoch = useRef(0)
  const mounted = useRef(false)
  const pendingChange = useRef(onPendingChange)
  pendingChange.current = onPendingChange
  const [phase, setPhase] = useState<'idle' | 'saving' | 'continuing'>('idle')
  const [acknowledged, setAcknowledged] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState<string>()
  const [errorKind, setErrorKind] = useState<'save' | 'continuation' | null>(
    null,
  )

  useEffect(() => {
    mounted.current = true
    epoch.current++
    return () => {
      mounted.current = false
      epoch.current++
      pendingChange.current?.(false)
    }
  }, [])

  const clearError = () => {
    setError(undefined)
    setErrorKind(null)
  }
  const isCurrent = (current: number) =>
    mounted.current && epoch.current === current
  const finish = (current: number) => {
    lock.current = false
    if (!isCurrent(current)) return
    setPhase('idle')
    pendingChange.current?.(false)
  }
  const continueSaved = async (result: TResult, current: number) => {
    if (!isCurrent(current)) return
    setPhase('continuing')
    try {
      await onSaved(result)
      if (isCurrent(current)) setCompleted(true)
    } catch {
      if (isCurrent(current)) {
        setError(continueError)
        setErrorKind('continuation')
      }
    }
  }
  const retryContinuation = async () => {
    if (lock.current || !saved.current || !mounted.current) return
    lock.current = true
    const current = epoch.current
    pendingChange.current?.(true)
    clearError()
    try {
      await continueSaved(saved.current.result, current)
    } finally {
      finish(current)
    }
  }
  const submit = async (values: TValues) => {
    if (lock.current || saved.current || !mounted.current) return
    lock.current = true
    const current = epoch.current
    pendingChange.current?.(true)
    clearError()
    setPhase('saving')
    try {
      let result: TResult
      try {
        result = await save(values)
      } catch {
        if (isCurrent(current)) {
          setError(saveError)
          setErrorKind('save')
        }
        return
      }
      if (!isCurrent(current)) return
      saved.current = { result }
      setAcknowledged(true)
      // Notification/reset failures must not turn an acknowledged save into another write.
      try {
        onAcknowledged?.(result, values)
      } catch {
        setError(continueError)
        setErrorKind('continuation')
        return
      }
      await continueSaved(result, current)
    } finally {
      finish(current)
    }
  }
  return {
    submit,
    retryContinuation,
    pending: phase !== 'idle',
    phase,
    acknowledged,
    completed,
    error,
    errorKind,
    clearError,
  }
}
