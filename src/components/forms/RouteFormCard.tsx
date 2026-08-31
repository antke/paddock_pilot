import type { ComponentProps, FormEventHandler, ReactNode } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import { FormSubmitButtons } from './FormSubmitActions'

type RouteFormCardProps = {
  formId: string
  title: ReactNode
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  actions: ReactNode
  contentGap?: ComponentProps<typeof DashboardSectionCard>['contentGap']
  embedded?: boolean
  sectionTitle?: ReactNode
  stickyActions?: boolean
}

type RouteFormActionsProps = {
  isSubmitting: boolean
  onReset: () => void
  submitLabel: string
  submittingLabel: string
  resetLabel?: string
  disabled?: boolean
  resetConfirmation?: {
    title: ReactNode
    description: ReactNode
    confirmLabel?: string
  }
}

export function RouteFormCard({
  formId,
  title,
  onSubmit,
  children,
  actions,
  contentGap = 'default',
  embedded = false,
  sectionTitle,
  stickyActions = false,
}: RouteFormCardProps) {
  const formCard = (
    <form data-slot="route-form-card" id={formId} onSubmit={onSubmit}>
      <DashboardSectionCard
        data-slot="route-form-section-card"
        width="full"
        title={embedded ? title : sectionTitle}
        size="panel"
        contentLayout="flexColumn"
        contentGap={contentGap}
        footer={<DashboardActions width="full">{actions}</DashboardActions>}
        footerClassName={
          stickyActions
            ? 'sticky bottom-0 z-10 border-t border-border-subtle bg-card/95 py-4 supports-backdrop-filter:backdrop-blur-sm'
            : undefined
        }
      >
        {children}
      </DashboardSectionCard>
    </form>
  )

  if (embedded) return formCard

  return (
    <DashboardPage>
      <DashboardPageHeader title={title} />
      {formCard}
    </DashboardPage>
  )
}

export function RouteFormActions({
  isSubmitting,
  onReset,
  resetLabel = 'Reset',
  disabled = false,
  resetConfirmation,
  submitLabel,
  submittingLabel,
}: RouteFormActionsProps) {
  return (
    <>
      {resetConfirmation && (
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                type="button"
                variant="outline"
                disabled={disabled || isSubmitting}
              />
            }
          >
            {resetLabel}
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{resetConfirmation.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {resetConfirmation.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep editing</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onReset}>
                {resetConfirmation.confirmLabel ?? resetLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <FormSubmitButtons
        isSubmitting={isSubmitting}
        onCancel={resetConfirmation ? undefined : onReset}
        cancelLabel={resetLabel}
        disabled={disabled}
        submitLabel={submitLabel}
        submittingLabel={submittingLabel}
      />
    </>
  )
}
