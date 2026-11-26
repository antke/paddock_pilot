import posthog from 'posthog-js'
import { getUserFacingErrorCode } from 'shared/i18n/errors'
import type { UserFacingErrorCode } from 'shared/i18n/errors'
import { useT } from '#/i18n/LocaleProvider'

export type ActionErrorCause =
  | 'offline'
  | 'signedOut'
  | 'noAccess'
  | 'stale'
  | 'invalid'
  | 'blocked'
  | 'unknown'

/** Sorts a failed action into a cause the person can act on. */
export function getActionErrorCause(
  error: unknown,
): { code: UserFacingErrorCode } | { cause: ActionErrorCause } {
  const code = getUserFacingErrorCode(error)
  if (code) return { code }
  if (typeof navigator !== 'undefined' && navigator.onLine === false)
    return { cause: 'offline' }
  const data =
    error && typeof error === 'object' && 'data' in error
      ? error.data
      : undefined
  // shortcut: reads the server's English messages; switch to structured codes when the server sends them for these causes.
  const text =
    typeof data === 'string'
      ? data
      : data && typeof data === 'object' && 'message' in data
        ? String(data.message)
        : undefined
  if (text === undefined) {
    const message = error instanceof Error ? error.message : ''
    return {
      cause: /network|fetch|connection|offline|websocket/i.test(message)
        ? 'offline'
        : 'unknown',
    }
  }
  if (/not authenticated|account has been deleted|^user not found/i.test(text))
    return { cause: 'signedOut' }
  if (
    /not authori[sz]ed|^you cannot|^you are not|not a member|^only |permission/i.test(
      text,
    )
  )
    return { cause: 'noAccess' }
  if (
    /not found|no longer|not pending|already|does not belong|did not participate|not available/i.test(
      text,
    )
  )
    return { cause: 'stale' }
  if (
    /^(use|select|choose|enter|write|add) |invalid|too (long|short|many)/i.test(
      text,
    )
  )
    return { cause: 'invalid' }
  // Every deliberate server refusal is a ConvexError; crashes arrive as a plain "Server Error".
  return { cause: 'blocked' }
}

const reported = new WeakSet<object>()

/** Sends failures we can't explain to PostHog once, so crashes and unmatched server text get noticed. */
function reportUnexplained(error: unknown, cause: ActionErrorCause) {
  if (cause !== 'blocked' && cause !== 'unknown') return
  if (!error || typeof error !== 'object' || reported.has(error)) return
  reported.add(error)
  if (posthog.__loaded)
    posthog.captureException(error, { actionErrorCause: cause })
}

/** Returns the "why + what to do" sentence for a failed action. */
export function useActionErrorText() {
  const t = useT()
  return (error: unknown) => {
    const result = getActionErrorCause(error)
    if ('code' in result) return t(`serverErrors.${result.code}`)
    reportUnexplained(error, result.cause)
    return t(`actionErrors.${result.cause}`)
  }
}
