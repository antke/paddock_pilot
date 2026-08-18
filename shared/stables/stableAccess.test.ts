import { describe, expect, it } from 'vitest'
import {
  canCreateEventForHorseOwners,
  canManageCreatedRecord,
  canManageLinkedRecord,
  canManageOwnedRecord,
  canRemoveLinkedRecord,
  getStableCapabilities,
  isStableRole,
} from './stableAccess'

describe('stable access policy', () => {
  it('recognizes only owner and member as active roles', () => {
    expect(isStableRole('owner')).toBe(true)
    expect(isStableRole('member')).toBe(true)
    expect(isStableRole('guest')).toBe(false)
    expect(isStableRole(undefined)).toBe(false)
  })

  it('reserves stable-wide management capabilities for the owner', () => {
    expect(Object.values(getStableCapabilities('owner'))).not.toContain(false)
    expect(Object.values(getStableCapabilities('member'))).not.toContain(true)
  })

  it('lets the owner manage any owned or created record', () => {
    expect(
      canManageOwnedRecord({
        role: 'owner',
        userId: 'owner',
        ownerId: 'member',
      }),
    ).toBe(true)
    expect(
      canManageCreatedRecord({
        role: 'owner',
        userId: 'owner',
        createdBy: 'member',
      }),
    ).toBe(true)
  })

  it('limits members to records they own or created', () => {
    expect(
      canManageOwnedRecord({
        role: 'member',
        userId: 'member-a',
        ownerId: 'member-a',
      }),
    ).toBe(true)
    expect(
      canManageOwnedRecord({
        role: 'member',
        userId: 'member-a',
        ownerId: 'member-b',
      }),
    ).toBe(false)
  })

  it('requires a member-created event to include one of their horses', () => {
    expect(
      canCreateEventForHorseOwners({
        role: 'member',
        userId: 'member-a',
        horseOwnerIds: ['member-b', 'member-a'],
      }),
    ).toBe(true)
    expect(
      canCreateEventForHorseOwners({
        role: 'member',
        userId: 'member-a',
        horseOwnerIds: ['member-b'],
      }),
    ).toBe(false)
  })

  it('allows a member to manage horse- or event-scoped records', () => {
    expect(
      canManageLinkedRecord({
        role: 'member',
        userId: 'member-a',
        horseOwnerId: 'member-a',
      }),
    ).toBe(true)
    expect(
      canManageLinkedRecord({
        role: 'member',
        userId: 'member-a',
        eventCreatedBy: 'member-a',
      }),
    ).toBe(true)
    expect(
      canManageLinkedRecord({
        role: 'member',
        userId: 'member-a',
        horseOwnerId: 'member-b',
        eventCreatedBy: 'member-b',
      }),
    ).toBe(false)
  })

  it('requires members to be both the uploader and within scope to remove a linked record', () => {
    expect(
      canRemoveLinkedRecord({
        role: 'member',
        userId: 'member-a',
        createdBy: 'member-a',
        horseOwnerId: 'member-a',
      }),
    ).toBe(true)
    expect(
      canRemoveLinkedRecord({
        role: 'member',
        userId: 'member-a',
        createdBy: 'member-b',
        horseOwnerId: 'member-a',
      }),
    ).toBe(false)
  })
})
