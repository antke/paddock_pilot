import { useT } from '#/i18n/LocaleProvider'
import type { ComponentProps } from 'react'
import {
  ArrowRightIcon,
  CheckIcon,
  WarningCircleIcon,
  XIcon,
} from '@phosphor-icons/react'
import { Spinner } from '#/components/ui/spinner'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { Button } from '#/components/ui/button'
import { ActionFeedback } from '#/components/ui/action-feedback'
import { cn } from '#/lib/utils'

type FormSubmitActionsProps = Omit<
  ComponentProps<typeof DashboardActions>,
  'children'
> &
  FormSubmitButtonsProps & {
    sticky?: boolean
  }

type FormSubmitButtonsProps = {
  failed?: boolean
  confirmed?: boolean
  confirmedLabel?: string
  isSubmitting: boolean
  submitLabel: string
  submittingLabel: string
  onCancel?: () => void
  cancelLabel?: string
  disabled?: boolean
}

export function FormSubmitActions({
  failed,
  isSubmitting,
  confirmed,
  confirmedLabel,
  submitLabel,
  submittingLabel,
  onCancel,
  cancelLabel,
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
        failed={failed}
        cancelLabel={cancelLabel}
        disabled={disabled}
        isSubmitting={isSubmitting}
        confirmed={confirmed}
        confirmedLabel={confirmedLabel}
        onCancel={onCancel}
        submitLabel={submitLabel}
        submittingLabel={submittingLabel}
      />
    </DashboardActions>
  )
}

export function FormSubmitButtons({
  failed = false,
  isSubmitting,
  confirmed,
  confirmedLabel,
  submitLabel,
  submittingLabel,
  onCancel,
  cancelLabel,
  disabled = false,
}: FormSubmitButtonsProps) {
  const t = useT()
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
          <span
            data-slot="form-action-icon"
            className="hidden"
            aria-hidden="true"
          >
            <XIcon className="size-5" />
          </span>
          <span data-slot="form-action-label">
            {cancelLabel ?? t('common.cancel')}
          </span>
        </Button>
      )}

      <Button
        type="submit"
        variant={failed && !isSubmitting ? 'destructive' : 'default'}
        disabled={actionDisabled}
        aria-busy={isSubmitting || undefined}
      >
        <span
          data-slot="form-action-icon"
          className="hidden"
          aria-hidden="true"
        >
          {isSubmitting ? (
            <Spinner className="size-6" />
          ) : failed ? (
            <WarningCircleIcon className="size-6" />
          ) : (
            <CheckIcon className="size-6" weight="bold" />
          )}
        </span>
        <ActionFeedback
          failed={failed}
          failedLabel={t('common.retry')}
          icon={<ArrowRightIcon aria-hidden="true" />}
          confirmed={confirmed}
          confirmedLabel={confirmedLabel}
          label={submitLabel}
          pendingLabel={submittingLabel}
          pending={isSubmitting}
        />
      </Button>
    </div>
  )
}
