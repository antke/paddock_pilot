// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  emailPreviewFixtures,
  previewAppUrl,
} from '../../../scripts/email-preview/fixtures'
import { emailCategories } from './types'
import {
  createAccountDeletedEmail,
  createEmailContent,
  createEventDetailsChangedEmail,
  createStableInvitationAcceptedEmail,
  createStableInvitationEmail,
} from './templates'

describe('email templates', () => {
  it('previews every production email category', () => {
    expect(
      new Set(emailPreviewFixtures.map(({ template }) => template.kind)),
    ).toEqual(new Set(emailCategories))
  })

  it.each(emailPreviewFixtures)(
    'renders an accessible, self-contained $id email',
    ({ template }) => {
      const email = createEmailContent(template, previewAppUrl)
      const document = new DOMParser().parseFromString(email.html, 'text/html')
      expect(email.category).toBe(template.kind)
      expect(email.subject).not.toMatch(/[\r\n]/)
      expect(email.text.length).toBeGreaterThan(20)
      expect(document.documentElement.lang).toBe('en')
      expect(document.querySelectorAll('h1')).toHaveLength(1)
      expect(
        document.querySelector('[aria-hidden="true"]')?.textContent,
      ).toBeTruthy()
      expect(
        document.querySelectorAll('script, img, link, iframe'),
      ).toHaveLength(0)
      for (const table of Array.from(document.querySelectorAll('table'))) {
        expect(table.getAttribute('role')).toBe('presentation')
      }
      const links = Array.from(document.querySelectorAll('a'))
      const informational = [
        'stable_membership_removed',
        'stable_archived',
        'account_deleted',
      ].includes(template.kind)
      expect(links).toHaveLength(informational ? 0 : 2)
      for (const link of links) {
        expect(link.href.startsWith(`${previewAppUrl}/`)).toBe(true)
        expect(email.text).toContain(link.href)
      }
      // Action and copyable fallback must always lead to the same destination.
      expect(new Set(links.map((link) => link.href)).size).toBe(
        informational ? 0 : 1,
      )
    },
  )

  it('keeps untrusted names inert in preheaders, paragraphs, and lists', () => {
    const malicious = '<img src=x onerror="alert(1)"> & \'Łąki\''
    for (const { template } of emailPreviewFixtures) {
      const poisoned = Object.fromEntries(
        Object.entries(template).map(([key, value]) => [
          key,
          [
            'stableName',
            'eventTitle',
            'actorName',
            'horseName',
            'memberName',
            'displayName',
          ].includes(key)
            ? malicious
            : ['horseNames', 'changes'].includes(key)
              ? [malicious]
              : value,
        ]),
      ) as typeof template
      const email = createEmailContent(poisoned, previewAppUrl)
      const document = new DOMParser().parseFromString(email.html, 'text/html')
      expect(document.querySelectorAll('img, [onerror]')).toHaveLength(0)
      expect(document.body.textContent).toContain(malicious)
      expect(email.text).toContain(malicious)
    }
  })

  it('escapes action URLs without altering their actual destination', () => {
    const email = createStableInvitationEmail({
      appUrl: 'https://paddock.example/"quoted"',
      stableName: 'Willow',
      token: 'token',
    })
    const document = new DOMParser().parseFromString(email.html, 'text/html')
    expect(document.querySelector('a')?.getAttribute('href')).toBe(
      'https://paddock.example/"quoted"/invitations/token',
    )
    expect(email.html).toContain('&quot;quoted&quot;')
  })

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
