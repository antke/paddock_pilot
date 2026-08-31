import type { ComponentProps } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'
import { cn } from '#/lib/utils'

type FormSubmitActionsProps = Omit<
  ComponentProps<typeof DashboardActions>,
  'children'
> &
  FormSubmitButtonsProps & {
    sticky?: boolean
  }

type FormSubmitButtonsProps = {
  isSubmitting: boolean
  submitLabel: string
  submittingLabel: string
  onCancel?: () => void
  cancelLabel?: string
  disabled?: boolean
}

export function FormSubmitActions({
  isSubmitting,
  submitLabel,
  submittingLabel,
  onCancel,
  cancelLabel = 'Cancel',
  disabled = false,
  sticky = false,
  className,
  ...props
}: FormSubmitActionsProps) {
  return (
    <DashboardActions
      data-slot="form-submit-actions"
      className={cn(
        sticky &&
          'sticky -bottom-6 z-10 -mx-6 -mb-6 border-t border-border-subtle bg-popover/95 px-6 py-4 supports-backdrop-filter:backdrop-blur-sm md:-bottom-7 md:-mx-7 md:-mb-7 md:px-7',
        className,
      )}
      {...props}
    >
      <FormSubmitButtons
        cancelLabel={cancelLabel}
        disabled={disabled}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        submitLabel={submitLabel}
        submittingLabel={submittingLabel}
      />
    </DashboardActions>
  )
}

export function FormSubmitButtons({
  isSubmitting,
  submitLabel,
  submittingLabel,
  onCancel,
  cancelLabel = 'Cancel',
  disabled = false,
}: FormSubmitButtonsProps) {
  const actionDisabled = disabled || isSubmitting

  return (
    <div data-slot="form-submit-buttons" className="contents">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          disabled={actionDisabled}
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
      )}

      <Button
        type="submit"
        disabled={actionDisabled}
        aria-busy={isSubmitting || undefined}
      >
        {isSubmitting && <Spinner aria-hidden={true} />}
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </div>
  )
}
