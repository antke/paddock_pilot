import { describe, expect, it } from 'vitest'
import {
  createAccountDeletedEmail,
  createEventDetailsChangedEmail,
  createStableInvitationAcceptedEmail,
  createStableInvitationEmail,
} from './templates'

describe('email templates', () => {
  it('escapes user-controlled values in HTML while preserving readable text', () => {
    const email = createStableInvitationEmail({
      appUrl: 'https://paddock.example',
      stableName: '<Willow & Co>',
      token: 'token/with spaces',
    })

    expect(email.html).toContain('&lt;Willow &amp; Co&gt;')
    expect(email.html).not.toContain('<Willow & Co>')
    expect(email.html).toContain('token%2Fwith%20spaces')
    expect(email.text).toContain('<Willow & Co>')
  })

  it('escapes each material event change', () => {
    const email = createEventDetailsChangedEmail({
      appUrl: 'https://paddock.example',
      changes: ['Location changed to <North Yard>'],
      eventId: 'event',
      eventTitle: 'Vet & dentist',
      stableId: 'stable',
    })

    expect(email.html).toContain('Vet &amp; dentist')
    expect(email.html).toContain('&lt;North Yard&gt;')
  })

  it('sanitizes lifecycle subjects and escapes member names', () => {
    const email = createStableInvitationAcceptedEmail({
      appUrl: 'https://paddock.example',
      memberName: '<Alex>\r\nBcc: someone@example.com',
      stableId: 'stable',
      stableName: 'Willow\nYard',
    })

    expect(email.subject).not.toMatch(/[\r\n]/)
    expect(email.html).toContain('&lt;Alex&gt;')
    expect(email.html).not.toContain('<Alex>')
  })

  it('creates a plain account-deletion confirmation without an app link', () => {
    const email = createAccountDeletedEmail({ displayName: 'Alex' })

    expect(email.category).toBe('account_deleted')
    expect(email.text).toContain('has been deleted')
    expect(email.html).not.toContain('href=')
  })
})
