import { describe, expect, it } from 'vitest'

import { createOnboardingStepperSteps } from './onboardingSteps'

describe('createOnboardingStepperSteps', () => {
  it('keeps the account profile completed when a user joins another stable', () => {
    const steps = createOnboardingStepperSteps({
      role: 'member',
      includeAccountProfile: true,
      currentStep: 'stable-introduction',
      completedSteps: ['account-profile', 'invitation'],
      deferredSteps: [],
    })

    expect(steps.map(({ id, status }) => [id, status])).toEqual([
      ['account-profile', 'completed'],
      ['stable-introduction', 'current'],
      ['member-details', 'upcoming'],
      ['first-horse', 'upcoming'],
      ['complete', 'upcoming'],
    ])
  })

  it('treats an optional deferred step as done later rather than incomplete', () => {
    const steps = createOnboardingStepperSteps({
      role: 'owner',
      includeAccountProfile: true,
      currentStep: 'first-horse',
      completedSteps: ['account-profile', 'stable-basics'],
      deferredSteps: ['stable-operations'],
    })

    expect(steps.find((step) => step.id === 'stable-operations')?.status).toBe(
      'deferred',
    )
  })
})
