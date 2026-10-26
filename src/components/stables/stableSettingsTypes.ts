import { accountDisplayName } from 'shared/users/displayName'
import type { Locale } from 'shared/i18n/locale'
import { localeInstances } from '#/i18n/resources'
import type { Doc } from 'convex/_generated/dataModel'
import type { StableAuditDetails } from 'shared/auditLogs/auditDetails'

export type StableUserSummary = Pick<
  Doc<'users'>,
  '_id' | 'email' | 'firstName' | 'lastName' | 'preferredName' | 'photoUrl'
>

export type StableAuditEntry = {
  _id: string
  action: string
  summary?: string
  details?: StableAuditDetails
  createdAt: number
  actor: {
    firstName: string
    lastName?: string
    preferredName?: string
  } | null
}

export type StableSettingsData = {
  stable: Doc<'stables'>
  owner: StableUserSummary | null
  members: Array<{
    membership: Doc<'stableMembers'> | null
    user: StableUserSummary | null
    role: Doc<'stableMembers'>['role']
  }>
  invitations: Array<Doc<'stableInvitations'>>
  horses: Array<Doc<'horses'>>
  deletedHorses: Array<
    Doc<'horses'> & { purgeAt: number; canPermanentlyDelete: boolean }
  >
  auditEntries: Array<StableAuditEntry>
}

export function formatStableUserName(
  user: StableUserSummary | null,
  locale: Locale = 'en',
) {
  if (!user) return localeInstances[locale].t('stables.unknown')

  return accountDisplayName(
    user,
    localeInstances[locale].t('stables.memberFallback'),
  )
}

export function formatStableMemberName(
  member: StableSettingsData['members'][number],
  locale: Locale = 'en',
) {
  return (
    accountDisplayName(member.user) ||
    member.membership?.displayNameOverride ||
    formatStableUserName(member.user, locale)
  )
}
