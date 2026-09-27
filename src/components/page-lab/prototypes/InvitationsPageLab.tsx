import { useEffect, useId, useRef, useState } from 'react'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { Button } from '#/components/ui/button'
import {
  InvitationPageView,
  InvitationQueryErrorView,
} from '#/components/invitations/InvitationPageView'
import type {
  FoundInvitationPreview,
  InvitationPreview,
} from '#/components/invitations/InvitationPageView'

const scenarios = [
  ['pending', 'Ready to accept or decline'],
  ['long', 'Long stable and inviter names'],
  ['signed-out', 'Signed out'],
  ['preparing', 'Preparing account'],
  ['wrong-email', 'Wrong email'],
  ['no-email', 'No verified email'],
  ['expired', 'Expired'],
  ['revoked', 'Revoked'],
  ['declined', 'Declined by this account'],
  ['declined-other', 'Declined by another account'],
  ['accepted', 'Already a member'],
  ['accepted-other', 'Accepted by another account'],
  ['legacy', 'Previously accepted — activation needed'],
  ['legacy-other', 'Legacy invitation — another account'],
  ['signed-out-accepted', 'Accepted — signed out'],
  ['not-found', 'Not found'],
  ['query-error', 'Query error and retry'],
] as const

export function InvitationsPageLab({ data }: { data: DashboardLabData }) {
  const fixture = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !fixture)
    return (
      <DashboardEmptyState>
        Invitation access samples require local development fixture mode.
      </DashboardEmptyState>
    )
  return <InvitationSampleControls key={data.stable._id} data={data} />
}
function InvitationSampleControls({ data }: { data: DashboardLabData }) {
  const id = useId()
  const [scenario, setScenario] = useState('pending')
  return (
    <>
      <DashboardInlinePanel chrome="flat">
        <p>
          Sample stable invitation. Decisions change this preview only; no
          invitation is sent and no real membership or access is created.
          Profile links leave the sample.
        </p>
        <Field>
          <FieldLabel htmlFor={id}>Sample invitation state</FieldLabel>
          <Select
            id={id}
            value={scenario}
            onChange={(event) => setScenario(event.target.value)}
          >
            {scenarios.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </DashboardInlinePanel>
      <InvitationSample key={scenario} data={data} scenario={scenario} />
    </>
  )
}
function InvitationSample({
  data,
  scenario,
}: {
  data: DashboardLabData
  scenario: string
}) {
  const id = useId()
  const [outcome, setOutcome] = useState('success')
  const [delay, setDelay] = useState('150')
  const [pending, setPending] = useState(false)
  const [queryFailed, setQueryFailed] = useState(scenario === 'query-error')
  const [authMessage, setAuthMessage] = useState('')
  const generation = useRef(0)
  useEffect(
    () => () => {
      generation.current += 1
    },
    [],
  )
  const respond = async () => {
    const current = generation.current
    setPending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, Number(delay)))
      if (generation.current !== current) throw new Error('Sample changed')
      if (outcome === 'failure') {
        setOutcome('success')
        throw new Error('Sample failed')
      }
    } finally {
      if (generation.current === current) setPending(false)
    }
  }
  const authButton = (label: string) => (
    <Button
      type="button"
      variant="outline"
      onClick={() =>
        setAuthMessage(
          `${label} is a real account action. This local sample does not change authentication.`,
        )
      }
    >
      {label}
    </Button>
  )
  const preview = createInvitationSample(data, scenario)
  return (
    <>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor={`${id}-outcome`}>
            Next sample response
          </FieldLabel>
          <Select
            id={`${id}-outcome`}
            value={outcome}
            disabled={pending}
            onChange={(event) => setOutcome(event.target.value)}
          >
            <option value="success">Success</option>
            <option value="failure">Failure, then retry</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-delay`}>Sample response time</FieldLabel>
          <Select
            id={`${id}-delay`}
            value={delay}
            disabled={pending}
            onChange={(event) => setDelay(event.target.value)}
          >
            <option value="150">Quick</option>
            <option value="3000">3 seconds</option>
          </Select>
        </Field>
      </FieldGrid>
      {authMessage && <p role="status">{authMessage}</p>}
      {queryFailed ? (
        <InvitationQueryErrorView onRetry={() => setQueryFailed(false)} />
      ) : (
        <InvitationPageView
          preview={preview}
          signedIn={!scenario.startsWith('signed-out')}
          sample
          onAccept={respond}
          onDecline={respond}
          authActions={{
            signIn: authButton('Sign in'),
            signUp: authButton('Create account'),
            switchAccount: authButton('Switch account'),
            refreshAccount: authButton('Refresh account'),
          }}
        />
      )}
    </>
  )
}

export function createInvitationSample(
  data: DashboardLabData,
  scenario: string,
): InvitationPreview {
  if (scenario === 'not-found') return { state: 'not_found' }
  const status: FoundInvitationPreview['status'] = scenario.startsWith('legacy')
    ? 'accepted_pending_subscription'
    : scenario.startsWith('accepted') || scenario === 'signed-out-accepted'
      ? 'accepted'
      : scenario.startsWith('declined')
        ? 'declined'
        : scenario === 'expired' || scenario === 'revoked'
          ? scenario
          : 'pending'
  return {
    state: 'found',
    stableId: data.stable._id,
    stableName:
      scenario === 'long'
        ? 'Sample Willow Creek Equestrian Centre and Country Riding Cooperative'
        : `Sample ${data.stable.name}`,
    stableLocation:
      scenario === 'long'
        ? 'Long Meadow Lane, North Pasture, Lower Valley, Sample County'
        : 'Sample countryside',
    inviterName:
      scenario === 'long'
        ? 'Alexandra Montgomery-Wetherby, sample stable administrator'
        : 'Sample administrator',
    emailHint: 'm***@example.com',
    role: 'member',
    status,
    expiresAt: Date.now() + (status === 'expired' ? -1 : 1) * 86400000,
    viewer:
      scenario === 'preparing' || scenario.startsWith('signed-out')
        ? null
        : {
            emailMatches: !['wrong-email', 'no-email'].includes(scenario),
            hasEmail: scenario !== 'no-email',
            isAcceptedByViewer:
              scenario === 'accepted' || scenario === 'legacy',
            isDeclinedByViewer: scenario === 'declined',
          },
  }
}
