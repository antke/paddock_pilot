import { useId, useRef, useState } from 'react'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  StableMembersSettingsCardView,
  RemoveMemberButtonView,
} from '#/components/stables/StableMembersSettingsCard'
import { StableMemberDetailsFormView } from '#/components/stables/StableMemberDetailsForm'
import { StableInviteFormView } from '#/components/stables/StableInviteForm'
import { StableInvitationsListView } from '#/components/stables/StableInvitationsList'
import type { StableSettingsData } from '#/components/stables/stableSettingsTypes'
import { Button } from '#/components/ui/button'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

function sampleMembers(
  data: DashboardLabData,
  count: number,
): StableSettingsData['members'] {
  const owner = {
    membership: null,
    user: {
      _id: data.stable.ownerId,
      firstName: 'Sample Mae',
      email: 'mae@example.test',
    },
    role: 'owner' as const,
  }
  return [
    owner,
    ...Array.from({ length: count - 1 }, (_, index) => {
      const userId = `sample-member-user-${index}` as Id<'users'>
      const name =
        index === 0
          ? 'Sample Rae'
          : index === 1
            ? 'Sample Alexandrina Montgomery-Wetherby'
            : `Sample member ${index + 1}`
      return {
        membership: {
          _id: `sample-membership-${index}` as Id<'stableMembers'>,
          _creationTime: 0,
          stableId: data.stable._id,
          userId,
          role: 'member' as const,
          phone: index === 0 ? '+44 7700 900123' : undefined,
          emergencyContact:
            index === 0 ? 'Sample Alex · +44 7700 900456' : undefined,
        },
        user: {
          _id: userId,
          firstName: name,
          email:
            index === 1
              ? `${'long-contact-name-'.repeat(4)}@example.test`
              : `member-${index + 1}@example.test`,
        },
        role: 'member' as const,
      }
    }),
  ]
}
function sampleInvitations(
  data: DashboardLabData,
): Array<Doc<'stableInvitations'>> {
  const now = Date.now()
  const statuses = [
    'pending',
    'pending',
    'expired',
    'accepted',
    'accepted_pending_subscription',
    'declined',
    'revoked',
  ] as const
  return statuses.map((status, index) => ({
    _id: `sample-invitation-${index}` as Id<'stableInvitations'>,
    _creationTime: now,
    stableId: data.stable._id,
    email:
      index === 1
        ? `${'long-invitation-address-'.repeat(4)}@example.test`
        : `invite-${index + 1}@example.test`,
    role: 'member',
    status,
    token: `sample-token-${index}`,
    invitedBy: data.stable.ownerId,
    createdAt: now,
    updatedAt: now,
    expiresAt: now + (status === 'expired' ? -1 : 7) * 86400000,
    deliveryStatus:
      index === 1
        ? 'failed'
        : index === 0
          ? 'queued'
          : index === 6
            ? 'skipped'
            : 'sent',
    deliveryError:
      index === 1
        ? 'Sample email delivery failed. Resend to try again.'
        : undefined,
  }))
}
function sampleHorses(data: DashboardLabData): Array<Doc<'horses'>> {
  return ['Sample Clover', 'Sample Willow'].map((name, index) => ({
    _id: `sample-member-horse-${index}` as Id<'horses'>,
    _creationTime: 0,
    stableId: data.stable._id,
    ownerId: 'sample-member-user-0' as Id<'users'>,
    name,
    age: 8,
  }))
}

export function MembersSettingsPageLab({
  data,
  embedded = false,
}: {
  data: DashboardLabData
  embedded?: boolean
}) {
  const sampleMode = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sampleMode)
    return (
      <DashboardEmptyState>
        Member simulations are available only with development sample data.
      </DashboardEmptyState>
    )
  return (
    <SampleMembersSettings
      key={data.stable._id}
      data={data}
      embedded={embedded}
    />
  )
}

