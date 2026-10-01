import { useT } from '#/i18n/LocaleProvider'
import { useId } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Id } from 'convex/_generated/dataModel'
import { StableFormFields } from '#/components/forms/stable/StableFormFields'
import { createStableSchemas } from 'shared/stables/stableSchema'
import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
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
  const t = useT()

  const formId = useId()
  const form = useForm<StableFormSchema>({
    resolver: zodResolver(
      createStableSchemas((key) => t(`stableValidation.${key}`))
        .stableFormSchema,
    ),
    mode: 'onTouched',
    defaultValues: stableProfileDefaults(initialValues),
  })
  useLocalizedValidation(form)
  const submission = useAcknowledgedFormSave({
    save,
    onSaved,
    onAcknowledged,
    onPendingChange,
    saveError: t('stables.saveFailed'),
    continueError:
      mode === 'create'
        ? t('stables.createContinueFailed')
        : t('stables.updateContinueFailed'),
  })
  return (
    <RouteFormCard
      formId={formId}
      title={mode === 'create' ? t('stables.create') : t('stables.edit')}
      sectionTitle={mode === 'edit' ? t('stables.details') : undefined}
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
                {sampleNotice ? t('stables.sampleSaved') : t('stables.saved')}
              </p>
              <Button
                type="button"
                disabled={submission.pending}
                aria-busy={submission.pending || undefined}
                onClick={() => void submission.retryContinuation()}
              >
                {submission.pending
                  ? t('stables.opening')
                  : mode === 'create'
                    ? t('stables.continueSetup')
                    : t('stables.open')}
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
              resetLabel={
                mode === 'edit' ? t('stables.discard') : t('stables.reset')
              }
              resetConfirmation={
                mode === 'edit'
                  ? {
                      title: t('stables.discardTitle'),
                      description: t('stables.discardHelp'),
                      confirmLabel: t('stables.discard'),
                    }
                  : form.formState.isDirty
                    ? {
                        title: t('stables.resetTitle'),
                        description: t('stables.resetHelp'),
                        confirmLabel: t('stables.resetChanges'),
                      }
                    : undefined
              }
              submitLabel={
                mode === 'create' ? t('stables.create') : t('stables.update')
              }
              submittingLabel={
                mode === 'create' ? t('stables.creating') : t('stables.saving')
              }
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
