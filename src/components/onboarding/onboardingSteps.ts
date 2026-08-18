import type { OnboardingStep, OnboardingStepStatus } from './OnboardingStepper'

export type OnboardingRole = 'owner' | 'member'

export type OnboardingStepId =
  | 'account-profile'
  | 'stable-basics'
  | 'stable-operations'
  | 'stable-introduction'
  | 'member-details'
  | 'first-horse'
  | 'invite-team'
  | 'complete'

const accountStep = {
  id: 'account-profile',
  label: 'About you',
} as const

const ownerSteps = [
  { id: 'stable-basics', label: 'Stable' },
  { id: 'stable-operations', label: 'Operations' },
  { id: 'first-horse', label: 'First horse' },
  { id: 'invite-team', label: 'Your team' },
  { id: 'complete', label: 'Review' },
] as const

const memberSteps = [
  { id: 'stable-introduction', label: 'Your stable' },
  { id: 'member-details', label: 'Stable details' },
  { id: 'first-horse', label: 'First horse' },
  { id: 'complete', label: 'Review' },
] as const

export function getOnboardingStepDefinitions(
  role: OnboardingRole,
  includeAccountProfile: boolean,
) {
  const roleSteps = role === 'owner' ? ownerSteps : memberSteps
  return includeAccountProfile ? [accountStep, ...roleSteps] : [...roleSteps]
}

export function createOnboardingStepperSteps(input: {
  role: OnboardingRole
  includeAccountProfile: boolean
  currentStep: OnboardingStepId
  completedSteps: Array<string>
  deferredSteps: Array<string>
}): Array<OnboardingStep> {
  const definitions = getOnboardingStepDefinitions(
    input.role,
    input.includeAccountProfile,
  )
  const currentIndex = definitions.findIndex(
    (step) => step.id === input.currentStep,
  )

  return definitions.map((step, index) => ({
    ...step,
    status: getStepStatus({
      id: step.id,
      index,
      currentIndex,
      currentStep: input.currentStep,
      completedSteps: input.completedSteps,
      deferredSteps: input.deferredSteps,
    }),
  }))
}

function getStepStatus(input: {
  id: OnboardingStepId
  index: number
  currentIndex: number
  currentStep: OnboardingStepId
  completedSteps: Array<string>
  deferredSteps: Array<string>
}): OnboardingStepStatus {
  if (input.completedSteps.includes(input.id)) return 'completed'
  if (input.deferredSteps.includes(input.id)) return 'deferred'
  if (input.id === input.currentStep) return 'current'
  if (input.currentIndex === -1 || input.index > input.currentIndex) {
    return 'upcoming'
  }

  return 'completed'
}
