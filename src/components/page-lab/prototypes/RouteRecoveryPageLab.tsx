import { useEffect, useRef, useState } from 'react'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { RouteError } from '#/components/layout/RouteError'
import { RoutePending } from '#/components/layout/RoutePending'
import { Button } from '#/components/ui/button'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

export function RouteRecoveryPageLab() {
  const sampleMode = useDevAuthBypassEnabled()
  const [generation, setGeneration] = useState(0)
  if (!import.meta.env.DEV || !sampleMode)
    return (
      <DashboardEmptyState>
        Route recovery samples require development sample data.
      </DashboardEmptyState>
    )
  return (
    <RecoverySample
      key={generation}
      onRestart={() => setGeneration((current) => current + 1)}
    />
  )
}

function RecoverySample({ onRestart }: { onRestart: () => void }) {
  const [outcome, setOutcome] = useState('success')
  const [delay, setDelay] = useState('1500')
  const controls = useRef({ outcome, delay })
  const [sample] = useState(() => {
    const cancellations = new Set<() => void>()
    let firstLoad = true
    const root = createRootRoute({ component: Outlet })
    const home = createRoute({
      getParentRoute: () => root,
      path: '/',
      component: () => (
        <DashboardEmptyState title="Sample home">
          Recovery exited to this local destination. The application route did
          not change. Restart the sample to inspect another failure.
        </DashboardEmptyState>
      ),
    })
    const page = createRoute({
      getParentRoute: () => root,
      path: '/sample',
      loader: async ({ abortController }) => {
        if (firstLoad) {
          firstLoad = false
          throw new Error('Local sample loader failure')
        }
        const next = { ...controls.current }
        await new Promise<void>((resolve, reject) => {
          const signal = abortController.signal
          const finish = () => {
            clearTimeout(timer)
            signal.removeEventListener('abort', cancel)
            cancellations.delete(cancel)
          }
          const cancel = () => {
            finish()
            reject(new DOMException('Sample load cancelled', 'AbortError'))
          }
          const timer = setTimeout(() => {
            finish()
            resolve()
          }, Number(next.delay))
          cancellations.add(cancel)
          signal.addEventListener('abort', cancel, { once: true })
          if (signal.aborted) cancel()
        })
        if (next.outcome === 'failure')
          throw new Error('Local sample retry rejected')
        return null
      },
      component: () => (
        <DashboardEmptyState title="Sample page loaded">
          The local loader acknowledged success. No server request or saved
          record is involved.
        </DashboardEmptyState>
      ),
    })
    return {
      router: createRouter({
        routeTree: root.addChildren([home, page]),
        history: createMemoryHistory({ initialEntries: ['/sample'] }),
        defaultErrorComponent: RouteError,
        defaultPendingComponent: RoutePending,
        defaultPendingMs: 0,
        defaultPendingMinMs: 0,
      }),
      cancel: () => {
        for (const cancel of cancellations) cancel()
      },
    }
  })
  useEffect(() => () => sample.cancel(), [sample])

  return (
    <DashboardSection>
      <p>
        Local route recovery sample. The initial load fails deliberately. Retry
        uses the actual router boundary; all destinations and outcomes stay in
        this preview. Changing an outcome affects the next attempt only.
      </p>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor="sample-route-outcome">
            Next sample retry
          </FieldLabel>
          <Select
            id="sample-route-outcome"
            value={outcome}
            onChange={(event) => {
              setOutcome(event.target.value)
              controls.current.outcome = event.target.value
            }}
          >
            <option value="success">Load successfully</option>
            <option value="failure">Fail again</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="sample-route-delay">
            Sample load delay
          </FieldLabel>
          <Select
            id="sample-route-delay"
            value={delay}
            onChange={(event) => {
              setDelay(event.target.value)
              controls.current.delay = event.target.value
            }}
          >
            <option value="1500">1.5 seconds</option>
            <option value="0">Immediate</option>
          </Select>
        </Field>
      </FieldGrid>
      <DashboardActions align="start">
        <Button type="button" variant="outline" onClick={onRestart}>
          Restart sample
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => void sample.router.navigate({ to: '/' })}
        >
          Open sample home
        </Button>
      </DashboardActions>
      <section aria-label="Local route recovery preview">
        <QueryErrorResetBoundary>
          <RouterProvider router={sample.router} />
        </QueryErrorResetBoundary>
      </section>
    </DashboardSection>
  )
}
