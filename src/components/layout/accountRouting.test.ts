import { describe, expect, it } from 'vitest'
import {
  getOnboardingRedirect,
  isInvitationExemptPath,
  onboardingReturnTo,
} from './accountRouting'

const route = (pathname: string, overrides = {}) =>
  getOnboardingRedirect({
    pathname,
    href: pathname,
    profileComplete: true,
    stableCount: 0,
    ...overrides,
  })

describe('account entry destinations', () => {
  it.each(['/', '/horses', '/stables'])(
    'asks a new account how to start at %s',
    (path) => {
      expect(route(path, { profileComplete: false })).toEqual({
        returnTo: undefined,
      })
    },
  )
  it.each([
    '/',
    '/horses',
    '/horses/create',
    '/horses/horse-1',
    '/horses/horse-1/edit',
    '/horses/contacts',
    '/horses/deleted',
    '/events',
    '/events/create',
    '/profile',
    '/stables',
    '/stables/create',
  ])('allows a completed personal account with no stable at %s', (path) => {
    expect(route(path)).toBeUndefined()
  })
  it('retains the requested record, search and hash across first-profile setup', () => {
    expect(
      route('/horses/horse-1/training', {
        profileComplete: false,
        href: '/horses/horse-1/training?view=list#recent',
      }),
    ).toEqual({ returnTo: '/horses/horse-1/training?view=list#recent' })
  })
  it.each(['/invitations/token', '/horse-invitations/token'])(
    'never diverts an explicit invitation link at %s',
    (path) => {
      expect(isInvitationExemptPath(path)).toBe(true)
      expect(route(path, { profileComplete: false })).toBeUndefined()
    },
  )
  it.each([
    '/',
    '/stables',
    '/stables/unfinished',
    '/stables/unfinished/events',
  ])('resumes an unfinished stable at %s', (path) => {
    expect(route(path, { stableCount: 2, nextStableId: 'unfinished' })).toEqual(
      { stableId: 'unfinished' },
    )
  })
  it.each([
    '/horses',
    '/horses/create',
    '/events',
    '/profile',
    '/stables/ready',
    '/stables/create',
  ])('does not let another stable setup hijack %s', (path) => {
    expect(
      route(path, { stableCount: 2, nextStableId: 'unfinished' }),
    ).toBeUndefined()
  })
  it.each([
    '/pricing',
    '/sign-in',
    '/sign-up',
    '/profile',
    '/onboarding',
    '/stables/create',
  ])('keeps account recovery and deliberate setup reachable at %s', (path) => {
    expect(route(path, { profileComplete: false })).toBeUndefined()
  })
  it.each([
    undefined,
    '',
    'https://example.com',
    '//example.com',
    '/\\example.com',
    '/onboarding',
    '/sign-in',
    '/horses/../sign-in',
    '/horses/%2e%2e/onboarding',
    '/horses-other',
    '/horses\n/create',
    'javascript:alert(1)',
  ])('rejects unsafe or looping return destination %s', (value) => {
    expect(onboardingReturnTo(value)).toBeUndefined()
  })
})
