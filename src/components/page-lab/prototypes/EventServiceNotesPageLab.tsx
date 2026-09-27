import { useState } from 'react'
import type { Id } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { EventHorseServiceDetailsView } from '#/components/events/EventHorseServiceDetailsCard'
import type { EventHorseDetailRow } from '#/components/events/EventHorseServiceDetailsCard'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { Button } from '#/components/ui/button'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

export function EventServiceNotesPageLab({ data }: { data: DashboardLabData }) {
  const sampleMode = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sampleMode) {
    return (
      <DashboardEmptyState>
        Service-note simulations are available only with development sample
        data.
      </DashboardEmptyState>
    )
  }
  return <SampleServiceNotes key={data.stable._id} data={data} />
}

function createRows(data: DashboardLabData): Array<EventHorseDetailRow> {
  return data.horses.map((horse, index) => ({
    horse,
    eventHorse: {
      _id: `lab-service-${horse._id}` as Id<'eventsHorses'>,
      _creationTime: 0,
      eventId: data.events[0]?._id ?? 'lab-service-event',
      horseId: horse._id,
      status: 'confirmed',
      requestedServiceNotes:
        index === 0
          ? 'Check the front shoes and discuss the next visit.'
          : undefined,
      completionNotes:
        index === 0
          ? 'Front shoes reset. Check comfort after turnout.'
          : undefined,
      costShare: index === 0 ? 85 : undefined,
    },
    canManage: index !== 2,
    canWithdraw: index !== 2,
  }))
}

function SampleServiceNotes({ data }: { data: DashboardLabData }) {
  const [rows, setRows] = useState(() => createRows(data))
  const [outcome, setOutcome] = useState('success')
  const [duration, setDuration] = useState('1200')
  const [scenario, setScenario] = useState('mixed')
  const [revision, setRevision] = useState(0)
  const [pending, setPending] = useState(0)
  const [message, setMessage] = useState(
    'Sample records only. Nothing is sent to the server.',
  )

  const simulate = async (apply: () => void, successMessage: string) => {
    setPending((count) => count + 1)
    setMessage('Sample request pending. No change has been applied yet.')
    try {
      await new Promise((resolve) =>
        window.setTimeout(resolve, Number(duration)),
      )
      if (outcome === 'failure') {
        setMessage('Sample request failed. No record was changed.')
        throw new Error('Simulated service-note request failure')
      }
      apply()
      setMessage(successMessage)
    } finally {
      setPending((count) => count - 1)
    }
  }

  const visibleRows =
    scenario === 'empty'
      ? []
      : rows.map((row) => ({
          ...row,
          canManage: scenario === 'read-only' ? false : row.canManage,
          canWithdraw: scenario === 'read-only' ? false : row.canWithdraw,
        }))

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Service notes interaction sample"
        description="The controls below simulate local outcomes using the real service-note UI. No live records or notifications are sent."
      />
      <DashboardSection>
        <FieldGrid>
          <Field>
            <FieldLabel htmlFor="service-sample-outcome">
              Next request outcome
            </FieldLabel>
            <Select
              id="service-sample-outcome"
              value={outcome}
              disabled={pending > 0}
              onChange={(event) => setOutcome(event.target.value)}
            >
              <option value="success">Success</option>
              <option value="failure">Failure, then retry</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="service-sample-duration">
              Sample response time
            </FieldLabel>
            <Select
              id="service-sample-duration"
              value={duration}
              disabled={pending > 0}
              onChange={(event) => setDuration(event.target.value)}
            >
              <option value="1200">1.2 seconds</option>
              <option value="6000">6 seconds — inspect pending state</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="service-sample-scenario">
              Sample permissions and content
            </FieldLabel>
            <Select
              id="service-sample-scenario"
              value={scenario}
              disabled={pending > 0}
              onChange={(event) => {
                setScenario(event.target.value)
                setRevision((value) => value + 1)
              }}
            >
              <option value="mixed">Notes, no notes and read-only horse</option>
              <option value="read-only">Read-only</option>
              <option value="empty">No horses</option>
            </Select>
          </Field>
        </FieldGrid>
        <DashboardActions>
          <Button
            variant="outline"
            disabled={pending > 0}
            onClick={() => {
              setRows(createRows(data))
              setRevision((value) => value + 1)
              setMessage(
                'Original sample restored. No live record was changed.',
              )
            }}
          >
            Reset sample records
          </Button>
        </DashboardActions>
        <p role="status">{message}</p>
      </DashboardSection>
      <EventHorseServiceDetailsView
        key={revision}
        rows={visibleRows}
        withdrawalDescription="This will mark the horse as withdrawn in this local sample. No organiser is notified and no live record changes."
        onSave={async (rowId, values) =>
          simulate(() => {
            setRows((current) =>
              current.map((row) =>
                row.eventHorse._id === rowId
                  ? { ...row, eventHorse: { ...row.eventHorse, ...values } }
                  : row,
              ),
            )
          }, 'Sample service notes saved locally. No live record was changed.')
        }
        onWithdraw={async (rowId) =>
          simulate(() => {
            setRows((current) =>
              current.map((row) =>
                row.eventHorse._id === rowId
                  ? {
                      ...row,
                      eventHorse: { ...row.eventHorse, status: 'withdrawn' },
                      canManage: false,
                      canWithdraw: false,
                    }
                  : row,
              ),
            )
          }, 'Horse withdrawn in this sample only. No notification was sent.')
        }
      />
    </DashboardPage>
  )
}
