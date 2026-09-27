import { useState } from 'react'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import {
  MemberStableWelcomePage,
  OwnerStableWelcomePage,
} from '#/components/stables/StableWelcomePage'
import { StableMemberDetailsFormView } from '#/components/stables/StableMemberDetailsForm'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'

type WelcomeScenario =
  'owner-new' | 'owner-progress' | 'owner-ready' | 'member-new' | 'member-ready'

export function StableWelcomePageLab({ data }: { data: DashboardLabData }) {
  return <WelcomeSample key={data.stable._id} data={data} />
}

function WelcomeSample({ data }: { data: DashboardLabData }) {
  const [scenario, setScenario] = useState<WelcomeScenario>('owner-progress')
  return (
    <div className="grid gap-6">
      <Field>
        <FieldLabel htmlFor="welcome-sample-scenario">
          Sample welcome state
        </FieldLabel>
        <Select
          id="welcome-sample-scenario"
          value={scenario}
          onChange={(event) =>
            setScenario(event.target.value as WelcomeScenario)
          }
        >
          <option value="owner-new">Owner — no setup completed</option>
          <option value="owner-progress">
            Owner — details and first horse ready
          </option>
          <option value="owner-ready">Owner — setup complete</option>
          <option value="member-new">Member — needs details and a horse</option>
          <option value="member-ready">Member — setup complete</option>
        </Select>
      </Field>
      <p className="text-sm text-muted-foreground">
        Sample setup · Forms update this preview only. Links lead to the real
        app and may require sign-in; sample data is not saved there.
      </p>
      <WelcomeScenarioPreview key={scenario} data={data} scenario={scenario} />
    </div>
  )
}

function WelcomeScenarioPreview({
  data,
  scenario,
}: {
  data: DashboardLabData
  scenario: WelcomeScenario
}) {
  const [outcome, setOutcome] = useState('success')
  const [status, setStatus] = useState<'idle' | 'success' | 'failure'>('idle')
  const [member, setMember] = useState<Doc<'stableMembers'>>({
    _id: `sample-welcome-member-${data.stable._id}` as Id<'stableMembers'>,
    _creationTime: 0,
    stableId: data.stable._id,
    userId: 'sample-welcome-user' as Id<'users'>,
    role: 'member',
    displayNameOverride: 'Alex Morgan',
    phone: scenario === 'member-ready' ? '(555) 010-2210' : '',
    emergencyContact:
      scenario === 'member-ready' ? 'Sam Morgan, (555) 010-2211' : '',
  })

  if (scenario.startsWith('owner-')) {
    const blank = scenario === 'owner-new'
    const ready = scenario === 'owner-ready'
    return (
      <OwnerStableWelcomePage
        stable={{
          ...data.stable,
          contactName: blank ? undefined : 'Alex Morgan',
          contactPhone: blank ? undefined : data.stable.contactPhone,
          emergencyPhone: blank ? undefined : data.stable.emergencyPhone,
          openingHours: blank ? undefined : data.stable.openingHours,
          yardRules: blank ? undefined : data.stable.yardRules,
        }}
        horseCount={blank ? 0 : 1}
        memberCount={ready ? 2 : 0}
        invitationCount={0}
        providerCount={ready ? 2 : 0}
      />
    )
  }

  return (
    <>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor="welcome-sample-outcome">
            Next sample save
          </FieldLabel>
          <Select
            id="welcome-sample-outcome"
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
          >
            <option value="success">Success</option>
            <option value="failure">Failure, then retry</option>
          </Select>
        </Field>
      </FieldGrid>
      {status === 'success' ? (
        <p role="status" className="text-sm text-foreground">
          Member details applied locally. No live membership was saved.
        </p>
      ) : null}
      {status === 'failure' ? (
        <Alert variant="destructive">
          <AlertTitle>Sample save failed</AlertTitle>
          <AlertDescription>
            Your entries are still in the form. Save again to simulate a
            successful retry.
          </AlertDescription>
        </Alert>
      ) : null}
      <MemberStableWelcomePage
        stable={data.stable}
        member={member}
        ownHorseCount={scenario === 'member-ready' ? 1 : 0}
        renderDetailsForm={(props) => (
          <StableMemberDetailsFormView
            {...props}
            onSave={async (values) => {
              if (outcome === 'failure') {
                setOutcome('success')
                setStatus('failure')
                return false
              }
              setMember((current) => ({ ...current, ...values }))
              setStatus('success')
              return true
            }}
          />
        )}
      />
    </>
  )
}
