// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  emailPreviewFixtures,
  previewAppUrl,
} from '../../../scripts/email-preview/fixtures'
import { createEmailContent, createEventDetailsChangedEmail } from './templates'
import { emailEN } from '../../../shared/i18n/email.en'
import { emailPL } from '../../../shared/i18n/email.pl'

describe('Polish email content', () => {
  it.each(emailPreviewFixtures)(
    'renders $id with Polish layout and intact destinations',
    ({ template }) => {
      const en = createEmailContent(template, previewAppUrl, 'en')
      const pl = createEmailContent(template, previewAppUrl, 'pl')
      const document = new DOMParser().parseFromString(pl.html, 'text/html')
      const english = new DOMParser().parseFromString(en.html, 'text/html')
      expect(document.documentElement.lang).toBe('pl')
      expect(document.querySelectorAll('h1')).toHaveLength(1)
      expect(pl.subject).not.toBe(en.subject)
      expect(pl.subject).not.toMatch(/[\r\n]/)
      expect(document.body.textContent).toContain(
        'Dobra opieka to wspólny wysiłek.',
      )
      expect(pl.html).not.toMatch(
        /If the button|An account or stable update|Review the event|{{|undefined/,
      )
      const destinations = (doc: Document) =>
        Array.from(doc.querySelectorAll('a')).map((link) => link.href)
      expect(destinations(document)).toEqual(destinations(english))
      for (const url of destinations(document)) expect(pl.text).toContain(url)
      expect(document.querySelectorAll('script,img,[onerror]')).toHaveLength(0)
    },
  )
  it('has matching typed copy and preserves untrusted text as inert text', () => {
    expect(Object.keys(emailPL).sort()).toEqual(Object.keys(emailEN).sort())
    const malicious = '<img src=x onerror=alert(1)> & Łąki'
    const result = createEmailContent(
      { kind: 'account_deleted', displayName: malicious },
      previewAppUrl,
      'pl',
    )
    const document = new DOMParser().parseFromString(result.html, 'text/html')
    expect(document.querySelectorAll('img,[onerror]')).toHaveLength(0)
    expect(document.body.textContent).toContain(malicious)
    expect(result.text).toContain(malicious)
  })
  it('renders codes in both languages and retains older free-form change text', () => {
    const input = {
      appUrl: previewAppUrl,
      eventId: 'event',
      stableId: 'stable',
      eventTitle: 'Wizyta',
      changes: ['time', 'Location changed', 'Legacy detail <North>'],
    }
    const polish = createEventDetailsChangedEmail({ ...input, locale: 'pl' })
    expect(polish.text).toContain(
      'Zmieniono godzinę wydarzenia; Zmieniono miejsce; Legacy detail <North>',
    )
    expect(polish.html).toContain('Legacy detail &lt;North&gt;')
    const legacy = createEventDetailsChangedEmail(input)
    expect(legacy.html).toContain('<html lang="en">')
    expect(legacy.text).toContain(
      'Event time changed; Location changed; Legacy detail <North>',
    )
  })
})
