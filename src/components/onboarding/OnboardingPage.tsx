import { useT } from '#/i18n/LocaleProvider'
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
  const t = useT()

  const [profileSaved, setProfileSaved] = useState(false)
  if (stables.length > 0) {
    return (
      <RouteStatusAlert
        title={t('onboarding.accountConnected')}
        description={t('onboarding.accountConnectedHelp')}
        actions={
          connectedActions ?? (
            <>
              <ButtonLink
                to="/stables/$stableId"
                params={{ stableId: stables[0]._id }}
              >
                {t('onboarding.openStable', { name: stables[0].name })}
              </ButtonLink>
              <ButtonLink to="/profile" action="edit" variant="outline">
                {t('onboarding.editProfile')}
              </ButtonLink>
              <ButtonLink to="/stables/create" variant="outline">
                {t('onboarding.createOwnStable')}
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
    t,
  )
  const steps = createOnboardingStepperSteps({
    t,
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
        pageTitle={t('onboarding.welcome')}
        pageDescription={t('onboarding.welcomeHelp')}
        steps={steps}
        title={t('onboarding.aboutYouTitle')}
        description={t('onboarding.aboutYouHelp')}
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
      pageTitle={t('onboarding.createFirst')}
      pageDescription={t('onboarding.createFirstHelp')}
      steps={steps}
      title={currentDefinition?.label ?? t('onboarding.stableBasics')}
      description={t('onboarding.stableBasicsHelp')}
    >
      <Basics onSaved={onStableCreated} />
    </OnboardingLayout>
  )
}

function StableOnboarding({ stableId }: { stableId: Id<'stables'> }) {
  const t = useT()

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
    return <RouteStatusAlert title={t('onboarding.notFound')} />
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
  const t = useT()

  const [reviewStep, setReviewStep] = useState<OnboardingStepId | null>(null)
  const transition = useOnboardingAction()
  const completed = useRef(false)
  const { Profile, Basics, Operations, Horse, Member, Team } = forms

  const currentStep = getCurrentStep(profile.isComplete, progress.currentStep)
  const completedSteps = profile.isComplete
    ? ['account-profile', ...progress.completedSteps]
    : progress.completedSteps
  const progressSteps = createOnboardingStepperSteps({
    t,
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
  const definitions = getOnboardingStepDefinitions(role, true, t)
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
      role === 'owner'
        ? t('onboarding.setUpStable', { name: stable.name })
        : t('onboarding.welcomeStable', { name: stable.name }),
    pageDescription:
      role === 'owner' ? t('onboarding.ownerHelp') : t('onboarding.memberHelp'),
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
        title={t('onboarding.aboutYouTitle')}
        description={t('onboarding.sharedProfileHelp')}
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
        title={t('onboarding.stableBasics')}
        description={t('onboarding.editBasicsHelp')}
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
        title={t('onboarding.operationsTitle')}
        description={t('onboarding.operationsHelp')}
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
          cancelLabel={
            reviewStep ? t('onboarding.cancel') : t('onboarding.later')
          }
        />
      </OnboardingLayout>
    )
  }

  if (role === 'member' && displayStep === 'stable-introduction') {
    return (
      <OnboardingLayout
        {...sharedLayoutProps}
        title={t('onboarding.meetStable', { name: stable.name })}
        description={t('onboarding.introductionHelp')}
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
          title={t('onboarding.memberNotFound')}
        />
      )
    }

    return (
      <OnboardingLayout
        {...sharedLayoutProps}
        optional
        title={t('onboarding.memberTitle')}
        description={t('onboarding.memberHelpDetails')}
      >
        <div className="grid gap-5">
          <OnboardingLaterNote>
            {t('onboarding.emergencyLater')}
          </OnboardingLaterNote>

          <PendingMember
            Form={Member}
            member={member}
            cancelLabel={
              reviewStep ? t('onboarding.cancel') : t('onboarding.later')
            }
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
            ? t('onboarding.horseReady')
            : t('onboarding.addFirstHorse')
        }
        description={
          ownHorseCount > 0
            ? t('onboarding.horseReadyHelp')
            : t('onboarding.horseStartHelp')
        }
      >
        {ownHorseCount > 0 && !reviewStep ? (
          <DashboardEmptyState
            title={t('onboarding.horseConnected')}
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
                {t('onboarding.continue')}
              </Button>
            }
          >
            {t('onboarding.horseContinueHelp')}
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
            cancelLabel={
              reviewStep ? t('onboarding.cancel') : t('onboarding.later')
            }
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
        title={t('onboarding.inviteTeam')}
        description={t('onboarding.inviteTeamHelp')}
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
      title={t('onboarding.reviewFinish')}
      description={t('onboarding.reviewFinishHelp')}
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
          }, 'openStable')
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
