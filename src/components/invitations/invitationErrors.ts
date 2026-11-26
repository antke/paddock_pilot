import { useT } from '#/i18n/LocaleProvider'
import { useActionErrorText } from '#/lib/actionError'

// shortcut: matches the server's English ConvexError text; switch to codes when convex/stableInvitations.ts sends them.
const knownCauses = [
  [/wait a minute/i, 'invitationFlow.errorTooSoon'],
  [/resend limit/i, 'invitationFlow.errorResendLimit'],
  [/too many invitations/i, 'invitationFlow.errorTooMany'],
  [/already has access/i, 'invitationFlow.errorHasAccess'],
  [/already a pending invitation/i, 'invitationFlow.errorAlreadyInvited'],
  [/has expired/i, 'invitationFlow.errorExpired'],
  [/sign in with the invited email/i, 'invitationFlow.errorWrongEmail'],
] as const

/** Why an invitation action failed: the server's known rule, else the general cause. */
export function useInvitationErrorText() {
  const t = useT()
  const describe = useActionErrorText()
  return (error: unknown) => {
    const data =
      error && typeof error === 'object' && 'data' in error
        ? error.data
        : undefined
    const known =
      typeof data === 'string' &&
      knownCauses.find(([pattern]) => pattern.test(data))
    return known ? t(known[1]) : describe(error)
  }
}
