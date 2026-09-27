import { useId } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Id } from 'convex/_generated/dataModel'
import { StableFormFields } from '#/components/forms/stable/StableFormFields'
import { stableFormSchema } from '#/components/forms/stable/stableFormSchema'
import type { StableFormSchema } from '#/components/forms/stable/stableFormSchema'
import {
  RouteFormActions,
  RouteFormCard,
} from '#/components/forms/RouteFormCard'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { useAcknowledgedFormSave } from '#/components/forms/useAcknowledgedFormSave'
import { Button } from '#/components/ui/button'

export function stableProfileDefaults(
  stable?: Partial<StableFormSchema>,
): StableFormSchema {
  return {
    name: stable?.name ?? '',
    location: stable?.location ?? '',
    description: stable?.description ?? '',
    contactName: stable?.contactName ?? '',
    contactPhone: stable?.contactPhone ?? '',
    emergencyPhone: stable?.emergencyPhone ?? '',
    addressLine1: stable?.addressLine1 ?? '',
    addressLine2: stable?.addressLine2 ?? '',
    postcode: stable?.postcode ?? '',
    country: stable?.country ?? '',
    yardRules: stable?.yardRules ?? '',
    openingHours: stable?.openingHours ?? '',
  }
}

export function StableProfileForm({
  mode,
  initialValues,
  save,
  onSaved,
  onAcknowledged,
  onPendingChange,
  sampleNotice,
}: {
  mode: 'create' | 'edit'
  initialValues?: Partial<StableFormSchema>
  save: (values: StableFormSchema) => Promise<Id<'stables'>>
  onSaved: (id: Id<'stables'>) => void | Promise<void>
  onAcknowledged?: (id: Id<'stables'>, values: StableFormSchema) => void
  onPendingChange?: (pending: boolean) => void
  sampleNotice?: ReactNode
}) {
  const formId = useId()
  const form = useForm<StableFormSchema>({
    resolver: zodResolver(stableFormSchema),
    mode: 'onTouched',
    defaultValues: stableProfileDefaults(initialValues),
  })
  const submission = useAcknowledgedFormSave({
    save,
    onSaved,
    onAcknowledged,
    onPendingChange,
    saveError:
      'Could not save this stable. Your entries are still here. Please try again.',
    continueError:
      mode === 'create'
        ? 'Your stable was created, but setup could not open. Try continuing again; the stable will not be created twice.'
        : 'Your stable was updated, but the stable page could not open. Try opening it again; your changes will not be saved twice.',
  })
  return (
    <RouteFormCard
      formId={formId}
      title={mode === 'create' ? 'Create stable' : 'Edit stable'}
      sectionTitle={mode === 'edit' ? 'Stable details' : undefined}
      stickyActions
      onSubmit={(event) => {
        if (submission.acknowledged) {
          event.preventDefault()
          void submission.retryContinuation()
          return
        }
        if (
          submission.pending ||
          (mode === 'edit' && !form.formState.isDirty)
        ) {
          event.preventDefault()
          return
        }
        void form.handleSubmit(submission.submit)(event)
      }}
      actions={
        <>
          <FormSubmissionError message={submission.error} />
          {submission.acknowledged ? (
            <>
              <p role="status" className="text-sm text-muted-foreground">
                {sampleNotice
                  ? 'Sample stable save acknowledged locally. No live record changed.'
                  : 'Stable saved.'}
              </p>
              <Button
                type="button"
                disabled={submission.pending}
                aria-busy={submission.pending || undefined}
                onClick={() => void submission.retryContinuation()}
              >
                {submission.pending
                  ? 'Opening…'
                  : mode === 'create'
                    ? 'Continue to setup'
                    : 'Open stable'}
              </Button>
            </>
          ) : (
            <RouteFormActions
              isSubmitting={submission.pending}
              disabled={mode === 'edit' && !form.formState.isDirty}
              onReset={() => {
                if (submission.pending || submission.acknowledged) return
                form.reset()
                submission.clearError()
              }}
              resetLabel={mode === 'edit' ? 'Discard changes' : 'Reset'}
              resetConfirmation={
                mode === 'edit'
                  ? {
                      title: 'Discard your changes?',
                      description:
                        'The form will return to the last saved stable details.',
                      confirmLabel: 'Discard changes',
                    }
                  : form.formState.isDirty
                    ? {
                        title: 'Reset stable changes?',
                        description:
                          'Clear your unsaved stable details and start again.',
                        confirmLabel: 'Reset changes',
                      }
                    : undefined
              }
              submitLabel={
                mode === 'create' ? 'Create stable' : 'Update stable'
              }
              submittingLabel={mode === 'create' ? 'Creating…' : 'Saving…'}
            />
          )}
        </>
      }
    >
      {sampleNotice}
      <StableFormFields
        headingLevel={mode === 'create' ? 2 : 3}
        control={form.control}
        disabled={submission.pending || submission.acknowledged}
      />
    </RouteFormCard>
  )
}
