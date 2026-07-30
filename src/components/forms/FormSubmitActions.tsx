import type { ComponentProps } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { Button } from '#/components/ui/button'

type FormSubmitActionsProps = Omit<
  ComponentProps<typeof DashboardActions>,
  'children'
> &
  FormSubmitButtonsProps

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
  ...props
}: FormSubmitActionsProps) {
  return (
    <DashboardActions data-slot="form-submit-actions" {...props}>
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

      <Button type="submit" disabled={actionDisabled}>
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </div>
  )
}
