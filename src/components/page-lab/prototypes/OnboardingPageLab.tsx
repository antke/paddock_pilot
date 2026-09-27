import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ComponentProps } from 'react'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { Button } from '#/components/ui/button'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import {
  FirstStableOnboardingView,
  StableOnboardingView,
} from '#/components/onboarding/OnboardingPage'
import type {
  OnboardingForms,
  StableOnboardingViewProps,
} from '#/components/onboarding/OnboardingPage'
import { AccountProfileFormView } from '#/components/onboarding/AccountProfileForm'
import { StableBasicsStepView } from '#/components/onboarding/StableBasicsStep'
import { StableOperationsStepView } from '#/components/onboarding/StableOperationsStep'
import { FirstHorseStepView } from '#/components/onboarding/FirstHorseStep'
import { InviteTeamStepView } from '#/components/onboarding/InviteTeamStep'
import { useOnboardingPending } from '#/components/onboarding/onboardingAsync'
import { StableMemberDetailsFormView } from '#/components/stables/StableMemberDetailsForm'
import { StableInviteFormView } from '#/components/stables/StableInviteForm'
import { StableInvitationsListView } from '#/components/stables/StableInvitationsList'

type Props = { data: DashboardLabData }
type WizardState = Pick<
  StableOnboardingViewProps,
  'profile' | 'stable' | 'horses' | 'member' | 'invitations' | 'progress'
