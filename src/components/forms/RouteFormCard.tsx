import { useT } from '#/i18n/LocaleProvider'
import type { ComponentProps, FormEventHandler, ReactNode } from 'react'
import { createContext, useContext, useRef, useState } from 'react'

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
import { cn } from '#/lib/utils'
import { FormSubmitButtons } from './FormSubmitActions'
import { useRouteFormClose } from '#/components/layout/mobileTaskNavigation'

// The footer Close runs the same guarded exit as the header Back.
const RouteFormExitContext = createContext<{
  onExit?: () => void
  disabled?: boolean
}>({})

// One hairline at the content width, like the form's section dividers, so the
// footer never reads as a band; the card-coloured fill only hides fields
// scrolling under the stuck actions. Phones float the actions instead.
export const formStickyActionsClassName =
  'sticky bottom-0 z-10 bg-card pb-[max(1rem,env(safe-area-inset-bottom))] md:[&>*]:border-t md:[&>*]:border-border-subtle md:[&>*]:pt-4'

type RouteFormCardProps = {
  formId: string
  title: ReactNode
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  actions: ReactNode
  contentGap?: ComponentProps<typeof DashboardSectionCard>['contentGap']
  embedded?: boolean
  noValidate?: boolean
  stickyActions?: boolean
  onCancel?: () => void
  cancelDisabled?: boolean
}

// A quiet text action at the start of the footer, away from Close and submit. Its box starts at
// the sections' edge, mirroring Close and submit, so its hover fill never runs past the cards.
const resetClassName = 'text-muted-foreground hover:text-foreground sm:mr-auto'

type RouteFormActionsProps = {
  isSubmitting: boolean
  /** Discard changes is shown only for a dirty form; its space stays reserved. */
  dirty?: boolean
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
        title={embedded ? title : undefined}
        size="panel"
        contentLayout="flexColumn"
        contentGap={contentGap}
        footer={<DashboardActions width="full">{actions}</DashboardActions>}
        footerClassName={stickyActions ? formStickyActionsClassName : undefined}
      >
        {children}
      </DashboardSectionCard>
    </form>
  )

  if (embedded) return formCard

  const exit = onCancel ?? closeForm
  return (
    // Capped so fields stay a readable width, centred with the title.
    <DashboardPage width="narrow">
      <DashboardPageHeader
        title={title}
        backAction={<PageBack onClick={exit} disabled={cancelDisabled} />}
      />
      <RouteFormExitContext.Provider
        value={{ onExit: exit, disabled: cancelDisabled }}
      >
        {formCard}
      </RouteFormExitContext.Provider>
    </DashboardPage>
  )
}

export function RouteFormActions({
  isSubmitting,
  dirty = true,
  onReset,
  resetLabel,
  disabled = false,
  resetConfirmation,
  submitLabel,
  submittingLabel,
}: RouteFormActionsProps) {
  const t = useT()
  const effectiveResetLabel = resetLabel ?? t('common.discardChanges')
  const [resetOpen, setResetOpen] = useState(false)
  const resetTrigger = useRef<HTMLButtonElement>(null)
  const ownerForm = useRef<HTMLFormElement | null>(null)
  const actionDisabled = disabled || isSubmitting
  // Invisible rather than unmounted, so Close and submit never shift.
  const resetHidden = !dirty
  const resetButtonClassName = cn(resetClassName, resetHidden && 'invisible')
  const closeForm = useRouteFormClose()
  const exit = useContext(RouteFormExitContext)

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
                variant="ghost"
                className={resetButtonClassName}
                disabled={actionDisabled || resetHidden}
                aria-hidden={resetHidden || undefined}
              />
            }
          >
            {effectiveResetLabel}
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

      {!resetConfirmation && (
        <Button
          type="button"
          variant="ghost"
          data-form-action="reset"
          className={resetButtonClassName}
          disabled={actionDisabled || resetHidden}
          aria-hidden={resetHidden || undefined}
          onClick={onReset}
        >
          {effectiveResetLabel}
        </Button>
      )}
      {/* Close + submit at every width; floating phone actions hide Reset. */}
      <Button
        type="button"
        variant="outline"
        data-form-action="close"
        disabled={exit.disabled}
        onClick={exit.onExit ?? closeForm}
      >
        {t('common.close')}
      </Button>
      <FormSubmitButtons
        isSubmitting={isSubmitting}
        disabled={disabled}
        submitLabel={submitLabel}
        submittingLabel={submittingLabel}
      />
    </>
  )
}
