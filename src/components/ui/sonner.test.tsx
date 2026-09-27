// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { showAppErrorToast, showAppSuccessToast, Toaster } from './sonner'

vi.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light' }) }))
beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  )
})
afterEach(() => {
  act(() => {
    toast.dismiss()
  })
  cleanup()
  vi.unstubAllGlobals()
})

describe('shared toast presentation preserves vendor interactions', () => {
  it('keeps success content and a named dismiss control with its callback', async () => {
    const onDismiss = vi.fn()
    render(<Toaster />)
    act(() =>
      showAppSuccessToast({
        title: 'Care recorded',
        description: 'Juniper’s record is up to date.',
        duration: Infinity,
        onDismiss,
      }),
    )
    expect(
      await screen.findByText('Juniper’s record is up to date.'),
    ).toBeTruthy()
    expect(
      screen
        .getByText('Care recorded')
        .closest('[data-sonner-toast]')
        ?.getAttribute('data-type'),
    ).toBe('success')
    fireEvent.click(screen.getByRole('button', { name: 'Close toast' }))
    expect(onDismiss).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByText('Care recorded')).toBeNull())
  })

  it('retains the error action and invokes the caller’s retry once', async () => {
    const retry = vi.fn()
    render(<Toaster />)
    act(() =>
      showAppErrorToast({
        title: 'Could not save care',
        description: 'Your draft is still here.',
        duration: Infinity,
        action: { label: 'Try again', onClick: retry },
      }),
    )
    const action = await screen.findByRole('button', { name: 'Try again' })
    expect(
      screen
        .getByText('Could not save care')
        .closest('[data-sonner-toast]')
        ?.getAttribute('data-type'),
    ).toBe('error')
    fireEvent.click(action)
    expect(retry).toHaveBeenCalledTimes(1)
    await waitFor(() =>
      expect(screen.queryByText('Could not save care')).toBeNull(),
    )
  })
})
