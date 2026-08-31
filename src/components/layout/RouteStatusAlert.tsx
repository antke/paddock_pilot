import type { ComponentProps, ReactNode } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'

type RouteStatusAlertProps = Omit<ComponentProps<typeof Alert>, 'children'> & {
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

const routeEntityNotFoundLabels = {
  stable: 'Stable',
  horse: 'Horse',
  event: 'Event',
} satisfies Record<RouteEntityNotFoundAlertEntity, string>

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
  const label = routeEntityNotFoundLabels[entity]

  return (
    <RouteStatusAlert
      title={`${label} not found`}
      description={
        description ??
        `This ${entity} does not exist or is no longer available.`
      }
      {...props}
    />
  )
}

export function RouteQueryErrorAlert({
  description,
  reset,
  title,
  width,
}: RouteQueryErrorAlertProps) {
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  const retry = () => {
    queryErrorResetBoundary.reset()
    reset()
  }

  return (
    <RouteStatusAlert
      title={title}
      description={description}
      tone="danger"
      width={width}
      actions={
        <Button type="button" onClick={retry} className="min-h-11">
          Try again
        </Button>
      }
    />
  )
}
