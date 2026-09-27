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

  it('keeps only completed and deferred steps available to keyboard focus and activation', () => {
    const onStepSelect = vi.fn()
    const steps = [
      { id: 'profile', label: 'About you', status: 'completed' },
      { id: 'stable', label: 'Stable', status: 'current' },
      { id: 'horse', label: 'First horse', status: 'upcoming' },
      { id: 'team', label: 'Your team', status: 'deferred' },
    ] as const
    const { getByRole } = render(
      <OnboardingStepper steps={[...steps]} onStepSelect={onStepSelect} />,
    )
    const completed = getByRole('button', { name: /About you\s*Complete/ })
    const current = getByRole('button', { name: 'Stable' })
    const upcoming = getByRole('button', { name: /First horse\s*Up next/ })
    const deferred = getByRole('button', { name: /Your team\s*Done later/ })

    completed.focus()
    expect(document.activeElement).toBe(completed)
    current.focus()
    upcoming.focus()
    expect(document.activeElement).toBe(completed)
    deferred.focus()
    expect(document.activeElement).toBe(deferred)

    expect(current.hasAttribute('disabled')).toBe(true)
    expect(upcoming.hasAttribute('disabled')).toBe(true)
    expect(current.closest('li')?.getAttribute('aria-current')).toBe('step')
    expect(completed.getAttribute('type')).toBe('button')
    expect(deferred.getAttribute('type')).toBe('button')

    fireEvent.click(current)
    fireEvent.click(upcoming)
    expect(onStepSelect).not.toHaveBeenCalled()
    fireEvent.click(deferred)
    fireEvent.click(completed)
    expect(onStepSelect.mock.calls.map(([step]) => step.id)).toEqual([
      'team',
      'profile',
    ])
  })

  it('keeps a progress-only specimen outside the keyboard focus order', () => {
    const { getAllByRole } = render(
      <OnboardingStepper
        steps={[
          { id: 'profile', label: 'About you', status: 'completed' },
          { id: 'team', label: 'Your team', status: 'deferred' },
        ]}
      />,
    )

    for (const button of getAllByRole('button')) {
      button.focus()
      expect(button.hasAttribute('disabled')).toBe(true)
      expect(document.activeElement).not.toBe(button)
    }
  })
})
