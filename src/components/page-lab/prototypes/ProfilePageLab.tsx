import { useEffect, useId, useRef, useState } from 'react'
import { AccountProfileFormView } from '#/components/onboarding/AccountProfileForm'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

export function ProfilePageLab() {
  const sampleMode = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sampleMode)
    return (
      <DashboardEmptyState>
        Profile samples require development sample data.
      </DashboardEmptyState>
    )
  return <LocalProfile />
}
function LocalProfile() {
  const id = useId()
  const [outcome, setOutcome] = useState('success')
  const [delay, setDelay] = useState('150')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState(
    'Sample profile only. Selected files stay on this device; no upload or profile mutation runs.',
  )
  const [profile, setProfile] = useState({
    displayName: 'Sample rider',
    phone: '+48 555 010 010',
  })
  const epoch = useRef(0)
  const failContinuation = useRef(false)
  useEffect(() => {
    epoch.current += 1
    return () => {
      epoch.current += 1
    }
  }, [])
  const wait = async () => {
    const current = epoch.current
    await new Promise((resolve) => window.setTimeout(resolve, Number(delay)))
    if (current !== epoch.current)
      throw new Error('Sample left before completion')
  }
  return (
    <div className="grid gap-6">
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor={`${id}-outcome`}>Next sample save</FieldLabel>
          <Select
            id={`${id}-outcome`}
            disabled={pending}
            value={outcome}
            onChange={(event) => setOutcome(event.target.value)}
          >
            <option value="success">Success</option>
            <option value="failure">Save failure, then retry</option>
            <option value="continue">Save succeeds, continuation fails</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-delay`}>Sample response time</FieldLabel>
          <Select
            id={`${id}-delay`}
            disabled={pending}
            value={delay}
            onChange={(event) => setDelay(event.target.value)}
          >
            <option value="150">0.15 seconds</option>
            <option value="1500">1.5 seconds</option>
            <option value="6000">6 seconds</option>
          </Select>
        </Field>
      </FieldGrid>
      <p role="status">{message}</p>
      <DashboardPage>
        <DashboardPageHeader title="Your profile" />
        <DashboardSectionCard title="Profile details" contentGap="comfortable">
          <AccountProfileFormView
            initialValues={profile}
            submitLabel="Save profile"
            onPendingChange={setPending}
            onSave={async (values) => {
              const next = outcome
              setOutcome('success')
              setMessage('Sample save pending. Nothing has changed yet.')
              await wait()
              if (next === 'failure') {
                setMessage('Sample save failed. Your draft is retained.')
                return false
              }
              setProfile({
                displayName: values.preferredName,
                phone: values.phone ?? '',
              })
              failContinuation.current = next === 'continue'
              setMessage('Sample profile saved locally. No file was uploaded.')
              return true
            }}
            onSaved={async () => {
              if (failContinuation.current) {
                failContinuation.current = false
                throw new Error('Sample continuation failed')
              }
              setMessage(
                'Sample profile acknowledged and continuation finished. No live data changed.',
              )
            }}
          />
        </DashboardSectionCard>
      </DashboardPage>
    </div>
  )
}
