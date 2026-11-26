// @vitest-environment jsdom
import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OfflineNotice } from './OfflineNotice'

const state = vi.hoisted(() => ({
  connection: { hasEverConnected: true, isWebSocketConnected: false },
  show: vi.fn(),
  dismiss: vi.fn(),
}))

vi.mock('convex/react', () => ({
  useConvexConnectionState: () => state.connection,
}))
vi.mock('#/components/ui/sonner', () => ({
  showAppWarningToast: state.show,
  dismissAppToast: state.dismiss,
}))

afterEach(() => {
  vi.useRealTimers()
  state.show.mockReset()
  state.dismiss.mockReset()
})

describe('OfflineNotice', () => {
  it('waits out short drops, then stays until the connection returns', () => {
    vi.useFakeTimers()
    state.connection = { hasEverConnected: true, isWebSocketConnected: false }
    const view = render(<OfflineNotice />)
    act(() => vi.advanceTimersByTime(2000))
    expect(state.show).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1000))
    expect(state.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'You’re offline',
        description: 'Changes will save when you reconnect.',
      }),
    )

    state.connection = { hasEverConnected: true, isWebSocketConnected: true }
    view.rerender(<OfflineNotice />)
    expect(state.dismiss).toHaveBeenCalledWith('offline-notice')
  })

  it('stays quiet before the first connection', () => {
    vi.useFakeTimers()
    state.connection = { hasEverConnected: false, isWebSocketConnected: false }
    render(<OfflineNotice />)
    act(() => vi.advanceTimersByTime(5000))
    expect(state.show).not.toHaveBeenCalled()
  })
})
