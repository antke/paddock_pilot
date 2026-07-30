import { describe, expect, it } from 'vitest'
import { isDevFixtureRoute } from './devAuthBypass'

describe('isDevFixtureRoute', () => {
  it.each([
    '/style-lab',
    '/dashboard-lab',
    '/dashboard-lab/1',
    '/page-lab',
    '/page-lab/event-detail',
  ])('allows fixture data on %s', (pathname) => {
    expect(isDevFixtureRoute(pathname)).toBe(true)
  })

  it.each([
    '/',
    '/stables',
    '/stables/lab-stable-field-office',
    '/invitations/example',
  ])('keeps fixture data out of the live route %s', (pathname) => {
    expect(isDevFixtureRoute(pathname)).toBe(false)
  })
})
