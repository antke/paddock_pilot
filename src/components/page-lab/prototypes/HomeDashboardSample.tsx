import { useEffect, useId, useRef, useState } from 'react'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { createDashboardCommandData } from '#/components/dashboard/command-center/dashboardData'
import { AppDashboardView } from '#/components/dashboard/AppDashboardView'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { Button } from '#/components/ui/button'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { createHorseInvitationSamples } from './HorseInvitationsPageLab'

export function HomeDashboardSample({ data }: { data: DashboardLabData }) {
  const fixture = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !fixture) {
    return (
      <DashboardEmptyState>
        Signed-in home simulations are available only with development sample
        data.
      </DashboardEmptyState>
    )
  }
  return <HomeSampleControls key={data.stable._id} data={data} />
}

function HomeSampleControls({ data }: { data: DashboardLabData }) {
  const [scenario, setScenario] = useState('invitations')
  const [revision, setRevision] = useState(0)
  const scenarioId = useId()
  return (
    <div className="grid gap-6">
      <DashboardInlinePanel chrome="flat">
        <p>
          Fictional signed-in home. Invitation responses stay in this preview;
          no live invitations are changed. Data stable changes this composition
          without updating your account’s preferred stable.
        </p>
        <FieldGrid>
          <Field>
            <FieldLabel htmlFor={scenarioId}>Sample home state</FieldLabel>
            <Select
              id={scenarioId}
              value={scenario}
              onChange={(event) => setScenario(event.target.value)}
            >
              <option value="invitations">
                Dashboard with horse invitations
              </option>
              <option value="empty-invitations">
                Dashboard without invitations
              </option>
              <option value="no-stables">
                No stables — defensive fallback
              </option>
            </Select>
          </Field>
          <Button
            type="button"
            variant="outline"
            onClick={() => setRevision((value) => value + 1)}
          >
            Restart home sample
          </Button>
        </FieldGrid>
      </DashboardInlinePanel>
      {scenario === 'no-stables' ? (
        <>
          <p className="text-sm text-muted-foreground">
            This previews the dashboard’s defensive fallback. The normal
            signed-in home route sends an account without stables to onboarding
            first.
          </p>
          <AppDashboardView />
        </>
      ) : (
        <LocalHomeDashboard
          key={scenario + ':' + revision}
          data={data}
          withInvitations={scenario === 'invitations'}
        />
      )}
    </div>
  )
}

function LocalHomeDashboard({
  data,
  withInvitations,
}: {
  data: DashboardLabData
  withInvitations: boolean
}) {
  const { today } = useLocalDateContext()
  const [outcome, setOutcome] = useState('success')
  const outcomeRef = useRef('success')
  const [delay, setDelay] = useState('150')
  const [pending, setPending] = useState(0)
  const outcomeId = useId()
  const delayId = useId()
  const mounted = useRef(false)
  const timers = useRef(new Map<ReturnType<typeof setTimeout>, () => void>())
  useEffect(() => {
    mounted.current = true
    const active = timers.current
    return () => {
      mounted.current = false
      active.forEach((cancel, timer) => {
        clearTimeout(timer)
        cancel()
      })
      active.clear()
    }
  }, [])
  const [invitations] = useState(() => {
    if (!withInvitations) return []
    // Include a different stable deliberately: the production view owns filtering.
    return createHorseInvitationSamples(createDashboardLabFixtureData()).map(
      (item, index) => ({
        ...item,
        event: item.event
          ? {
              ...item.event,
              stableId:
                data.stables[index === 2 ? 1 : 0]?._id ?? data.stable._id,
            }
          : item.event,
      }),
    )
  })
  const respond = () =>
    new Promise<void>((resolve, reject) => {
      const failed = outcomeRef.current === 'failure'
      if (failed) {
        outcomeRef.current = 'success'
        setOutcome('success')
      }
      setPending((value) => value + 1)
      const timer = setTimeout(() => {
        timers.current.delete(timer)
        if (mounted.current) setPending((value) => value - 1)
        if (failed) reject(new Error('Sample response failed'))
        else resolve()
      }, Number(delay))
      timers.current.set(timer, () => reject(new Error('Sample changed')))
    })
  const commandData = createDashboardCommandData({ ...data, todayKey: today })
  return (
    <>
      {withInvitations ? (
        <FieldGrid>
          <Field>
            <FieldLabel htmlFor={outcomeId}>
              Next sample invitation result
            </FieldLabel>
            <Select
              id={outcomeId}
              value={outcome}
              disabled={pending > 0}
              onChange={(event) => {
                outcomeRef.current = event.target.value
                setOutcome(event.target.value)
              }}
            >
              <option value="success">Success</option>
              <option value="failure">Failure, then retry</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={delayId}>Invitation response time</FieldLabel>
            <Select
              id={delayId}
              value={delay}
              disabled={pending > 0}
              onChange={(event) => setDelay(event.target.value)}
            >
              <option value="150">Quick response</option>
              <option value="3000">3 seconds</option>
            </Select>
          </Field>
        </FieldGrid>
      ) : null}
      <AppDashboardView
        data={commandData}
        invitations={invitations}
        onApprove={respond}
        onDecline={respond}
      />
    </>
  )
}
