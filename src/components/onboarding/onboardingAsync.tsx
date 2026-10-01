import { createContext, useContext, useRef, useState } from 'react'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { Button } from '#/components/ui/button'
import { useT } from '#/i18n/LocaleProvider'

export const OnboardingPendingContext = createContext<
  (pending: boolean) => void
>(() => undefined)
export const useOnboardingPending = () => useContext(OnboardingPendingContext)

/** Acknowledged writes are retained while only the failed continuation is retried. */
export function useOnboardingSave<TValues, TResult>({
  onSave,
  onSaved,
  failureMessage,
}: {
  onSave: (values: TValues) => Promise<TResult>
  onSaved: (result: TResult) => void | Promise<void>
  failureMessage: string
}) {
  const t = useT()
  const pendingRef = useRef(false)
  const saved = useRef<{ result: TResult } | null>(null)
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<'save' | 'continue'>()
  const error =
    failure === 'continue'
      ? t('onboarding.savedContinueFailed')
      : failure === 'save'
        ? failureMessage
        : undefined
  const [acknowledged, setAcknowledged] = useState(false)
  const setParentPending = useOnboardingPending()
  const run = async (values: TValues) => {
    if (pendingRef.current) return
    pendingRef.current = true
    setPending(true)
    setParentPending(true)
    setFailure(undefined)
    try {
      if (!saved.current) {
        saved.current = { result: await onSave(values) }
        setAcknowledged(true)
      }
      await onSaved(saved.current.result)
      saved.current = null
      setAcknowledged(false)
    } catch {
      setFailure(saved.current ? 'continue' : 'save')
    } finally {
      pendingRef.current = false
      setPending(false)
      setParentPending(false)
    }
  }
  return { run, pending, acknowledged, error }
}

/** Transition errors resolve locally; retry repeats only this transition. */
export function useOnboardingAction() {
  const t = useT()
  const lock = useRef(false)
  const retry = useRef<(() => Promise<void>) | null>(null)
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<'continue' | 'openStable'>()
  const error = failure
    ? t(
        failure === 'openStable'
          ? 'onboarding.openFailed'
          : 'onboarding.continueFailed',
      )
    : undefined
  const run = async (
    operation: () => Promise<void>,
    message: 'continue' | 'openStable' = 'continue',
  ) => {
    if (lock.current) return
    lock.current = true
    setPending(true)
    setFailure(undefined)
    retry.current = () => run(operation, message)
    try {
      await operation()
      retry.current = null
    } catch {
      setFailure(message)
    } finally {
      lock.current = false
      setPending(false)
    }
  }
  return { pending, error, run, retry: () => retry.current?.() }
}

export const OnboardingSaveError = FormSubmissionError

export function OnboardingTransitionError({
  message,
  onRetry,
  pending,
}: {
  message?: string
  onRetry?: () => void
  pending?: boolean
}) {
  const t = useT()
  return message ? (
    <>
      <FormSubmissionError message={message} />
      <DashboardActions align="start">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onRetry}
        >
          {t('onboarding.retry')}
        </Button>
      </DashboardActions>
    </>
  ) : null
}
