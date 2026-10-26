// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useMobileViewport } from './useMobileViewport'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
it('detects the keyboard without fighting native page scrolling, ignores zoom, and cleans up', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.stubGlobal('innerHeight', 844)
  const viewport = Object.assign(new EventTarget(), {
    height: 844,
    offsetTop: 0,
    scale: 1,
  })
  vi.stubGlobal('visualViewport', viewport)
  const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
  function Form() {
    useMobileViewport()
    return (
      <form data-mobile-route-form="true">
        <input aria-label="Notes" />
        <footer data-slot="card-footer">Save</footer>
      </form>
    )
  }
  render(<Form />)
  const input = screen.getByLabelText('Notes')
  vi.spyOn(input, 'getBoundingClientRect').mockReturnValue({
    top: 600,
    bottom: 650,
    height: 50,
    left: 0,
    right: 100,
    width: 100,
    x: 0,
    y: 600,
    toJSON: () => ({}),
  })
  fireEvent.focusIn(input)
  input.focus()
  viewport.height = 500
  viewport.dispatchEvent(new Event('resize'))
  await waitFor(() =>
    expect(
      document.documentElement.style.getPropertyValue(
        '--mobile-keyboard-inset',
      ),
    ).toBe('344px'),
  )
  expect(document.documentElement.hasAttribute('data-mobile-keyboard')).toBe(
    true,
  )
  expect(scroll).not.toHaveBeenCalled()
  // Safari pans the visual viewport while moving between fields. Updating
  // geometry must not start a competing document scroll.
  viewport.offsetTop = 80
  viewport.dispatchEvent(new Event('scroll'))
  await waitFor(() =>
    expect(
      document.documentElement.style.getPropertyValue('--mobile-viewport-top'),
    ).toBe('80px'),
  )
  expect(scroll).not.toHaveBeenCalled()
  viewport.scale = 2
  viewport.dispatchEvent(new Event('resize'))
  await waitFor(() =>
    expect(document.documentElement.hasAttribute('data-mobile-keyboard')).toBe(
      false,
    ),
  )
  cleanup()
  expect(
    document.documentElement.style.getPropertyValue('--mobile-keyboard-inset'),
  ).toBe('')
})

it('sizes a mobile dialog to the visible viewport and scrolls its form instead of the page', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
  vi.stubGlobal('innerHeight', 844)
  const viewport = Object.assign(new EventTarget(), {
    height: 844,
    offsetTop: 0,
    scale: 1,
  })
  vi.stubGlobal('visualViewport', viewport)
  const pageScroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
  function DialogForm() {
    useMobileViewport()
    return (
      <div role="dialog">
        <div data-slot="record-dialog-body">
          <input aria-label="Care notes" />
          <footer data-slot="form-submit-actions">Save</footer>
        </div>
      </div>
    )
  }
  render(<DialogForm />)
  const input = screen.getByLabelText('Care notes')
  const body = input.parentElement!
  const dialogScroll = vi.fn()
  body.scrollBy = dialogScroll
  vi.spyOn(body, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 120, 390, 420),
  )
  vi.spyOn(
    body.querySelector('footer')!,
    'getBoundingClientRect',
  ).mockReturnValue(new DOMRect(0, 468, 390, 72))
  const fieldRect = vi
    .spyOn(input, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(16, 560, 358, 48))
  input.focus()
  viewport.height = 500
  viewport.offsetTop = 40
  viewport.dispatchEvent(new Event('resize'))
  await waitFor(() =>
    expect(dialogScroll).toHaveBeenCalledWith({
      top: 156,
      behavior: 'instant',
    }),
  )
  expect(pageScroll).not.toHaveBeenCalled()
  const root = document.documentElement
  expect(root.style.getPropertyValue('--mobile-viewport-height')).toBe('500px')
  expect(root.style.getPropertyValue('--mobile-viewport-top')).toBe('40px')

  fieldRect.mockReturnValue(new DOMRect(16, 80, 358, 48))
  viewport.dispatchEvent(new Event('scroll'))
  await waitFor(() =>
    expect(dialogScroll).toHaveBeenLastCalledWith({
      top: -52,
      behavior: 'instant',
    }),
  )
  expect(pageScroll).not.toHaveBeenCalled()
  dialogScroll.mockClear()
  viewport.scale = 2
  viewport.height = 250
  viewport.dispatchEvent(new Event('resize'))
  await waitFor(() =>
    expect(root.hasAttribute('data-mobile-keyboard')).toBe(false),
  )
  expect(dialogScroll).not.toHaveBeenCalled()
  expect(root.style.getPropertyValue('--mobile-viewport-height')).toBe('500px')
  cleanup()
  expect(root.style.getPropertyValue('--mobile-viewport-height')).toBe('')
  expect(root.style.getPropertyValue('--mobile-viewport-top')).toBe('')
})
