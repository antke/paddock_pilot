import { useState } from 'react'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { StableSettingsOverviewContent } from '#/components/stables/StableSettingsOverview'
import { Button, ButtonLink } from '#/components/ui/button'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

export function StableOverviewPageLab({ data }: { data: DashboardLabData }) {
  const sample = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sample)
    return (
      <DashboardEmptyState>
        Overview simulations require development sample data.
      </DashboardEmptyState>
    )
  return <SampleOverview key={data.stable._id} data={data} />
}

function SampleOverview({ data }: { data: DashboardLabData }) {
  const [content, setContent] = useState('standard')
  const [outcome, setOutcome] = useState('failure')
  const [pending, setPending] = useState(false)
  const [archived, setArchived] = useState(false)
  const [message, setMessage] = useState(
    'Local sample only. Archiving here never changes live records.',
  )
  const stable =
    content === 'minimal'
      ? {
          ...data.stable,
          addressLine1: undefined,
          addressLine2: undefined,
          postcode: undefined,
          country: undefined,
          contactName: undefined,
          contactPhone: undefined,
          emergencyPhone: undefined,
          description: undefined,
          openingHours: undefined,
          yardRules: undefined,
        }
      : content === 'long'
        ? {
            ...data.stable,
            name: 'Stajnia Łąkowa — Northern Pastures Equestrian and Rehabilitation Centre',
            location: 'Lower Meadow, Northumberland countryside',
            addressLine1: 'North Pastures Equestrian and Rehabilitation Centre',
            addressLine2: 'Lower Meadow, behind the old mill',
            emergencyPhone: '+48 500 014 990',
            description:
              'A sample stable with shared care, rehabilitation and turnout facilities. Contact the yard manager before arranging a visit.',
            yardRules:
              'Close every gate after use.\nKeep the main entrance clear for emergency access.',
          }
        : data.stable
  return (
    <>
      <DashboardSection>
        <FieldGrid>
          <Field>
            <FieldLabel htmlFor="overview-content">Sample content</FieldLabel>
            <Select
              id="overview-content"
              value={content}
              disabled={pending}
              onChange={(event) => setContent(event.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="long">Long details</option>
              <option value="minimal">Minimal details</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="overview-outcome">
              Sample archive response
            </FieldLabel>
            <Select
              id="overview-outcome"
              value={outcome}
              disabled={pending}
              onChange={(event) => setOutcome(event.target.value)}
            >
              <option value="failure">Failure</option>
              <option value="success">Success</option>
            </Select>
          </Field>
        </FieldGrid>
        <p role="status">{message}</p>
      </DashboardSection>
      {archived ? (
        <DashboardEmptyState
          title="Sample stable archived"
          actions={
            <Button
              onClick={() => {
                setArchived(false)
                setMessage('Sample restored. No live record changed.')
              }}
            >
              Reset sample
            </Button>
          }
        >
          Only this local preview changed.
        </DashboardEmptyState>
      ) : (
        <StableSettingsOverviewContent
          stable={stable}
          owner={{
            _id: data.stable.ownerId,
            firstName: 'Mae',
            lastName: 'Turner',
            email: 'mae@example.com',
          }}
          editAction={
            <ButtonLink
              to="/page-lab/$page"
              params={{ page: 'stable-form' }}
              action="edit"
              variant="outline"
            >
              Edit stable
            </ButtonLink>
          }
          onArchive={async () => {
            setPending(true)
            setMessage(
              'Sample request pending. Archiving has not been confirmed.',
            )
            await new Promise((resolve) => window.setTimeout(resolve, 3000))
            setPending(false)
            if (outcome === 'failure') {
              setMessage('Sample request failed. No record changed.')
              return false
            }
            setArchived(true)
            setMessage('Sample archive confirmed. No live record changed.')
            return true
          }}
        />
      )}
    </>
  )
}
