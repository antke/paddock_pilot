import { useState } from 'react'

import { OnboardingStepper } from '#/components/onboarding/OnboardingStepper'
import type { OnboardingStep } from '#/components/onboarding/OnboardingStepper'
import { Button } from '#/components/ui/button'

const sampleSteps: Array<OnboardingStep> = [
  { id: 'profile', label: 'About you', status: 'completed' },
  { id: 'stable', label: 'Stable', status: 'current' },
  { id: 'horse', label: 'First horse', status: 'upcoming' },
  { id: 'team', label: 'Your team', status: 'deferred' },
]

export function OnboardingStepperSample() {
  const [reviewedStep, setReviewedStep] = useState<OnboardingStep | null>(null)
  const steps = reviewedStep
    ? sampleSteps.map((step): OnboardingStep => ({
        ...step,
        status:
          step.id === reviewedStep.id
            ? 'current'
            : step.status === 'current'
              ? 'upcoming'
              : step.status,
      }))
    : sampleSteps

  return (
    <div className="grid gap-3">
      <OnboardingStepper steps={steps} onStepSelect={setReviewedStep} />
      <p className="text-sm leading-relaxed text-muted-foreground" role="status">
        {reviewedStep
          ? `Sample preview: reviewing ${reviewedStep.label.toLowerCase()}. No live onboarding progress changed.`
          : 'Sample progress. Reopen a completed or deferred step to review it. No live onboarding progress changes.'}
      </p>
      {reviewedStep && (
        <div>
          <Button variant="outline" onClick={() => setReviewedStep(null)}>
            Return to current step
          </Button>
        </div>
      )}
    </div>
  )
}
