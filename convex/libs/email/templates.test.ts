import { describe, expect, it } from 'vitest'
import {
  createEventDetailsChangedEmail,
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
})
