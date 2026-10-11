// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ContactLink, contactHref } from './contact-link'

describe('shared contact actions', () => {
  it('normalizes international phone numbers without losing the readable value', () => {
    render(<ContactLink kind="phone" value="+48 (123) 456-789" />)
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      'tel:+48123456789',
    )
    expect(screen.getByRole('link').textContent).toBe('+48 (123) 456-789')
  })
  it('rejects executable URLs, mail headers, multiple recipients and unusable numbers', () => {
    for (const value of ['javascript:alert(1)', '1', 'tel:+48123456789'])
      expect(contactHref('phone', value)).toBeUndefined()
    for (const value of [
      'a@example.com?subject=hello',
      'a@example.com%0acc:x@example.com',
      'a@example.com,b@example.com',
      'a@example.com\ncc:x@example.com',
    ])
      expect(contactHref('email', value)).toBeUndefined()
    expect(contactHref('email', ' vet@example.com ')).toBe(
      'mailto:vet@example.com',
    )
  })
})
