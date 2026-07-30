import type { ComponentProps, ReactNode } from 'react'
import { Suspense } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardDisplayHeading } from '#/components/dashboard/DashboardDisplayHeading'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { RoutePending } from '#/components/layout/RoutePending'
import { SignedOutRoutePrompt } from '#/components/layout/SignedOutRoutePrompt'
import { TextLabel } from '#/components/ui/text-label'
import { cn } from '#/lib/utils'

type LabPageShellProps = ComponentProps<'div'> & {
  width?: 'dashboard' | 'wide'
}

type LabPageHeaderProps = Omit<ComponentProps<'header'>, 'title'> & {
  actions?: ReactNode
  children?: ReactNode
  description?: ReactNode
  title?: ReactNode
  variant?: 'plain' | 'panel'
}

type LabPreviewSeparatorProps = Omit<ComponentProps<'div'>, 'children'>

type LabPageSectionLabelProps = ComponentProps<typeof TextLabel>

type LabRouteBoundaryProps = {
  children: ReactNode
  signedOutDescription: string
  signedOutTitle: string
}

export function LabRouteBoundary({
  children,
  signedOutDescription,
  signedOutTitle,
}: LabRouteBoundaryProps) {
  return (
    <Suspense fallback={<RoutePending />}>
      <AuthStateSwitch
        signedIn={children}
        signedOut={
          <SignedOutRoutePrompt
            title={signedOutTitle}
            description={signedOutDescription}
          />
        }
      />
    </Suspense>
  )
}

export function LabPageShell({
  className,
  width = 'dashboard',
  ...props
}: LabPageShellProps) {
  return (
    <div
      className={cn(
        'mx-auto grid gap-6',
        width === 'dashboard' && 'max-w-[88rem]',
        width === 'wide' && 'max-w-[92rem]',
        className,
      )}
      {...props}
    />
  )
}

export function LabPageHeader({
  actions,
  children,
  className,
  description,
  title,
  variant = 'plain',
  ...props
}: LabPageHeaderProps) {
  const hasHeading = title !== undefined || description !== undefined

  return (
    <header
      data-slot="lab-page-header"
      className={cn(
        variant === 'panel' &&
          'app-panel bg-card p-5 md:p-6',
        className,
      )}
      {...props}
    >
      <div className={cn('grid gap-5', variant === 'plain' && 'gap-4')}>
        <div
          className={cn(
            'flex flex-wrap items-start justify-between gap-4',
            variant === 'plain' && 'items-end',
            !hasHeading && 'justify-end',
          )}
        >
          {hasHeading && (
            <div className="grid min-w-0 gap-2">
              <div>
                {title && (
                  <DashboardDisplayHeading scale="section">
                    {title}
                  </DashboardDisplayHeading>
                )}
                {description && (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}

          {actions && (
            <DashboardActions
              align="start"
              className="sm:shrink-0 sm:justify-end"
            >
              {actions}
            </DashboardActions>
          )}
        </div>

        {children}
      </div>
    </header>
  )
}

export function LabPageSectionLabel({
  weight = 'semibold',
  tracking = 'tight',
  ...props
}: LabPageSectionLabelProps) {
  return <TextLabel weight={weight} tracking={tracking} {...props} />
}

export function LabPreviewSeparator({
  className,
  ...props
}: LabPreviewSeparatorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('grid gap-3 pt-2', className)}
      {...props}
    >
      <div className="h-1 rounded-full bg-primary" />
      <div className="h-px bg-border" />
    </div>
  )
}
