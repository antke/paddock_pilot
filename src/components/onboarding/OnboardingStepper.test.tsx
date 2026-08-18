// @vitest-environment jsdom

import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OnboardingStepper } from './OnboardingStepper'

afterEach(cleanup)

describe('OnboardingStepper', () => {
  it('uses the highlighted treatment without a current-step badge', () => {
    const { container } = render(
      <OnboardingStepper
        steps={[
          { id: 'profile', label: 'About you', status: 'completed' },
          { id: 'stable', label: 'Stable', status: 'current' },
          { id: 'horse', label: 'First horse', status: 'upcoming' },
        ]}
      />,
    )

    const currentStep = container.querySelector('[data-status="current"]')
    expect(currentStep?.textContent).toBe('02Stable')
    expect(container.textContent).not.toContain('Current step')
  })

  it('replaces the completed step number with a checkmark', () => {
    const { container } = render(
      <OnboardingStepper
        steps={[
          { id: 'profile', label: 'About you', status: 'completed' },
          { id: 'stable', label: 'Stable', status: 'current' },
        ]}
      />,
    )

    const completedStep = container.querySelector('[data-status="completed"]')
    const marker = completedStep?.querySelector(
      '[data-slot="onboarding-step-marker"]',
    )
    expect(marker?.textContent).toBe('')
    expect(marker?.querySelector('svg')).toBeTruthy()
  })

  it('allows completed steps to be reopened for review', () => {
    const onStepSelect = vi.fn()
    const { getByRole } = render(
      <OnboardingStepper
        onStepSelect={onStepSelect}
        steps={[
          { id: 'profile', label: 'About you', status: 'completed' },
          { id: 'stable', label: 'Stable', status: 'current' },
        ]}
      />,
    )

    fireEvent.click(getByRole('button', { name: /about you/i }))

    expect(onStepSelect).toHaveBeenCalledWith({
      id: 'profile',
      label: 'About you',
      status: 'completed',
    })
  })
})