>
type SampleContextValue = {
  firstStable?: boolean
  state: WizardState
  update: (update: (state: WizardState) => WizardState) => void
  wait: (phase: 'save' | 'advance' | 'open') => Promise<void>
  notify: (message: string) => void
}
const SampleContext = createContext<SampleContextValue | null>(null)
function useSample() {
  const value = useContext(SampleContext)
  if (!value) throw new Error('Onboarding sample context missing')
  return value
}
export function OnboardingPageLab({ data }: Props) {
  const enabled = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !enabled)
    return (
      <DashboardEmptyState>
        Onboarding simulations are available only with development sample data.
      </DashboardEmptyState>
    )
  return <SamplePicker data={data} />
}
function SamplePicker({ data }: Props) {
  const [scenario, setScenario] = useState('owner')
  const [revision, setRevision] = useState(0)
  return (
    <div className="grid gap-6">
      <p className="text-sm text-muted-foreground">
        Sample onboarding. Changes stay in this preview. No account, horse,
        stable, upload or invitation is created or sent.
      </p>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor="onboarding-sample-role">
            Sample workflow
          </FieldLabel>
          <Select
            id="onboarding-sample-role"
            value={scenario}
            onChange={(event) => setScenario(event.target.value)}
          >
            <option value="first">First account → first stable</option>
            <option value="connected">Account already connected</option>
            <option value="owner">Owner — stable operations</option>
            <option value="member">Member — introduction</option>
            <option value="profile">Owner — account profile</option>
            <option value="review">
              Owner — review mixed invitation states
            </option>
          </Select>
        </Field>
        <Button
          variant="outline"
          onClick={() => setRevision((value) => value + 1)}
        >
          Restart sample
        </Button>
      </FieldGrid>
      <WizardSample
        key={`${scenario}-${revision}-${data.stable._id}`}
        data={data}
        scenario={scenario}
      />
    </div>
  )
}
function WizardSample({ data, scenario }: Props & { scenario: string }) {
  const firstStable = scenario === 'first' || scenario === 'connected'
  const role = scenario === 'member' ? 'member' : 'owner'
  const [state, update] = useState<WizardState>(() =>
    initialState(data, scenario),
  )
  const [outcome, setOutcome] = useState('success')
  const outcomeRef = useRef(outcome)
  outcomeRef.current = outcome
  const [delay, setDelay] = useState('150')
  const [pending, setPending] = useState(0)
  const [status, notify] = useState('')
  const [finished, setFinished] = useState(false)
  const epoch = useRef(0)
  const cancellations = useRef(new Set<() => void>())
  useEffect(() => {
    epoch.current++
    const active = cancellations.current
    return () => {
      epoch.current++
      for (const cancel of active) cancel()
    }
  }, [])
  const wait: SampleContextValue['wait'] = async (phase) => {
    const shouldFail = outcomeRef.current === `${phase}-failure`
    // Consume the failure synchronously so repeated retries are deterministic.
    if (shouldFail) {
      outcomeRef.current = 'success'
      setOutcome('success')
    }
    const current = epoch.current
    setPending((count) => count + 1)
    try {
      await new Promise<void>((resolve, reject) => {
        const cancel = () => {
          clearTimeout(timer)
          cancellations.current.delete(cancel)
          reject(new DOMException('Sample cancelled', 'AbortError'))
        }
        const timer = setTimeout(() => {
          cancellations.current.delete(cancel)
          resolve()
        }, Number(delay))
        cancellations.current.add(cancel)
      })
      if (epoch.current !== current)
        throw new DOMException('Sample cancelled', 'AbortError')
      if (shouldFail) throw new Error('Sample operation failed')
    } finally {
      if (epoch.current === current) setPending((count) => count - 1)
    }
  }
  return (
    <SampleContext.Provider
      value={{ state, update, wait, notify, firstStable }}
    >
      {scenario !== 'connected' && (
        <FieldGrid>
          <Field>
            <FieldLabel htmlFor="onboarding-sample-outcome">
              Next sample response
            </FieldLabel>
            <Select
              id="onboarding-sample-outcome"
              disabled={pending > 0}
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
            >
              <option value="success">Success</option>
              <option value="save-failure">Save fails once</option>
              <option value="advance-failure">
                Step advancement fails once
              </option>
              {!firstStable && (
                <option value="open-failure">
                  Opening the stable fails once
                </option>
              )}
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="onboarding-sample-delay">
              Sample response delay
            </FieldLabel>
            <Select
              id="onboarding-sample-delay"
              value={delay}
              disabled={pending > 0}
              onChange={(event) => setDelay(event.target.value)}
            >
              <option value="150">Brief</option>
              <option value="1800">Slow — test pending actions</option>
            </Select>
          </Field>
        </FieldGrid>
      )}
      {status && (
        <p role="status" className="text-sm">
          {status}
        </p>
      )}
      {finished ? (
        <DashboardEmptyState
          title={
            firstStable ? 'Sample stable created' : 'Sample setup complete'
          }
        >
          {firstStable
            ? 'Stable basics were acknowledged locally. The real app would continue to stable operations; no stable was created or navigation performed.'
            : 'The sample stable is ready. No real navigation or setup was performed.'}
        </DashboardEmptyState>
      ) : firstStable ? (
        <FirstStableOnboardingView
          profile={state.profile}
          stables={scenario === 'connected' ? [state.stable] : []}
          forms={sampleForms}
          onStableCreated={async () => {
            await wait('advance')
            setFinished(true)
          }}
          connectedActions={
            <>
              <Button
                onClick={() =>
                  notify(
                    'Sample destination: stable overview. No navigation performed.',
                  )
                }
              >
                Open {state.stable.name}
              </Button>
              <Button
                action="edit"
                variant="outline"
                onClick={() =>
                  notify(
                    'Sample destination: account profile. No navigation performed.',
                  )
                }
              >
                Edit profile
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  notify(
                    'Sample destination: create stable. No navigation performed.',
                  )
                }
              >
                Create my own stable
              </Button>
            </>
          }
        />
      ) : (
        <StableOnboardingView
          {...state}
          stableId={state.stable._id}
          role={role}
          forms={sampleForms}
          recordStep={async ({ step, nextStep, deferred }) => {
            await wait('advance')
            update((current) => ({
              ...current,
              progress: {
                ...current.progress,
                currentStep: nextStep,
                completedSteps: deferred
                  ? current.progress.completedSteps
                  : [...new Set([...current.progress.completedSteps, step])],
                deferredSteps: deferred
                  ? [...new Set([...current.progress.deferredSteps, step])]
                  : current.progress.deferredSteps.filter(
                      (value) => value !== step,
                    ),
              },
            }))
            notify('Sample progress applied locally.')
          }}
          completeOnboarding={async () => {
            await wait('advance')
            notify('Sample setup acknowledged locally.')
          }}
          onOpenStable={async () => {
            await wait('open')
            setFinished(true)
          }}
        />
      )}
    </SampleContext.Provider>
  )
}
const sampleForms: OnboardingForms = {
  Profile: SampleProfile,
  Basics: SampleBasics,
  Operations: SampleOperations,
  Horse: SampleHorse,
  Member: SampleMember,
  Team: SampleTeam,
}
function SampleProfile(props: ComponentProps<OnboardingForms['Profile']>) {
  const sample = useSample()
  return (
    <AccountProfileFormView
      {...props}
      onSave={async (values) => {
        await sample.wait('save')
        sample.update((state) => ({
          ...state,
          profile: {
            ...state.profile,
            displayName: values.preferredName,
            phone: values.phone,
            isComplete: sample.firstStable ? state.profile.isComplete : true,
          },
        }))
        sample.notify(
          'Sample profile applied locally. Images are validated but are not uploaded.',
        )
      }}
    />
  )
}
function SampleBasics(props: ComponentProps<OnboardingForms['Basics']>) {
  const sample = useSample()
  return (
    <StableBasicsStepView
      {...props}
      onSave={async (values) => {
        await sample.wait('save')
        sample.update((state) => ({
          ...state,
          stable: { ...state.stable, ...values },
        }))
        sample.notify(
          sample.firstStable
            ? 'Sample stable creation acknowledged locally.'
            : 'Sample stable details applied locally.',
        )
        return sample.state.stable._id
      }}
    />
  )
}
function SampleOperations(
  props: ComponentProps<OnboardingForms['Operations']>,
) {
  const sample = useSample()
  return (
    <StableOperationsStepView
      {...props}
      onSave={async (values) => {
        await sample.wait('save')
        sample.update((state) => ({
          ...state,
          stable: { ...state.stable, ...values },
        }))
        sample.notify('Sample stable details applied locally.')
      }}
    />
  )
}
function SampleHorse(props: ComponentProps<OnboardingForms['Horse']>) {
  const sample = useSample()
  return (
    <FirstHorseStepView
      {...props}
      onSave={async (values) => {
        await sample.wait('save')
        sample.update((state) => ({
          ...state,
          horses: [
            {
              ...props.horse,
              ...values,
              _id:
                props.horse?._id ?? ('sample-onboarding-horse' as Id<'horses'>),
              _creationTime: 0,
              stableId: state.stable._id,
              ownerId: state.profile._id,
              profileImageUrl: undefined,
            },
          ],
        }))
        sample.notify('Sample horse applied locally.')
      }}
    />
  )
}
function SampleMember(props: ComponentProps<OnboardingForms['Member']>) {
  const sample = useSample()
  return (
    <StableMemberDetailsFormView
      {...props}
      onSave={async (values) => {
        await sample.wait('save')
        sample.update((state) => ({
          ...state,
          member: { ...props.member, ...values },
        }))
        sample.notify('Sample member details applied locally.')
        return true
      }}
    />
  )
}
function SampleTeam(props: ComponentProps<OnboardingForms['Team']>) {
  const sample = useSample()
  const onPendingChange = useOnboardingPending()
  return (
    <InviteTeamStepView
      {...props}
      inviteForm={
        <StableInviteFormView
          onPendingChange={onPendingChange}
          onInvite={async (values) => {
            await sample.wait('save')
            sample.update((state) => ({
              ...state,
              invitations: [
                ...state.invitations,
                invitation(
                  state.stable._id,
                  state.profile._id,
                  values.email,
                  'pending',
                  state.invitations.length,
                ),
              ],
            }))
            sample.notify('Sample invitation added locally. No email was sent.')
            return true
          }}
        />
      }
      invitationList={
        <StableInvitationsListView
          invitations={props.invitations}
          onCopy={async () => {
            sample.notify(
              'Sample links are not real invitations; nothing was copied.',
            )
          }}
          onResend={async () => {
            await sample.wait('save')
            sample.notify('Sample resend acknowledged. No email was sent.')
            return true
          }}
          onRevoke={async (item) => {
            await sample.wait('save')
            sample.update((state) => ({
              ...state,
              invitations: state.invitations.map((entry) =>
                entry._id === item._id
                  ? { ...entry, status: 'revoked' }
                  : entry,
              ),
            }))
            return true
          }}
        />
      }
    />
  )
}
function initialState(data: DashboardLabData, scenario: string): WizardState {
  const userId = 'sample-onboarding-user' as Id<'users'>
  const role = scenario === 'member' ? 'member' : 'owner'
  return {
    stable: {
      ...data.stable,
      name: 'Sample Cedar Ridge',
      contactName: '',
      contactPhone: '',
      emergencyPhone: '',
      openingHours: '',
      yardRules: '',
    },
    profile: {
      _id: userId,
      _creationTime: 0,
      clerkId: 'sample',
      firstName: 'Alex',
      displayName: 'Alex Morgan',
      email: 'alex@example.test',
      createdAt: 0,
      updatedAt: 0,
      profileImageUrl: undefined,
      isComplete: scenario !== 'profile' && scenario !== 'first',
    },
    horses: [],
    member: {
      _id: 'sample-onboarding-member' as Id<'stableMembers'>,
      _creationTime: 0,
      stableId: data.stable._id,
      userId,
      role: 'member',
    },
    progress: {
      currentStep:
        scenario === 'review'
          ? 'complete'
          : role === 'owner'
            ? 'stable-operations'
            : 'stable-introduction',
      completedSteps:
        scenario === 'review'
          ? ['stable-basics', 'stable-operations', 'first-horse', 'invite-team']
          : role === 'owner'
            ? ['stable-basics']
            : ['invitation'],
      deferredSteps: [],
    },
    invitations:
      scenario === 'review'
        ? [
            invitation(
              data.stable._id,
              userId,
              'pending@example.test',
              'pending',
              0,
            ),
            invitation(
              data.stable._id,
              userId,
              'accepted@example.test',
              'accepted',
              1,
            ),
            invitation(
              data.stable._id,
              userId,
              'expired@example.test',
              'pending',
              2,
              0,
            ),
          ]
        : [],
  }
}
function invitation(
  stableId: Id<'stables'>,
  userId: Id<'users'>,
  email: string,
  status: Doc<'stableInvitations'>['status'],
  index: number,
  expiresAt = Date.now() + 86400000,
): Doc<'stableInvitations'> {
  return {
    _id: `sample-onboarding-invite-${index}` as Id<'stableInvitations'>,
    _creationTime: 0,
    stableId,
    invitedBy: userId,
    email,
    role: 'member',
    status,
    token: `sample-only-${index}`,
    createdAt: 0,
    updatedAt: 0,
    expiresAt,
  }
}
