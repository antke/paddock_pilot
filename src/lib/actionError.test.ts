// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { ConvexError } from 'convex/values'
import { getActionErrorCause, useActionErrorText } from './actionError'

const posthog = vi.hoisted(() => ({ __loaded: true, captureException: vi.fn() }))
vi.mock('posthog-js', () => ({ default: posthog }))

afterEach(() => vi.unstubAllGlobals())

describe('getActionErrorCause', () => {
  it.each([
    ['Horse not found', 'stale'],
    ['Invitation is no longer pending', 'stale'],
    ['Horse did not participate in this event', 'stale'],
    ['Not authorized to update this event', 'noAccess'],
    ['You cannot remove this participant', 'noAccess'],
    ['You are not a member of this stable', 'noAccess'],
    ['User not authenticated', 'signedOut'],
    ['This account has been deleted', 'signedOut'],
    ['Use a valid calendar date', 'invalid'],
    ['Stable owner cannot be removed', 'blocked'],
  ])('reads %j as %s', (message, cause) => {
    expect(getActionErrorCause(new ConvexError(message))).toEqual({ cause })
  })

  it('keeps known server rules as their own code', () => {
    expect(
      getActionErrorCause(
        new ConvexError({ code: 'eventClosed', message: 'closed' }),
      ),
    ).toEqual({ code: 'eventClosed' })
  })

  it('reports offline before reading the message', () => {
    vi.stubGlobal('navigator', { onLine: false })
    expect(getActionErrorCause(new ConvexError('Horse not found'))).toEqual({
      cause: 'offline',
    })
  })

  it('treats transport failures as offline and anything else as ours', () => {
    expect(getActionErrorCause(new TypeError('Failed to fetch'))).toEqual({
      cause: 'offline',
    })
    expect(getActionErrorCause(new Error('Server Error'))).toEqual({
      cause: 'unknown',
    })
    expect(getActionErrorCause(undefined)).toEqual({ cause: 'unknown' })
  })
})

describe('useActionErrorText', () => {
  it('reports each unexplained failure once, and skips the ones it can explain', () => {
    const { result } = renderHook(() => useActionErrorText())
    const refused = new ConvexError('Stable owner cannot be removed')
    expect(result.current(refused)).toBe(
      'This isn’t allowed here, so nothing changed. Ask a stable admin if it looks wrong.',
    )
    result.current(refused)
    result.current(new ConvexError('Horse not found'))
    expect(posthog.captureException).toHaveBeenCalledTimes(1)
    expect(posthog.captureException).toHaveBeenCalledWith(refused, {
      actionErrorCause: 'blocked',
    })
  })
})
