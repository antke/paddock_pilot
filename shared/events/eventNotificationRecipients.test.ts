import { describe, expect, it } from 'vitest'
import { getEventChangeNotificationOwnerIds } from './eventNotificationRecipients'

describe('event change notification recipients', () => {
  it('excludes the actor, duplicate owners, and owners receiving invitations', () => {
    expect(
      getEventChangeNotificationOwnerIds({
        actorUserId: 'creator',
        horseOwnerIds: ['creator', 'existing', 'invited', 'existing'],
        excludedOwnerIds: new Set(['invited']),
      }),
    ).toEqual(['existing'])
  })
})
