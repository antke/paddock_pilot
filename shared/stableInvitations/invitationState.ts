export type StableInvitationStatus =
  | 'pending'
  | 'accepted_pending_subscription'
  | 'accepted'
  | 'declined'
  | 'revoked'
  | 'expired'

/** The server refuses a resend sooner than this after the last email. */
export const INVITATION_RESEND_COOLDOWN_MS = 60 * 1000

export const getEffectiveInvitationStatus = ({
  status,
  expiresAt,
  now = Date.now(),
}: {
  status: StableInvitationStatus
  expiresAt: number
  now?: number
}): StableInvitationStatus =>
  status === 'pending' && expiresAt < now ? 'expired' : status

export const maskInvitationEmail = (email: string) => {
  const [localPart = '', domain = ''] = email.split('@')
  const visibleLocal = localPart.slice(0, Math.min(2, localPart.length))
  const hiddenCharacterCount = Math.max(
    2,
    localPart.length - visibleLocal.length,
  )

  return `${visibleLocal}${'•'.repeat(hiddenCharacterCount)}@${domain}`
}

export const getInvitationPath = (token: string) =>
  `/invitations/${encodeURIComponent(token)}`

export const getInvitationUrl = (origin: string, token: string) =>
  `${origin.replace(/\/$/, '')}${getInvitationPath(token)}`
