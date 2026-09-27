import { Navigate, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { useRef, useState } from 'react'
import type { ComponentProps, ComponentType, ReactNode } from 'react'
import type { FunctionReturnType } from 'convex/server'
import { useOnboardingAction, useOnboardingPending } from './onboardingAsync'
import type { Id } from 'convex/_generated/dataModel'

import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { RoutePending } from '#/components/layout/RoutePending'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { StableMemberDetailsForm } from '#/components/stables/StableMemberDetailsForm'
import { Button, ButtonLink } from '#/components/ui/button'
import { api } from 'convex/_generated/api'
import { AccountProfileForm } from './AccountProfileForm'
import { FirstHorseStep } from './FirstHorseStep'
import { InviteTeamStep } from './InviteTeamStep'
import { OnboardingLaterNote, OnboardingLayout } from './OnboardingLayout'
import { OnboardingReviewStep } from './OnboardingReviewStep'
import type { OnboardingStep } from './OnboardingStepper'
import {
  createOnboardingStepperSteps,
  getOnboardingStepDefinitions,
} from './onboardingSteps'
import type { OnboardingRole, OnboardingStepId } from './onboardingSteps'
import { StableBasicsStep } from './StableBasicsStep'
import { StableIntroductionStep } from './StableIntroductionStep'
import { StableOperationsStep } from './StableOperationsStep'

export type PersistedOnboardingStep = Exclude<
  OnboardingStepId,
  'account-profile' | 'stable-basics' | 'invitation'
>

export function OnboardingPage({ stableId }: { stableId?: Id<'stables'> }) {
  return stableId ? (
    <StableOnboarding stableId={stableId} />
  ) : (
    <FirstStableOnboarding />
  )
}

function FirstStableOnboarding() {
  const profile = useQuery(api.onboarding.getAccountProfile)
  const stables = useQuery(api.stables.list)
  const nextOnboarding = useQuery(api.onboarding.getNextIncompleteStable)
  const navigate = useNavigate()

  if (
    profile === undefined ||
    stables === undefined ||
    nextOnboarding === undefined
  ) {
    return <RoutePending />
  }
  if (!profile) return null

  if (nextOnboarding) {
    return (
      <Navigate
        to="/onboarding"
        search={{ stableId: nextOnboarding.stableId }}
        replace
      />
    )
  }

  return (
    <FirstStableOnboardingView
      profile={profile}
      stables={stables}
      forms={connectedForms}
      onStableCreated={(newStableId) =>
        navigate({
          to: '/onboarding',
          search: { stableId: newStableId },
          replace: true,
        })
      }
    />
  )
}

export type FirstStableOnboardingViewProps = {
  profile: NonNullable<
    FunctionReturnType<typeof api.onboarding.getAccountProfile>
  >
  stables: Array<
    Pick<FunctionReturnType<typeof api.stables.list>[number], '_id' | 'name'>
  >
  forms: Pick<OnboardingForms, 'Profile' | 'Basics'>
  onStableCreated: (stableId: Id<'stables'>) => void | Promise<void>
  connectedActions?: ReactNode
}

export function FirstStableOnboardingView({
  profile,
  stables,
  forms: { Profile, Basics },
  onStableCreated,
  connectedActions,
}: FirstStableOnboardingViewProps) {
  const [profileSaved, setProfileSaved] = useState(false)
  if (stables.length > 0) {
    return (
      <RouteStatusAlert
        title="Your account is already connected"
        description="Open one of your stables, or update the account profile that follows you across all of them."
        actions={
          connectedActions ?? (
            <>
              <ButtonLink
                to="/stables/$stableId"
                params={{ stableId: stables[0]._id }}
              >
                Open {stables[0].name}
              </ButtonLink>
              <ButtonLink to="/profile" action="edit" variant="outline">
                Edit profile
              </ButtonLink>
              <ButtonLink to="/stables/create" variant="outline">
                Create my own stable
              </ButtonLink>
            </>
          )
        }
      />
    )
  }

  const includeAccountProfile = !profile.isComplete || profileSaved
  const currentStep: OnboardingStepId =
    !profile.isComplete && !profileSaved ? 'account-profile' : 'stable-basics'
  const definitions = getOnboardingStepDefinitions(
    'owner',
    includeAccountProfile,
  )
  const steps = createOnboardingStepperSteps({
    role: 'owner',
    includeAccountProfile,
    currentStep,
    completedSteps: profileSaved ? ['account-profile'] : [],
    deferredSteps: [],
  })
  const currentDefinition = definitions.find((step) => step.id === currentStep)

  if (currentStep === 'account-profile') {
    return (
      <OnboardingLayout
        pageTitle="Welcome to Paddock Pilot"
        pageDescription="A few calm steps will set up your account and first stable. Each step saves as you go."
        steps={steps}
        title="Tell us about yourself"
        description="Create the identity that will follow you across every stable you own or join."
      >
        <Profile
          initialValues={profile}
          onSaved={() => setProfileSaved(true)}
        />
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout
      pageTitle="Create your first stable"
      pageDescription="Start with the essentials. Operational details, horses and members follow in approachable steps."
      steps={steps}
      title={currentDefinition?.label ?? 'Stable basics'}
      description="Give the stable a name and location. You can add the complete postal address later."
    >
      <Basics onSaved={onStableCreated} />
    </OnboardingLayout>
  )
}

function StableOnboarding({ stableId }: { stableId: Id<'stables'> }) {
  const profile = useQuery(api.onboarding.getAccountProfile)
  const stable = useQuery(api.stables.get, { id: stableId })
  const access = useQuery(api.stables.getAccess, { id: stableId })
  const progress = useQuery(api.onboarding.getStableProgress, { stableId })
  const horses = useQuery(api.horses.list, { stableId })
  const settings = useQuery(
    api.stableMembers.listWithUsers,
    access?.role === 'owner' ? { stableId } : 'skip',
  )
  const member = useQuery(api.stableMembers.getMyDetails, { stableId })
  const recordStep = useMutation(api.onboarding.recordStableStep)
  const completeOnboarding = useMutation(
    api.onboarding.completeStableOnboarding,
  )
  const navigate = useNavigate()

  if (
    profile === undefined ||
    stable === undefined ||
    access === undefined ||
    progress === undefined ||
    horses === undefined ||
    (access?.role === 'owner' && settings === undefined) ||
    member === undefined
  ) {
    return <RoutePending />
  }

  if (!profile || !stable) {
    return <RouteStatusAlert title="Onboarding could not be found" />
  }

  return (
    <StableOnboardingView
      key={stableId}
      stableId={stableId}
      profile={profile}
      stable={stable}
      role={access.role}
      progress={progress}
      horses={horses}
      member={member}
      invitations={settings?.invitations ?? []}
      forms={connectedForms}
      recordStep={async (args) => {
        await recordStep(args)
      }}
      completeOnboarding={async () => {
        await completeOnboarding({ stableId })
      }}
      onOpenStable={async () => {
        await navigate({ to: '/stables/$stableId', params: { stableId } })
      }}
    />
  )
}

type FormComponent<T> = ComponentType<T>
export type OnboardingForms = {
  Profile: FormComponent<ComponentProps<typeof AccountProfileForm>>
  Basics: FormComponent<ComponentProps<typeof StableBasicsStep>>
  Operations: FormComponent<ComponentProps<typeof StableOperationsStep>>
  Horse: FormComponent<ComponentProps<typeof FirstHorseStep>>
  Member: FormComponent<ComponentProps<typeof StableMemberDetailsForm>>
  Team: FormComponent<ComponentProps<typeof InviteTeamStep>>
}
const connectedForms: OnboardingForms = {
  Profile: AccountProfileForm,
  Basics: StableBasicsStep,
  Operations: StableOperationsStep,
  Horse: FirstHorseStep,
  Member: StableMemberDetailsForm,
  Team: InviteTeamStep,
}
export type StableOnboardingViewProps = {
  stableId: Id<'stables'>
  profile: NonNullable<
    FunctionReturnType<typeof api.onboarding.getAccountProfile>
  >
  stable: NonNullable<FunctionReturnType<typeof api.stables.get>>
  role: OnboardingRole
  progress: {
    currentStep: string
    completedSteps: Array<string>
    deferredSteps: Array<string>
  }
  horses: FunctionReturnType<typeof api.horses.list>
  member: FunctionReturnType<typeof api.stableMembers.getMyDetails>
  invitations: FunctionReturnType<
    typeof api.stableMembers.listWithUsers
  >['invitations']
  forms: OnboardingForms
  recordStep: (args: {
    stableId: Id<'stables'>
    step: PersistedOnboardingStep
    nextStep: PersistedOnboardingStep
    deferred: boolean
  }) => Promise<void>
  completeOnboarding: () => Promise<void>
  onOpenStable: () => Promise<void>
}
export function StableOnboardingView({
  stableId,
  profile,
  stable,
  role,
  progress,
  horses,
  member,
  invitations,
  forms,
  recordStep,
  completeOnboarding,
  onOpenStable,
}: StableOnboardingViewProps) {
  const [reviewStep, setReviewStep] = useState<OnboardingStepId | null>(null)
  const transition = useOnboardingAction()
  const completed = useRef(false)
  const { Profile, Basics, Operations, Horse, Member, Team } = forms

  const currentStep = getCurrentStep(profile.isComplete, progress.currentStep)
  const completedSteps = profile.isComplete
    ? ['account-profile', ...progress.completedSteps]
    : progress.completedSteps
  const progressSteps = createOnboardingStepperSteps({
    role,
    includeAccountProfile: true,
    currentStep,
    completedSteps,
    deferredSteps: progress.deferredSteps,
  })
  const displayStep = reviewStep ?? currentStep
  const steps = reviewStep
    ? progressSteps.map((step) => ({
        ...step,
        status:
          step.id === reviewStep
            ? ('current' as const)
            : step.status === 'current'
              ? ('upcoming' as const)
              : step.status,
      }))
    : progressSteps
  const definitions = getOnboardingStepDefinitions(role, true)
  const displayStepIndex = definitions.findIndex(
    (step) => step.id === displayStep,
  )
  const previousStep = [...definitions]
    .slice(0, Math.max(displayStepIndex, 0))
    .reverse()
    .find((step) =>
      progressSteps.some(
        (progressStep) =>
          progressStep.id === step.id &&
          (progressStep.status === 'completed' ||
            progressStep.status === 'deferred'),
      ),
    )
  const ownHorses = horses.filter((horse) => horse.ownerId === profile._id)

  const openReviewStep = (step: OnboardingStepId) => {
    if (step === 'complete' || transition.pending || transition.error) return
    setReviewStep(step)
  }
  const selectReviewStep = (step: OnboardingStep) =>
    openReviewStep(step.id as OnboardingStepId)
  const returnToCurrentStep = () => setReviewStep(null)

  const advance = async (
    step: PersistedOnboardingStep,
    nextStep: PersistedOnboardingStep,
    deferred = false,
  ) => {
    await transition.run(() =>
      recordStep({ stableId, step, nextStep, deferred }),
    )
  }

  const sharedLayoutProps = {
    pending: transition.pending,
    transitionError: transition.error,
    onRetry: transition.retry,
    pageTitle:
      role === 'owner' ? `Set up ${stable.name}` : `Welcome to ${stable.name}`,
    pageDescription:
      role === 'owner'
        ? 'Build a useful starting point now, then let the stable records grow naturally.'
        : 'Learn the stable, add the details that matter here, and begin with your own horses.',
    steps,
    onStepSelect: selectReviewStep,
    onBack: reviewStep
      ? returnToCurrentStep
      : previousStep
        ? () => openReviewStep(previousStep.id)
        : undefined,
  }

  if (displayStep === 'account-profile') {
    return (
      <OnboardingLayout
        {...sharedLayoutProps}
        title="Tell us about yourself"
        description="Your account profile is shared across every stable connection."
      >
        <PendingProfile
          Form={Profile}
          initialValues={profile}
          onSaved={reviewStep ? returnToCurrentStep : () => undefined}
        />
      </OnboardingLayout>
    )
  }

  if (role === 'owner' && displayStep === 'stable-basics') {
    return (
      <OnboardingLayout
        {...sharedLayoutProps}
        title="Stable basics"
        description="Correct the stable name or location, then return to your current step."
      >
        <Basics stable={stable} onSaved={returnToCurrentStep} />
      </OnboardingLayout>
    )
  }

  if (role === 'owner' && displayStep === 'stable-operations') {
    return (
      <OnboardingLayout
        {...sharedLayoutProps}
        optional
        title="How does the stable run?"
        description="Add the contact and operational details people are most likely to need."
      >
        <Operations
          stable={stable}
          onSaved={() =>
            reviewStep
              ? returnToCurrentStep()
              : advance('stable-operations', 'first-horse')
          }
          onDeferred={() =>
            reviewStep
              ? returnToCurrentStep()
              : advance('stable-operations', 'first-horse', true)
          }
          cancelLabel={reviewStep ? 'Cancel' : 'Do this later'}
        />
      </OnboardingLayout>
    )
  }

  if (role === 'member' && displayStep === 'stable-introduction') {
    return (
      <OnboardingLayout
        {...sharedLayoutProps}
        title={`Meet ${stable.name}`}
        description="Here are the stable details that will help you get oriented."
      >
        <StableIntroductionStep
          stable={stable}
          onContinue={() =>
            reviewStep
              ? returnToCurrentStep()
              : advance('stable-introduction', 'member-details')
          }
        />
      </OnboardingLayout>
    )
  }

  if (role === 'member' && displayStep === 'member-details') {
    if (!member) {
      return (
        <RouteStatusAlert
          tone="danger"
          title="Membership details could not be found"
        />
      )
    }

    return (
      <OnboardingLayout
        {...sharedLayoutProps}
        optional
        title="Your details at this stable"
        description="These details belong to this membership and can differ at another stable."
      >
        <div className="grid gap-5">
          <OnboardingLaterNote>
            An emergency contact is useful around the yard, but you can add or
            update it later from your stable profile.
          </OnboardingLaterNote>

          <PendingMember
            Form={Member}
            member={member}
            cancelLabel={reviewStep ? 'Cancel' : 'Do this later'}
            onCancel={() => {
              return reviewStep
                ? returnToCurrentStep()
                : advance('member-details', 'first-horse', true)
            }}
            onSaved={() => {
              return reviewStep
                ? returnToCurrentStep()
                : advance('member-details', 'first-horse')
            }}
          />
        </div>
      </OnboardingLayout>
    )
  }

  if (displayStep === 'first-horse') {
    const ownHorseCount = ownHorses.length

    return (
      <OnboardingLayout
        {...sharedLayoutProps}
        optional
        title={
          ownHorseCount > 0
            ? 'Your first horse is ready'
            : 'Add your first horse'
        }
        description={
          ownHorseCount > 0
            ? 'A horse is already connected to your account in this stable.'
            : 'Begin with identification. Care and health details can grow later.'
        }
      >
        {ownHorseCount > 0 && !reviewStep ? (
          <DashboardEmptyState
            title="Horse connected"
            actions={
              <Button
                type="button"
                onClick={() =>
                  advance(
                    'first-horse',
                    role === 'owner' ? 'invite-team' : 'complete',
                  )
                }
              >
                Continue
              </Button>
            }
          >
            You can continue onboarding and add more profile details whenever
            you’re ready.
          </DashboardEmptyState>
        ) : (
          <Horse
            stableId={stableId}
            horse={reviewStep ? ownHorses[0] : undefined}
            onSaved={() =>
              reviewStep
                ? returnToCurrentStep()
                : advance(
                    'first-horse',
                    role === 'owner' ? 'invite-team' : 'complete',
                  )
            }
            onDeferred={() =>
              reviewStep
                ? returnToCurrentStep()
                : advance(
                    'first-horse',
                    role === 'owner' ? 'invite-team' : 'complete',
                    true,
                  )
            }
            cancelLabel={reviewStep ? 'Cancel' : 'Do this later'}
          />
        )}
      </OnboardingLayout>
    )
  }

  if (role === 'owner' && displayStep === 'invite-team') {
    return (
      <OnboardingLayout
        {...sharedLayoutProps}
        optional
        title="Bring in your team"
        description="Invite members by email. Their access begins only after they accept."
      >
        <Team
          stableId={stableId}
          invitations={invitations}
          onContinue={() =>
            reviewStep
              ? returnToCurrentStep()
              : advance('invite-team', 'complete')
          }
          onDeferred={() =>
            reviewStep
              ? returnToCurrentStep()
              : advance('invite-team', 'complete', true)
          }
        />
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout
      {...sharedLayoutProps}
      onBack={undefined}
      title="Review and finish"
      description="Check the information you have added. Every editable field can be corrected before you continue."
    >
      <OnboardingReviewStep
        profile={profile}
        stable={stable}
        role={role}
        horse={ownHorses[0]}
        member={member}
        invitations={invitations}
        onEdit={openReviewStep}
        onComplete={() =>
          transition.run(async () => {
            if (!completed.current) {
              await completeOnboarding()
              completed.current = true
            }
            await onOpenStable()
          }, 'Could not open the stable. Try again; completed setup will not be submitted twice.')
        }
      />
    </OnboardingLayout>
  )
}

function getCurrentStep(
  profileComplete: boolean,
  storedStep: string,
): OnboardingStepId {
  if (!profileComplete) return 'account-profile'

  const allowedSteps = new Set<OnboardingStepId>([
    'stable-operations',
    'stable-introduction',
    'member-details',
    'first-horse',
    'invite-team',
    'complete',
  ])

  return allowedSteps.has(storedStep as OnboardingStepId)
    ? (storedStep as OnboardingStepId)
    : 'complete'
}

function PendingProfile({
  Form,
  ...props
}: ComponentProps<typeof AccountProfileForm> & {
  Form: OnboardingForms['Profile']
}) {
  const onPendingChange = useOnboardingPending()
  return <Form {...props} onPendingChange={onPendingChange} />
}
function PendingMember({
  Form,
  ...props
}: ComponentProps<typeof StableMemberDetailsForm> & {
  Form: OnboardingForms['Member']
}) {
  const onPendingChange = useOnboardingPending()
  return <Form {...props} onPendingChange={onPendingChange} />
}
