import { useState } from 'react'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import type { Id } from 'convex/_generated/dataModel'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DeletedHorsesView } from '#/components/stables/DeletedHorsesCard'
import type { DeletedHorse } from '#/components/stables/DeletedHorsesCard'
import { Button } from '#/components/ui/button'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

function sampleHorses(data: DashboardLabData): Array<DeletedHorse> {
  const now = Date.now()
  const day = 86_400_000
  return [
    { name: 'Willow', deletedDaysAgo: 3, canPermanentlyDelete: false },
    {
      name: 'Cedar Ridge Evening Star with a Long Registered Name',
      deletedDaysAgo: 16,
      canPermanentlyDelete: true,
    },
    { name: 'Maple', deletedDaysAgo: 20, canPermanentlyDelete: true },
  ].map((sample, index) => ({
    _id: `lab-deleted-horse-${index}` as Id<'horses'>,
    _creationTime: 0,
    stableId: data.stable._id,
    ownerId: data.stable.ownerId,
    name: sample.name,
    age: 9,
    deletedAt: now - sample.deletedDaysAgo * day,
    purgeAt: now + (14 - sample.deletedDaysAgo) * day,
    canPermanentlyDelete: sample.canPermanentlyDelete,
  }))
}

export function DeletedHorsesPageLab({
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
        Deleted-horse simulations are available only with development sample
        data.
      </DashboardEmptyState>
    )
  return (
    <SampleDeletedHorses
      key={data.stable._id}
      data={data}
      embedded={embedded}
    />
  )
}

function SampleDeletedHorses({
  data,
  embedded,
}: {
  data: DashboardLabData
  embedded: boolean
}) {
  const [horses, setHorses] = useState(() => sampleHorses(data))
  const [outcome, setOutcome] = useState('success')
  const [duration, setDuration] = useState('1200')
  const [access, setAccess] = useState('owner')
  const [pending, setPending] = useState(0)
  const [revision, setRevision] = useState(0)
  const [message, setMessage] = useState(
    'Sample records only. No live horses or associated records will change.',
  )
  const simulate = async (
    horse: DeletedHorse,
    action: 'restore' | 'delete',
  ) => {
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
      setHorses((current) => current.filter((item) => item._id !== horse._id))
      setMessage(
        action === 'restore'
          ? `${horse.name} restored in this sample only.`
          : `${horse.name} permanently removed from this sample only. No live record was changed.`,
      )
    } finally {
      setPending((count) => count - 1)
    }
  }
  return (
    <DashboardPage>
      {!embedded && (
        <DashboardPageHeader
          title="Deleted horses sample"
          description="These local records cover a recent deletion and expired retention windows. Restore and permanent delete are simulated; no live horses or linked records are changed."
        />
      )}
      <DashboardSection>
        <FieldGrid>
          <Field>
            <FieldLabel htmlFor="deleted-sample-outcome">
              Next request outcome
            </FieldLabel>
            <Select
              id="deleted-sample-outcome"
              value={outcome}
              disabled={pending > 0}
              onChange={(event) => setOutcome(event.target.value)}
            >
              <option value="success">Success</option>
              <option value="failure">Failure, then retry</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="deleted-sample-duration">
              Sample response time
            </FieldLabel>
            <Select
              id="deleted-sample-duration"
              value={duration}
              disabled={pending > 0}
              onChange={(event) => setDuration(event.target.value)}
            >
              <option value="1200">1.2 seconds</option>
              <option value="6000">6 seconds — inspect pending state</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="deleted-sample-access">
              Sample permissions
            </FieldLabel>
            <Select
              id="deleted-sample-access"
              value={access}
              disabled={pending > 0}
              onChange={(event) => {
                setAccess(event.target.value)
                setRevision((value) => value + 1)
              }}
            >
              <option value="owner">Stable owner</option>
              <option value="member">Horse owner — restore only</option>
            </Select>
          </Field>
        </FieldGrid>
        <Button
          variant="outline"
          disabled={pending > 0}
          onClick={() => {
            setHorses([])
            setRevision((value) => value + 1)
            setMessage('Empty sample. No live record was changed.')
          }}
        >
          Show empty sample
        </Button>
        <Button
          variant="outline"
          disabled={pending > 0}
          onClick={() => {
            setHorses(sampleHorses(data))
            setRevision((value) => value + 1)
            setMessage('Original sample restored. No live record was changed.')
          }}
        >
          Reset sample records
        </Button>
        <p role="status">{message}</p>
      </DashboardSection>
      <DeletedHorsesView
        key={revision}
        horses={horses.map((horse) => ({
          ...horse,
          canPermanentlyDelete:
            access === 'owner' && horse.canPermanentlyDelete,
        }))}
        onRestore={(horse) => simulate(horse, 'restore')}
        onPermanentlyDelete={(horse) => simulate(horse, 'delete')}
      />
    </DashboardPage>
  )
}
