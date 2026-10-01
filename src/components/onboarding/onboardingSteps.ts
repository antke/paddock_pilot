import type { TFunction } from 'i18next'
import { localeInstances } from '#/i18n/resources'
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
  label: 'onboarding.aboutYou',
} as const

const ownerSteps = [
  { id: 'stable-basics', label: 'onboarding.stable' },
  { id: 'stable-operations', label: 'onboarding.operations' },
  { id: 'first-horse', label: 'onboarding.firstHorse' },
  { id: 'invite-team', label: 'onboarding.yourTeam' },
  { id: 'complete', label: 'onboarding.review' },
] as const

const memberSteps = [
  { id: 'stable-introduction', label: 'onboarding.yourStable' },
  { id: 'member-details', label: 'onboarding.stableDetails' },
  { id: 'first-horse', label: 'onboarding.firstHorse' },
  { id: 'complete', label: 'onboarding.review' },
] as const

export function getOnboardingStepDefinitions(
  role: OnboardingRole,
  includeAccountProfile: boolean,
  t: TFunction<'app'> = localeInstances.en.t,
) {
  const roleSteps = role === 'owner' ? ownerSteps : memberSteps
  return (
    includeAccountProfile ? [accountStep, ...roleSteps] : [...roleSteps]
  ).map((step) => ({ ...step, label: t(step.label) }))
}

export function createOnboardingStepperSteps(input: {
  t?: TFunction<'app'>
  role: OnboardingRole
  includeAccountProfile: boolean
  currentStep: OnboardingStepId
  completedSteps: Array<string>
  deferredSteps: Array<string>
}): Array<OnboardingStep> {
  const definitions = getOnboardingStepDefinitions(
    input.role,
    input.includeAccountProfile,
    input.t,
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
