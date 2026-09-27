import { useEffect, useRef, useState } from 'react'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { PendingHorseInvitationList } from '#/components/dashboard/PendingHorseInvitationList'
import type { PendingHorseInvitation } from '#/components/dashboard/PendingHorseInvitationList'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'

type Props = { data: DashboardLabData }
export function HorseInvitationsPageLab({ data }: Props) {
  const sampleMode = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sampleMode) {
    return (
      <DashboardEmptyState>
        Invitation simulations are available only with development sample data.
      </DashboardEmptyState>
    )
  }
  return <SampleControls key={data.stable._id} data={data} />
}
function SampleControls({ data }: Props) {
  const [scenario, setScenario] = useState('populated')
  return (
    <DashboardPage>
      <DashboardPageHeader title="Invitation review" />
      <p className="text-sm text-muted-foreground">
        Sample event invitations. Approve and decline update this preview only;
        no real invitation is changed or sent.
      </p>
      <Field>
        <FieldLabel htmlFor="horse-invitation-scenario">
          Sample invitations
        </FieldLabel>
        <Select
          id="horse-invitation-scenario"
          value={scenario}
          onChange={(event) => setScenario(event.target.value)}
        >
          <option value="populated">Three pending invitations</option>
          <option value="long">Long names and event titles</option>
          <option value="empty">Empty</option>
        </Select>
      </Field>
      <InvitationSample key={scenario} data={data} scenario={scenario} />
    </DashboardPage>
  )
}
function InvitationSample({ data, scenario }: Props & { scenario: string }) {
  const [outcome, setOutcome] = useState('success')
  const [delay, setDelay] = useState('150')
  const [pending, setPending] = useState(0)
  const generation = useRef(0)
  useEffect(
    () => () => {
      generation.current += 1
    },
    [],
  )
  const [invitations, setInvitations] = useState(() =>
    createHorseInvitationSamples(data, scenario),
  )
  const respond = async (id: PendingHorseInvitation['invitation']['_id']) => {
    const current = generation.current
    setPending((count) => count + 1)
    try {
      await new Promise((resolve) => setTimeout(resolve, Number(delay)))
      if (current !== generation.current) throw new Error('Sample changed')
      if (outcome === 'failure') {
        setOutcome('success')
        throw new Error('Sample failure')
      }
      setInvitations((items) =>
        items.filter((item) => item.invitation._id !== id),
      )
    } finally {
      if (current === generation.current) setPending((count) => count - 1)
    }
  }
  return (
    <>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor="horse-invitation-result">
            Next sample result
          </FieldLabel>
          <Select
            id="horse-invitation-result"
            disabled={pending > 0}
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
          >
            <option value="success">Success</option>
            <option value="failure">Failure, then retry</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="horse-invitation-delay">
            Sample response time
          </FieldLabel>
          <Select
            id="horse-invitation-delay"
            disabled={pending > 0}
            value={delay}
            onChange={(event) => setDelay(event.target.value)}
          >
            <option value="150">Quick response</option>
            <option value="3000">3 seconds — inspect pending</option>
          </Select>
        </Field>
      </FieldGrid>
      <PendingHorseInvitationList
        showWhenEmpty
        invitations={invitations}
        onApprove={respond}
        onDecline={respond}
      />
    </>
  )
}
export function createHorseInvitationSamples(
  data: DashboardLabData,
  scenario = 'populated',
): Array<PendingHorseInvitation> {
  const horse = data.horses[0]
  const event = data.events[0]
  if (scenario === 'empty' || !horse || !event) return []
  return Array.from({ length: 3 }, (_, index) => {
    const sampleHorse = data.horses[index] ?? horse
    const sampleEvent = data.events[index] ?? event
    return {
      horse: {
        ...sampleHorse,
        name:
          scenario === 'long'
            ? `${sampleHorse.name} of the Northern Pastures and Cedar Ridge`
            : sampleHorse.name,
      },
      event: {
        ...sampleEvent,
        title:
          scenario === 'long'
            ? 'Sample combined follow-up visit and autumn care planning appointment for the whole yard'
            : `Sample ${sampleEvent.title}`,
      },
      invitation: {
        _id: `sample-horse-invitation-${index}` as PendingHorseInvitation['invitation']['_id'],
        _creationTime: Date.now(),
        eventId: sampleEvent._id,
        horseId: sampleHorse._id,
        status: 'invited',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        invitedAt: Date.now(),
        invitedBy: data.stable.ownerId,
      },
    }
  })
}
