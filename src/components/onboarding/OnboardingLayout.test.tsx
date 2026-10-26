// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { OnboardingLayout } from './OnboardingLayout'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('focuses the new form and scrolls its top navigation into view only when the step changes', () => {
  const scroll = vi.fn()
  const props = {
    pageTitle: 'Set up your stable',
    pageDescription: 'Stable setup',
    title: 'About you',
    description: 'Your profile',
    children: <input aria-label="Name" />,
    steps: [
      { id: 'profile', label: 'About you', status: 'current' as const },
      { id: 'stable', label: 'Stable', status: 'upcoming' as const },
    ],
  }
  const { container, rerender, getByRole } = render(
    <OnboardingLayout {...props} />,
  )
  const progress = container.querySelector<HTMLElement>(
    '[data-slot="onboarding-layout"]',
  )!
  progress.scrollIntoView = scroll
  rerender(<OnboardingLayout {...props} pending />)
  expect(scroll).not.toHaveBeenCalled()
  rerender(
    <OnboardingLayout
      {...props}
      title="Stable details"
      steps={[
        { id: 'profile', label: 'About you', status: 'completed' },
        { id: 'stable', label: 'Stable', status: 'current' },
      ]}
    />,
  )
  expect(scroll).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' })
  expect(document.activeElement).toBe(
    getByRole('region', { name: 'Stable details' }),
  )
})
