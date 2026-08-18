import { describe, expect, it } from 'vitest'
import {
  getEffectiveInvitationStatus,
  getInvitationPath,
  getInvitationUrl,
  maskInvitationEmail,
} from './invitationState'

describe('stable invitation state', () => {
  it('treats an elapsed pending invitation as expired', () => {
    expect(
      getEffectiveInvitationStatus({
        status: 'pending',
        expiresAt: 999,
        now: 1000,
      }),
    ).toBe('expired')
  })

  it('does not alter terminal invitation states', () => {
    expect(
      getEffectiveInvitationStatus({
        status: 'accepted',
        expiresAt: 999,
        now: 1000,
      }),
    ).toBe('accepted')
  })

  it('masks the invited email while leaving a recognizable hint', () => {
    expect(maskInvitationEmail('alex@example.com')).toBe('al••@example.com')
    expect(maskInvitationEmail('a@example.com')).toBe('a••@example.com')
  })

  it('builds invitation paths and absolute URLs safely', () => {
    expect(getInvitationPath('token/value')).toBe('/invitations/token%2Fvalue')
    expect(getInvitationUrl('https://app.example.com/', 'abc')).toBe(
      'https://app.example.com/invitations/abc',
    )
  })
})
