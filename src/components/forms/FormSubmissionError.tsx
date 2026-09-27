import { useEffect, useRef } from 'react'
import { Alert, AlertDescription } from '#/components/ui/alert'

/** A failed submission stays beside its retry action and is revealed once. */
export function FormSubmissionError({ message }: { message?: string }) {
  const alert = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!message || !alert.current?.isConnected) return
    alert.current.focus({ preventScroll: true })
    alert.current.scrollIntoView?.({
      behavior: 'instant',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [message])

  if (!message) return null
  return (
    <Alert ref={alert} variant="destructive" tabIndex={-1}>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
