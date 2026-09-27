// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ThemeToggle from './ThemeToggle'
import { LandingLabThemeBoundary } from './landing-lab/LandingLabThemeBoundary'

let systemDark = false
let listeners: Set<() => void>
const root = document.documentElement
beforeEach(() => {
  localStorage.clear()
  systemDark = false
  listeners = new Set()
  root.className = 'app-document'
  root.removeAttribute('data-theme')
  root.style.colorScheme = ''
  vi.stubGlobal('matchMedia', () => ({
    matches: systemDark,
    addEventListener: (_: string, callback: () => void) =>
      listeners.add(callback),
    removeEventListener: (_: string, callback: () => void) =>
      listeners.delete(callback),
  }))
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  localStorage.clear()
})
function expectTheme(mode: 'light' | 'dark') {
  expect(root.classList.contains(mode)).toBe(true)
  expect(root.classList.contains(mode === 'light' ? 'dark' : 'light')).toBe(
    false,
  )
  expect(root.classList.contains('app-document')).toBe(true)
  expect(root.style.colorScheme).toBe(mode)
}
function changeSystem(dark: boolean) {
  act(() => {
    systemDark = dark
    listeners.forEach((callback) => callback())
  })
}

describe('application theme preference lifecycle', () => {
  it.each(['light', 'dark', 'auto'] as const)(
    'initializes %s and follows system only in automatic mode',
    (mode) => {
      localStorage.setItem('theme', mode)
      render(
        <StrictMode>
          <ThemeToggle />
        </StrictMode>,
      )
      expect(screen.getByRole('button').getAttribute('aria-label')).toContain(
        mode,
      )
      expectTheme(mode === 'dark' ? 'dark' : 'light')
      changeSystem(true)
      expectTheme(mode === 'light' ? 'light' : 'dark')
      expect(listeners.size).toBe(mode === 'auto' ? 1 : 0)
      cleanup()
      expect(listeners.size).toBe(0)
    },
  )
  it.each([null, 'not-a-theme'])(
    'uses the approved light default for %s',
    (value) => {
      if (value) localStorage.setItem('theme', value)
      render(<ThemeToggle />)
      expectTheme('light')
    },
  )
  it('keeps the existing document usable when storage cannot be read', () => {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage denied')
    })
    render(<ThemeToggle />)
    expectTheme('dark')
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button').getAttribute('aria-label')).toContain(
      'auto',
    )
    expectTheme('light')
  })
  it('cycles immediately despite a rejected write and retains that preference through remount', () => {
    localStorage.setItem('theme', 'light')
    const persist = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('Quota denied')
      })
    const view = render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expectTheme('dark')
    view.unmount()
    const capture = render(
      <LandingLabThemeBoundary theme="light">
        <main>Sample capture</main>
      </LandingLabThemeBoundary>,
    )
    expectTheme('light')
    capture.unmount()
    expectTheme('dark')
    render(<ThemeToggle />)
    expectTheme('dark')
    expect(screen.getByRole('button').getAttribute('aria-label')).toContain(
      'dark',
    )
    persist.mockRestore()
    fireEvent.click(screen.getByRole('button'))
    expect(localStorage.getItem('theme')).toBe('auto')
    expectTheme('light')
  })
  it('keeps rapid repeated changes in order and removes system listeners after leaving auto', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    act(() => {
      fireEvent.click(button)
      fireEvent.click(button)
    })
    expect(localStorage.getItem('theme')).toBe('auto')
    expect(listeners.size).toBe(1)
    fireEvent.click(button)
    expectTheme('light')
    expect(listeners.size).toBe(0)
  })
  it('keeps both header controls in the same document synchronized', () => {
    render(
      <>
        <ThemeToggle />
        <ThemeToggle />
      </>,
    )
    const [first, second] = screen.getAllByRole('button')
    fireEvent.click(first)
    expect(first.getAttribute('aria-label')).toContain('dark')
    expect(second.getAttribute('aria-label')).toContain('dark')
    fireEvent.click(second)
    expect(first.getAttribute('aria-label')).toContain('auto')
    expect(second.getAttribute('aria-label')).toContain('auto')
    changeSystem(true)
    expectTheme('dark')
    fireEvent.click(first)
    expect(second.getAttribute('aria-label')).toContain('light')
    expectTheme('light')
  })
  it('adopts another tab preference and ignores unrelated or session-storage events', () => {
    render(<ThemeToggle />)
    act(() =>
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'theme',
          newValue: 'dark',
          storageArea: localStorage,
        }),
      ),
    )
    expectTheme('dark')
    act(() =>
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'theme',
          newValue: 'light',
          storageArea: sessionStorage,
        }),
      ),
    )
    expectTheme('dark')
    act(() =>
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: null,
          newValue: null,
          storageArea: localStorage,
        }),
      ),
    )
    expectTheme('light')
  })
})