function SampleMembersSettings({
  data,
  embedded,
}: {
  data: DashboardLabData
  embedded: boolean
}) {
  const formId = useId()
  const [members, setMembers] = useState(() => sampleMembers(data, 3))
  const [invitations, setInvitations] = useState(() => sampleInvitations(data))
  const [horses, setHorses] = useState(() => sampleHorses(data))
  const [outcome, setOutcome] = useState('success')
  const outcomeRef = useRef('success')
  const [duration, setDuration] = useState('1200')
  const [pending, setPending] = useState(0)
  const [revision, setRevision] = useState(0)
  const invitationCount = useRef(20)
  const [message, setMessage] = useState(
    'Sample members and invitations only. No accounts, email, clipboard or live horses will change.',
  )
  const perform = async (successMessage: string, apply: () => void) => {
    const nextOutcome = outcomeRef.current
    outcomeRef.current = 'success'
    setOutcome('success')
    setPending((value) => value + 1)
    setMessage('Sample request pending. No change has been applied yet.')
    try {
      await new Promise((resolve) =>
        window.setTimeout(resolve, Number(duration)),
      )
      if (nextOutcome !== 'success') {
        setMessage(
          'Sample request failed. No local change was applied. The next attempt will succeed.',
        )
        if (nextOutcome === 'reject') throw new Error('Sample rejected request')
        return false
      }
      apply()
      setMessage(successMessage)
      return true
    } finally {
      setPending((value) => value - 1)
    }
  }
  const reset = (count: number) => {
    setMembers(sampleMembers(data, count))
    setInvitations(count === 1 ? [] : sampleInvitations(data))
    setHorses(count === 1 ? [] : sampleHorses(data))
    setRevision((value) => value + 1)
    setMessage(`${count} sample members loaded. No live records were changed.`)
  }
  return (
    <DashboardPage>
      {!embedded && (
        <DashboardPageHeader
          title="Members settings sample"
          description="The actual member settings composition, with local requests and clearly fictional records."
        />
      )}
      <DashboardSection>
        <FieldGrid>
          <Field>
            <FieldLabel htmlFor={`${formId}-outcome`}>
              Next sample request
            </FieldLabel>
            <Select
              id={`${formId}-outcome`}
              value={outcome}
              disabled={pending > 0}
              onChange={(event) => {
                setOutcome(event.target.value)
                outcomeRef.current = event.target.value
              }}
            >
              <option value="success">Success</option>
              <option value="failure">Failure, then retry</option>
              <option value="reject">Rejected request, then retry</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${formId}-duration`}>
              Sample response time
            </FieldLabel>
            <Select
              id={`${formId}-duration`}
              value={duration}
              disabled={pending > 0}
              onChange={(event) => setDuration(event.target.value)}
            >
              <option value="100">0.1 seconds</option>
              <option value="1200">1.2 seconds</option>
              <option value="6000">6 seconds — inspect pending state</option>
            </Select>
          </Field>
        </FieldGrid>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={pending > 0}
            onClick={() => reset(3)}
          >
            Reset sample
          </Button>
          <Button
            variant="outline"
            disabled={pending > 0}
            onClick={() => reset(50)}
          >
            Show 50 members
          </Button>
          <Button
            variant="outline"
            disabled={pending > 0}
            onClick={() => reset(1)}
          >
            Owner only, no invitations
          </Button>
        </div>
        <p role="status">{message}</p>
      </DashboardSection>
      <StableMembersSettingsCardView
        key={revision}
        stableName={data.stable.name}
        members={members}
        horses={horses}
        renderInviteForm={(props) => (
          <StableInviteFormView
            {...props}
            onInvite={(values) =>
              perform(
                `Invitation for ${values.email} added locally. No email was sent.`,
                () => {
                  const now = Date.now()
                  const id = ++invitationCount.current
                  setInvitations((current) => [
                    {
                      _id: `sample-created-${id}` as Id<'stableInvitations'>,
                      _creationTime: now,
                      stableId: data.stable._id,
                      email: values.email,
                      role: values.role,
                      status: 'pending',
                      token: `sample-created-${id}`,
                      invitedBy: data.stable.ownerId,
                      createdAt: now,
                      updatedAt: now,
                      expiresAt: now + 7 * 86400000,
                      deliveryStatus: 'queued',
                    },
                    ...current,
                  ])
                },
              )
            }
          />
        )}
        renderDetailsForm={(props) => (
          <StableMemberDetailsFormView
            {...props}
            onSave={(values) =>
              perform('Member details updated in this sample only.', () =>
                setMembers((current) =>
                  current.map((person) =>
                    person.membership?._id === props.member._id
                      ? {
                          ...person,
                          membership: { ...person.membership, ...values },
                        }
                      : person,
                  ),
                ),
              )
            }
          />
        )}
        renderRemoveMember={(props) => (
          <RemoveMemberButtonView
            {...props}
            onRemove={(newOwner) =>
              perform(
                `Member removed from this sample. ${props.horses.length} horses reassigned locally. No live access changed.`,
                () => {
                  setMembers((current) =>
                    current.filter(
                      (person) =>
                        person.membership?._id !== props.membership._id,
                    ),
                  )
                  if (newOwner)
                    setHorses((current) =>
                      current.map((horse) =>
                        horse.ownerId === props.membership.userId
                          ? { ...horse, ownerId: newOwner }
                          : horse,
                      ),
                    )
                },
              )
            }
          />
        )}
        invitations={
          <StableInvitationsListView
            invitations={invitations}
            onResend={(invitation) =>
              perform(
                `Fresh link created for ${invitation.email} in this sample only. No email was sent.`,
                () =>
                  setInvitations((current) =>
                    current.map((item) =>
                      item._id === invitation._id
                        ? {
                            ...item,
                            status: 'pending',
                            token: `${item.token}-renewed`,
                            deliveryStatus: 'queued',
                            deliveryError: undefined,
                            expiresAt: Date.now() + 7 * 86400000,
                          }
                        : item,
                    ),
                  ),
              )
            }
            onRevoke={(invitation) =>
              perform('Invitation revoked in this sample only.', () =>
                setInvitations((current) =>
                  current.map((item) =>
                    item._id === invitation._id
                      ? { ...item, status: 'revoked' }
                      : item,
                  ),
                ),
              )
            }
            onCopy={async (token) => {
              if (
                !(await perform(
                  `Sample link: https://example.test/invite/${token}. Copy was simulated; your clipboard was not changed.`,
                  () => {},
                ))
              )
                throw new Error('Sample copy failed')
            }}
          />
        }
      />
    </DashboardPage>
  )
}
