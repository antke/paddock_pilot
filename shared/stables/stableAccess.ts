export const stableRoles = ['owner', 'member'] as const

export type StableRole = (typeof stableRoles)[number]

export type StableCapabilities = {
  canManageStable: boolean
  canManageMembers: boolean
  canManageProviders: boolean
  canManageStableReminders: boolean
  canManageStableDocuments: boolean
  canExportStableData: boolean
  canPermanentlyDeleteHorses: boolean
}

export const isStableRole = (value: unknown): value is StableRole =>
  stableRoles.includes(value as StableRole)

export const getStableCapabilities = (role: StableRole): StableCapabilities => {
  const isOwner = role === 'owner'

  return {
    canManageStable: isOwner,
    canManageMembers: isOwner,
    canManageProviders: isOwner,
    canManageStableReminders: isOwner,
    canManageStableDocuments: isOwner,
    canExportStableData: isOwner,
    canPermanentlyDeleteHorses: isOwner,
  }
}

export const canManageOwnedRecord = ({
  role,
  userId,
  ownerId,
}: {
  role: StableRole
  userId: string
  ownerId: string
}) => role === 'owner' || userId === ownerId

export const canManageCreatedRecord = ({
  role,
  userId,
  createdBy,
}: {
  role: StableRole
  userId: string
  createdBy: string
}) => role === 'owner' || userId === createdBy

export const canCreateEventForHorseOwners = ({
  role,
  userId,
  horseOwnerIds,
}: {
  role: StableRole
  userId: string
  horseOwnerIds: Array<string>
}) => role === 'owner' || horseOwnerIds.some((ownerId) => ownerId === userId)

export const canManageLinkedRecord = ({
  role,
  userId,
  horseOwnerId,
  eventCreatedBy,
}: {
  role: StableRole
  userId: string
  horseOwnerId?: string
  eventCreatedBy?: string
}) => role === 'owner' || horseOwnerId === userId || eventCreatedBy === userId

export const canRemoveLinkedRecord = ({
  role,
  userId,
  createdBy,
  horseOwnerId,
  eventCreatedBy,
}: {
  role: StableRole
  userId: string
  createdBy: string
  horseOwnerId?: string
  eventCreatedBy?: string
}) =>
  role === 'owner' ||
  (createdBy === userId &&
    canManageLinkedRecord({ role, userId, horseOwnerId, eventCreatedBy }))
