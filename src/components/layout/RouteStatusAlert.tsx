import { useT } from '#/i18n/LocaleProvider'
import type { ComponentProps, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'

type RouteStatusAlertProps = Omit<
  ComponentProps<typeof Alert>,
  'children' | 'title'
> & {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  descriptionClassName?: string
  tone?: RouteStatusAlertTone
  width?: RouteStatusAlertWidth
}

type RouteStatusAlertTone = 'primary' | 'danger' | 'warning' | 'muted'
type RouteStatusAlertWidth = 'default' | 'narrow'
type RouteEntityNotFoundAlertEntity = 'stable' | 'horse' | 'event'

type RouteEntityNotFoundAlertProps = Omit<
  RouteStatusAlertProps,
  'description' | 'title'
> & {
  entity: RouteEntityNotFoundAlertEntity
  description?: ReactNode
}

type RouteQueryErrorAlertProps = Pick<
  RouteStatusAlertProps,
  'description' | 'title' | 'width'
> & {
  reset: () => void
  recoveryActions?: ReactNode
}

const routeStatusAlertToneClassNames = {
  primary: 'bg-card',
  danger: 'bg-destructive/10',
  warning: 'bg-card',
  muted: 'bg-card',
} satisfies Record<RouteStatusAlertTone, string>

const routeStatusAlertWidthClassNames = {
  default: undefined,
  narrow: 'mx-auto max-w-xl',
} satisfies Record<RouteStatusAlertWidth, string | undefined>

export function RouteStatusAlert({
  title,
  description,
  actions,
  children,
  descriptionClassName,
  className,
  tone = 'primary',
  width = 'default',
  ...props
}: RouteStatusAlertProps) {
  const body = children ?? description

  return (
    <Alert
      className={cn(
        routeStatusAlertToneClassNames[tone],
        routeStatusAlertWidthClassNames[width],
        'p-5',
        className,
      )}
      {...props}
    >
      <AlertTitle>{title}</AlertTitle>
      {body || actions ? (
        <AlertDescription
          className={cn(actions && 'grid gap-4', descriptionClassName)}
        >
          {body}
          {actions ? (
            <DashboardActions align="start">{actions}</DashboardActions>
          ) : null}
        </AlertDescription>
      ) : null}
    </Alert>
  )
}

export function RouteEntityNotFoundAlert({
  entity,
  description,
  ...props
}: RouteEntityNotFoundAlertProps) {
  const t = useT()

  return (
    <RouteStatusAlert
      title={t(`recovery.${entity}Title`)}
      description={description ?? t(`recovery.${entity}Description`)}
      {...props}
    />
  )
}

export function RouteQueryErrorAlert({
  description,
  reset,
  title,
  width,
  recoveryActions,
}: RouteQueryErrorAlertProps) {
  const t = useT()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()
  const router = useRouter()
  const pending = useRef(false)
  const epoch = useRef(0)
  const [isPending, setIsPending] = useState(false)
  const [retryFailed, setRetryFailed] = useState(false)
  useEffect(() => {
    const current = ++epoch.current
    return () => {
      if (epoch.current === current) epoch.current++
    }
  }, [])

  const retry = async () => {
    if (pending.current) return
    pending.current = true
    const current = epoch.current
    const location = router.state.location
    const isCurrent = () =>
      epoch.current === current &&
      router.state.location.href === location.href &&
      router.state.location.state.__TSR_key === location.state.__TSR_key
    setIsPending(true)
    setRetryFailed(false)
    queryErrorResetBoundary.reset()
    try {
      // CatchBoundary.reset alone does not clear an errored loader match.
      await router.invalidate({ sync: true })
      if (isCurrent()) reset()
    } catch {
      if (isCurrent()) setRetryFailed(true)
    } finally {
      pending.current = false
      if (isCurrent()) setIsPending(false)
    }
  }

  return (
    <RouteStatusAlert
      title={title}
      description={
        <>
          {description}
          {retryFailed ? <p>{t('recovery.retryFailed')}</p> : null}
        </>
      }
      tone="danger"
      width={width}
      actions={
        <>
          <Button
            type="button"
            onClick={() => void retry()}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? t('recovery.retrying') : t('common.retry')}
          </Button>
          {recoveryActions}
        </>
      }
    />
  )
}
