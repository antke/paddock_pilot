// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { StrictMode, lazy } from 'react'
import type { ComponentProps, ComponentType } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LandingLabCapture, LandingLabReview } from './LandingLabPage'
import { LandingLabPageFrame } from './LandingLabPrimitives'
import type { LandingLabVariantProps } from './LandingLabPrimitives'

const registry = vi.hoisted(() => ({
  component: null as ComponentType<LandingLabVariantProps> | null,
}))
vi.mock('./landingLabVariants', () => ({
  getLandingLabVariant: () => ({
    label: 'Sample concept',
    component: registry.component,
  }),
  landingLabVariants: [],
}))
vi.mock('./LandingLabChrome', () => ({
  LandingLabChrome: () => <header>Review controls</header>,
}))
vi.mock('#/components/ui/button', () => ({
  ButtonLink: ({
    to,
    size,
    variant,
    ...props
  }: ComponentProps<'a'> & { to: string; size?: string; variant?: string }) => {
    void size
    void variant
    return <a href={to} {...props} />
  },
}))

let systemDark = true
const root = document.documentElement
function appTheme(mode: 'light' | 'dark' | 'auto') {
  localStorage.setItem('theme', mode)
  root.className = `existing-app-class ${mode === 'auto' ? (systemDark ? 'dark' : 'light') : mode}`
  if (mode === 'auto') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', mode)
  root.style.colorScheme =
    mode === 'auto' ? (systemDark ? 'dark' : 'light') : mode
}
function expectTheme(theme: 'light' | 'dark') {
  expect(root.classList.contains(theme)).toBe(true)
  expect(root.classList.contains(theme === 'light' ? 'dark' : 'light')).toBe(
    false,
  )
  expect(root.style.colorScheme).toBe(theme)
  expect(root.classList.contains('existing-app-class')).toBe(true)
}
beforeEach(() => {
  systemDark = true
  vi.stubGlobal('matchMedia', () => ({ matches: systemDark }))
  registry.component = ({ theme }) => (
    <LandingLabPageFrame theme={theme}>
      <main>Loaded concept</main>
    </LandingLabPageFrame>
  )
})
afterEach(() => {
  cleanup()
  localStorage.clear()
  root.className = ''
  root.removeAttribute('data-theme')
  root.style.colorScheme = ''
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('landing capture document theme isolation', () => {
  it('applies explicit light before lazy loading, keeps it through a nested frame, and restores dark on exit', async () => {
    appTheme('dark')
    const persist = vi.spyOn(Storage.prototype, 'setItem')
    let load!: (value: {
      default: ComponentType<LandingLabVariantProps>
    }) => void
    registry.component = lazy<ComponentType<LandingLabVariantProps>>(
      () =>
        new Promise((resolve) => {
          load = resolve
        }),
    )
    const view = render(
      <StrictMode>
        <LandingLabCapture theme="light" variantId="gathered-yard" />
      </StrictMode>,
    )
    expect(screen.getByText('Loading Sample concept…')).toBeTruthy()
    expectTheme('light')
    expect(root.getAttribute('data-theme')).toBe('light')
    await act(async () => {
      load({
        default: ({ theme }) => (
          <LandingLabPageFrame theme={theme}>
            <main>Loaded concept</main>
          </LandingLabPageFrame>
        ),
      })
    })
    expect(screen.getByText('Loaded concept')).toBeTruthy()
    expectTheme('light')
    view.unmount()
    expectTheme('dark')
    expect(root.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(persist).not.toHaveBeenCalled()
  })
  it('switches capture light/dark without altering the application preference', () => {
    appTheme('light')
    const view = render(
      <LandingLabCapture theme="dark" variantId="gathered-yard" />,
    )
    expectTheme('dark')
    view.rerender(<LandingLabCapture theme="light" variantId="gathered-yard" />)
    expectTheme('light')
    view.rerender(<LandingLabCapture theme="dark" variantId="gathered-yard" />)
    expectTheme('dark')
    view.unmount()
    expectTheme('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })
  it('restores automatic preference against the current system and preserves later app preference changes', () => {
    appTheme('auto')
    const view = render(
      <LandingLabCapture theme="light" variantId="gathered-yard" />,
    )
    expectTheme('light')
    systemDark = false
    view.unmount()
    expectTheme('light')
    expect(root.hasAttribute('data-theme')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('auto')
    const second = render(
      <LandingLabCapture theme="dark" variantId="gathered-yard" />,
    )
    localStorage.setItem('theme', 'light')
    second.unmount()
    expectTheme('light')
    expect(root.getAttribute('data-theme')).toBe('light')
  })
  it('isolates standalone frames, and an iframe review leaves the parent document preference alone', () => {
    appTheme('dark')
    const standalone = render(
      <LandingLabPageFrame theme="light">
        <main>Standalone concept</main>
      </LandingLabPageFrame>,
    )
    expectTheme('light')
    standalone.unmount()
    expectTheme('dark')
    const review = render(
      <LandingLabReview
        theme="light"
        variantId="gathered-yard"
        viewport="390"
      />,
    )
    expectTheme('dark')
    const frame = screen.getByTitle('Sample concept responsive preview')
    expect(frame.getAttribute('src')).toContain('theme=light')
    expect(frame.getAttribute('src')).toContain('mode=capture')
    review.unmount()
    expectTheme('dark')
  })
  it('restores the existing document state when embedded storage access is denied', () => {
    appTheme('dark')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage denied')
    })
    const view = render(
      <LandingLabCapture theme="light" variantId="gathered-yard" />,
    )
    expectTheme('light')
    view.unmount()
    expectTheme('dark')
    expect(root.getAttribute('data-theme')).toBe('dark')
  })
})
