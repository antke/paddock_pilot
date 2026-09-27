// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FormSubmissionError } from './FormSubmissionError'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('submission failure recovery', () => {
  it('reveals a failure immediately without stealing focus on ordinary rerenders, and reveals repeated failures', () => {
    const scroll = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scroll,
    })
    const ui = (message?: string) => (
      <>
        <input aria-label="Draft" />
        <FormSubmissionError message={message} />
        <button>Retry</button>
      </>
    )
    const { rerender } = render(ui())
    rerender(ui('Could not save. Please try again.'))
    expect(document.activeElement).toBe(screen.getByRole('alert'))
    expect(scroll).toHaveBeenLastCalledWith({
      behavior: 'instant',
      block: 'nearest',
      inline: 'nearest',
    })
    screen.getByLabelText('Draft').focus()
    rerender(ui('Could not save. Please try again.'))
    expect(document.activeElement).toBe(screen.getByLabelText('Draft'))
    expect(scroll).toHaveBeenCalledTimes(1)
    rerender(ui())
    rerender(ui('Could not save. Please try again.'))
    expect(document.activeElement).toBe(screen.getByRole('alert'))
    expect(scroll).toHaveBeenCalledTimes(2)
  })

  it('does not schedule focus after the request owner unmounts', async () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    let reject!: () => void
    const request = new Promise<void>((_, fail) => {
      reject = () => fail(new Error('offline'))
    })
    function Owner() {
      const [message, setMessage] = useState<string>()
      return (
        <>
          <button
            onClick={async () => {
              try {
                await request
              } catch {
                setMessage('Failed')
              }
            }}
          >
            Save
          </button>
          <FormSubmissionError message={message} />
        </>
      )
    }
    const { unmount } = render(<Owner />)
    fireEvent.click(screen.getByRole('button'))
    unmount()
    await act(async () => reject())
    expect(focus).not.toHaveBeenCalled()
  })
})
