import { XIcon } from '@phosphor-icons/react'
import { RequiredFieldsHint } from './FormLayout'
import { useT } from '#/i18n/LocaleProvider'
import type { ComponentProps, FormEventHandler, ReactNode } from 'react'
import { useRef, useState } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { PageBack } from '#/components/layout/PageBack'
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
import { useRouteFormClose } from '#/components/layout/mobileTaskNavigation'

export const formStickyActionsClassName =
  'sticky bottom-0 z-10 border-t border-border-subtle bg-card py-4 pb-[max(1rem,env(safe-area-inset-bottom))]'

type RouteFormCardProps = {
  formId: string
  title: ReactNode
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  actions: ReactNode
  contentGap?: ComponentProps<typeof DashboardSectionCard>['contentGap']
  embedded?: boolean
  sectionTitle?: ReactNode
  noValidate?: boolean
  stickyActions?: boolean
  onCancel?: () => void
  cancelDisabled?: boolean
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

function isAvailableFocusTarget(
  element: HTMLElement,
  form: HTMLFormElement | null,
) {
  const hiddenAncestor = element.closest(
    '[inert], [hidden], [aria-hidden="true"]',
  )
  return (
    element.isConnected &&
    !element.matches(':disabled, [aria-disabled="true"]') &&
    // Base UI removes its outside-app mask after resolving finalFocus.
    // Reject hidden content within this form; leave return timing to the dialog.
    (!hiddenAncestor || Boolean(form && !form.contains(hiddenAncestor)))
  )
}

function findFormFocusTarget(form: HTMLFormElement | null) {
  if (!form?.isConnected) return undefined
  const controls = form.querySelectorAll<HTMLElement>(
    'input:not([type=hidden]), textarea, select',
  )
  return (
    Array.from(controls).find((element) =>
      isAvailableFocusTarget(element, form),
    ) ??
    Array.from(form.querySelectorAll<HTMLButtonElement>('button')).find(
      (element) => isAvailableFocusTarget(element, form),
    )
  )
}

export function RouteFormCard({
  noValidate,
  formId,
  title,
  onSubmit,
  children,
  actions,
  contentGap = 'default',
  embedded = false,
  sectionTitle,
  stickyActions = false,
  onCancel,
  cancelDisabled = false,
}: RouteFormCardProps) {
  const closeForm = useRouteFormClose()
  const formCard = (
    <form
      data-slot="route-form-card"
      data-mobile-route-form={!embedded && stickyActions ? true : undefined}
      id={formId}
      onSubmit={onSubmit}
      noValidate={noValidate}
    >
      <DashboardSectionCard
        data-slot="route-form-section-card"
        width="full"
        title={embedded ? title : sectionTitle}
        size="panel"
        contentLayout="flexColumn"
        contentGap={contentGap}
        footer={<DashboardActions width="full">{actions}</DashboardActions>}
        footerClassName={stickyActions ? formStickyActionsClassName : undefined}
      >
        <RequiredFieldsHint />
        {children}
      </DashboardSectionCard>
    </form>
  )

  if (embedded) return formCard

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={title}
        backAction={
          <PageBack onClick={onCancel ?? closeForm} disabled={cancelDisabled} />
        }
      />
      {formCard}
    </DashboardPage>
  )
}

export function RouteFormActions({
  isSubmitting,
  onReset,
  resetLabel,
  disabled = false,
  resetConfirmation,
  submitLabel,
  submittingLabel,
}: RouteFormActionsProps) {
  const t = useT()
  const effectiveResetLabel = resetLabel ?? t('common.reset')
  const [resetOpen, setResetOpen] = useState(false)
  const resetTrigger = useRef<HTMLButtonElement>(null)
  const ownerForm = useRef<HTMLFormElement | null>(null)
  const actionDisabled = disabled || isSubmitting
  const closeForm = useRouteFormClose()

  return (
    <>
      {resetConfirmation && (
        <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
          <AlertDialogTrigger
            render={
              <Button
                data-form-action="reset"
                ref={(element) => {
                  resetTrigger.current = element
                  if (element) ownerForm.current = element.closest('form')
                }}
                type="button"
                variant="outline"
                disabled={actionDisabled}
              />
            }
          >
            <span
              data-slot="form-action-icon"
              className="hidden"
              aria-hidden="true"
            >
              <XIcon className="size-5" />
            </span>
            <span data-slot="form-action-label">{effectiveResetLabel}</span>
          </AlertDialogTrigger>
          <AlertDialogContent
            finalFocus={() => {
              if (
                resetTrigger.current &&
                isAvailableFocusTarget(resetTrigger.current, ownerForm.current)
              ) {
                return resetTrigger.current
              }
              // A successful reset can disable or remove its original trigger.
              return findFormFocusTarget(ownerForm.current) ?? true
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>{resetConfirmation.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {resetConfirmation.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.keepEditing')}</AlertDialogCancel>
              <AlertDialogAction
                type="button"
                variant="destructive"
                disabled={actionDisabled}
                onClick={() => {
                  if (actionDisabled) return
                  onReset()
                  setResetOpen(false)
                }}
              >
                {resetConfirmation.confirmLabel ?? effectiveResetLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Phones show Close in place of Reset in the floating actions. */}
      <Button
        type="button"
        variant="outline"
        data-form-action="close"
        className="hidden"
        aria-label={t('common.close')}
        onClick={closeForm}
      >
        <XIcon className="size-5" aria-hidden="true" />
      </Button>
      <FormSubmitButtons
        isSubmitting={isSubmitting}
        onCancel={resetConfirmation ? undefined : onReset}
        cancelAction="reset"
        cancelLabel={effectiveResetLabel}
        disabled={disabled}
        submitLabel={submitLabel}
        submittingLabel={submittingLabel}
      />
    </>
  )
}
