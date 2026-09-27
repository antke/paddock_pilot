import { useRef, useState } from 'react'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { StableProvidersView } from '#/components/stables/StableProvidersCard'
import { Button } from '#/components/ui/button'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

function sampleProviders(
  data: DashboardLabData,
): Array<Doc<'stableProviders'>> {
  return [
    {
      name: 'Dr. Halley Morse',
      type: 'vet' as const,
      phone: '+48 500 014 330',
      email: 'halley@example.com',
      notes: 'Routine care and emergency visits. Call before sending records.',
    },
    {
      name: 'North County Equine Dental and Preventive Care',
      type: 'dentist' as const,
      phone: '+48 500 014 192',
      email: 'appointments.north.county.equine@example.com',
      notes: 'Annual dental checks. Share the horse list before booking.',
    },
    {
      name: 'Ben Carter',
      type: 'farrier' as const,
      phone: '+48 500 014 190',
      email: '',
      notes: '',
    },
  ].map((provider, index) => ({
    ...provider,
    _id: `lab-provider-${index}` as Id<'stableProviders'>,
    _creationTime: 0,
    stableId: data.stable._id,
    createdBy: data.stable.ownerId,
    createdAt: 0,
    updatedAt: 0,
  }))
}

export function ProvidersPageLab({
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
        Provider simulations are available only with development sample data.
      </DashboardEmptyState>
    )
  return (
    <SampleProviders key={data.stable._id} data={data} embedded={embedded} />
  )
}

function SampleProviders({
  data,
  embedded,
}: {
  data: DashboardLabData
  embedded: boolean
}) {
  const [providers, setProviders] = useState(() => sampleProviders(data))
  const [scenario, setScenario] = useState('manage')
  const [outcome, setOutcome] = useState('success')
  const [duration, setDuration] = useState('1200')
  const [pending, setPending] = useState(0)
  const [revision, setRevision] = useState(0)
  const [message, setMessage] = useState(
    'Sample records only. No live provider records will change.',
  )
  const sequence = useRef(3)
  const simulate = async (apply: () => void, success: string) => {
    setPending((count) => count + 1)
    setMessage('Sample request pending. No change has been applied yet.')
    try {
      await new Promise((resolve) =>
        window.setTimeout(resolve, Number(duration)),
      )
      if (outcome === 'failure') {
        setOutcome('success')
        setMessage(
          'Sample request failed. No record was changed. The next attempt will succeed.',
        )
        throw new Error('Simulated request failure')
      }
      apply()
      setMessage(success)
    } finally {
      setPending((count) => count - 1)
    }
  }
  return (
    <DashboardPage>
      {!embedded && (
        <DashboardPageHeader
          title="Provider directory sample"
          description="Use the real directory controls with local sample records. Saves and removals are simulated; no server requests or notifications are sent."
        />
      )}
      <DashboardSection>
        <FieldGrid>
          <Field>
            <FieldLabel htmlFor="provider-sample-outcome">
              Next request outcome
            </FieldLabel>
            <Select
              id="provider-sample-outcome"
              disabled={pending > 0}
              value={outcome}
              onChange={(event) => setOutcome(event.target.value)}
            >
              <option value="success">Success</option>
              <option value="failure">Failure, then retry</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="provider-sample-duration">
              Sample response time
            </FieldLabel>
            <Select
              id="provider-sample-duration"
              disabled={pending > 0}
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            >
              <option value="1200">1.2 seconds</option>
              <option value="6000">6 seconds — inspect pending state</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="provider-sample-access">
              Sample access
            </FieldLabel>
            <Select
              id="provider-sample-access"
              disabled={pending > 0}
              value={scenario}
              onChange={(event) => {
                setScenario(event.target.value)
                setRevision((value) => value + 1)
              }}
            >
              <option value="manage">Can manage providers</option>
              <option value="read-only">Read-only</option>
            </Select>
          </Field>
        </FieldGrid>
        <Button
          variant="outline"
          disabled={pending > 0}
          onClick={() => {
            setProviders([])
            setRevision((value) => value + 1)
            setMessage(
              'Directory cleared in this sample only. You can add a sample provider.',
            )
          }}
        >
          Show empty sample
        </Button>
        <Button
          variant="outline"
          disabled={pending > 0}
          onClick={() => {
            setProviders(sampleProviders(data))
            setRevision((value) => value + 1)
            setMessage('Original sample restored. No live record was changed.')
          }}
        >
          Reset sample records
        </Button>
        <p role="status">{message}</p>
      </DashboardSection>
      <StableProvidersView
        key={revision}
        providers={providers}
        canManage={scenario === 'manage'}
        onAdd={async (values) =>
          simulate(() => {
            setProviders((current) => [
              ...current,
              {
                ...values,
                _id: `lab-provider-${sequence.current++}` as Id<'stableProviders'>,
                _creationTime: 0,
                stableId: data.stable._id,
                createdBy: data.stable.ownerId,
                createdAt: 0,
                updatedAt: 0,
              },
            ])
          }, 'Provider added locally. No live record was changed.')
        }
        onUpdate={async (provider, values) =>
          simulate(() => {
            setProviders((current) =>
              current.map((item) =>
                item._id === provider._id ? { ...item, ...values } : item,
              ),
            )
          }, 'Provider updated locally. No live record was changed.')
        }
        onRemove={async (provider) =>
          simulate(() => {
            setProviders((current) =>
              current.filter((item) => item._id !== provider._id),
            )
          }, 'Provider removed from this sample only.')
        }
      />
    </DashboardPage>
  )
}
