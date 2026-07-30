import type { ComponentProps, FormEventHandler, ReactNode } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { FormSubmitButtons } from './FormSubmitActions'

type RouteFormCardProps = {
  formId: string
  title: ReactNode
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  actions: ReactNode
  contentGap?: ComponentProps<typeof DashboardSectionCard>['contentGap']
  sectionTitle?: ReactNode
}

type RouteFormActionsProps = {
  isSubmitting: boolean
  onReset: () => void
  submitLabel: string
  submittingLabel: string
  resetLabel?: string
}

export function RouteFormCard({
  formId,
  title,
  onSubmit,
  children,
  actions,
  contentGap = 'default',
  sectionTitle,
}: RouteFormCardProps) {
  return (
    <DashboardPage>
      <DashboardPageHeader title={title} />

      <form data-slot="route-form-card" id={formId} onSubmit={onSubmit}>
        <DashboardSectionCard
          data-slot="route-form-section-card"
          width="full"
          title={sectionTitle}
          size="panel"
          contentLayout="flexColumn"
          contentGap={contentGap}
          footer={<DashboardActions width="full">{actions}</DashboardActions>}
        >
          {children}
        </DashboardSectionCard>
      </form>
    </DashboardPage>
  )
}

export function RouteFormActions({
  isSubmitting,
  onReset,
  resetLabel = 'Reset',
  submitLabel,
  submittingLabel,
}: RouteFormActionsProps) {
  return (
    <FormSubmitButtons
      isSubmitting={isSubmitting}
      onCancel={onReset}
      cancelLabel={resetLabel}
      submitLabel={submitLabel}
      submittingLabel={submittingLabel}
    />
  )
}
