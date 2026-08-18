import type { Doc } from 'convex/_generated/dataModel'

export type StableUserSummary = Pick<
  Doc<'users'>,
  '_id' | 'email' | 'firstName' | 'lastName' | 'preferredName' | 'photoUrl'
>

export type StableAuditEntry = {
  _id: string
  action: string
  summary?: string
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
  deletedHorses: Array<Doc<'horses'> & { purgeAt: number }>
  auditEntries: Array<StableAuditEntry>
}

export function formatStableUserName(user: StableUserSummary | null) {
  if (!user) return 'Unknown'

  return (
    user.preferredName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ')
  )
}

export function formatStableMemberName(
  member: StableSettingsData['members'][number],
) {
  return (
    member.membership?.displayNameOverride || formatStableUserName(member.user)
  )
}
