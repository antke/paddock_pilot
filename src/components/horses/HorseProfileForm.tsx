import { useT, useLocale } from '#/i18n/LocaleProvider'
import { useLocalizedValidation } from '#/i18n/useLocalizedValidation'
import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Id } from 'convex/_generated/dataModel'
import { HorseFormFields } from '#/components/forms/horse/HorseFormFields'
import { createHorseFormSchema } from '#/components/forms/horse/horseFormSchema'
import type {
  HorseFormInput,
  HorseFormSchema,
} from '#/components/forms/horse/horseFormSchema'
import { horseProfileDefaults } from '#/components/forms/horse/horseProfileValues'
import {
  RouteFormActions,
  RouteFormCard,
} from '#/components/forms/RouteFormCard'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'
import { Button } from '#/components/ui/button'

type HorseProfileFormProps = {
  breedSuggestions?: ReadonlyArray<string>
  mode: 'create' | 'edit'
  initialValues?: Partial<HorseFormInput>
  profileImageId?: Id<'_storage'>
  uploadImage: (file: File) => Promise<Id<'_storage'>>
  save: (
    values: HorseFormSchema,
    imageId?: Id<'_storage'>,
  ) => Promise<Id<'horses'>>
  onSaved: (horseId: Id<'horses'>) => void | Promise<void>
  embedded?: boolean
  disabled?: boolean
  onPendingChange?: (pending: boolean) => void
  sampleNotice?: ReactNode
}

/** Shared route and specimen lifecycle; photo, save and navigation acknowledge separately. */
export function HorseProfileForm({
  mode,
  initialValues,
  profileImageId,
  uploadImage,
  save,
  onSaved,
  embedded = false,
  disabled = false,
  onPendingChange,
  sampleNotice,
  breedSuggestions = [],
}: HorseProfileFormProps) {
  const t = useT()
  const { locale } = useLocale()

  const formId = useId()
  const mounted = useRef(true)
  const pending = useRef(false)
  const uploaded = useRef<{ file: File; id: Id<'_storage'> } | undefined>(
    undefined,
  )
  const acknowledged = useRef<Id<'horses'> | undefined>(undefined)
  const [phase, setPhase] = useState<
    'idle' | 'uploading' | 'saving' | 'opening'
  >('idle')
  const [savedId, setSavedId] = useState<Id<'horses'>>()
  const [error, setError] = useState<
    'openFailed' | 'uploadFailed' | 'saveFailed'
  >()
  const pendingChange = useRef(onPendingChange)
  pendingChange.current = onPendingChange
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      pendingChange.current?.(false)
    }
  }, [])
  const [addedBreeds, setAddedBreeds] = useState<Array<string>>([])
  const additionalBreeds = [...breedSuggestions, ...addedBreeds]
  const existingBreed = mode === 'edit' ? initialValues?.breed : undefined
  const form = useForm<HorseFormInput, unknown, HorseFormSchema>({
    resolver: zodResolver(
      createHorseFormSchema(existingBreed, additionalBreeds, locale),
    ),
    mode: 'onTouched',
    defaultValues: horseProfileDefaults(initialValues),
  })
  useLocalizedValidation(form)
  const isPending = phase !== 'idle'
  const finish = () => {
    pending.current = false
    if (mounted.current) {
      setPhase('idle')
      pendingChange.current?.(false)
    }
  }
  const openSaved = async (id: Id<'horses'>) => {
    setPhase('opening')
    try {
      await onSaved(id)
    } catch {
      if (mounted.current) setError('openFailed')
    }
  }
  const retryOpening = async () => {
    if (pending.current || disabled || !acknowledged.current) return
    pending.current = true
    pendingChange.current?.(true)
    setError(undefined)
    try {
      await openSaved(acknowledged.current)
    } finally {
      finish()
    }
  }
  const submit = async (values: HorseFormSchema) => {
    if (pending.current || disabled || acknowledged.current) return
    pending.current = true
    pendingChange.current?.(true)
    setError(undefined)
    let imageId = profileImageId
    try {
      const file = values.profileImage?.item(0)
      if (file) {
        if (uploaded.current?.file === file) imageId = uploaded.current.id
        else {
          setPhase('uploading')
          try {
            imageId = await uploadImage(file)
          } catch {
            if (mounted.current) setError('uploadFailed')
            return
          }
          if (!mounted.current) return
          uploaded.current = { file, id: imageId }
        }
      }
      if (!mounted.current) return
      setPhase('saving')
      let id: Id<'horses'>
      try {
        id = await save(values, imageId)
      } catch {
        if (mounted.current) setError('saveFailed')
        return
      }
      if (!mounted.current) return
      acknowledged.current = id
      setSavedId(id)
      await openSaved(id)
    } finally {
      finish()
    }
  }
  return (
    <RouteFormCard
      noValidate
      formId={formId}
      title={
        mode === 'create' ? t('horseForm.addHorse') : t('horseForm.editHorse')
      }
      embedded={embedded}
      stickyActions
      onSubmit={(event) => {
        if (acknowledged.current) {
          event.preventDefault()
          void retryOpening()
          return
        }
        if (pending.current || disabled) {
          event.preventDefault()
          return
        }
        void form.handleSubmit(submit)(event)
      }}
      actions={
        <>
          <FormSubmissionError
            message={error ? t(`horseForm.${error}`) : undefined}
          />
          {savedId ? (
            <>
              <p role="status" className="text-sm text-muted-foreground">
                {sampleNotice
                  ? t('horseForm.sampleSaved')
                  : t('horseForm.saved')}
              </p>
              <Button
                type="button"
                onClick={() => void retryOpening()}
                disabled={isPending || disabled}
                aria-busy={isPending || undefined}
              >
                {isPending
                  ? t('horseForm.opening')
                  : t('horseForm.openProfile')}
              </Button>
            </>
          ) : (
            <RouteFormActions
              isSubmitting={isPending}
              disabled={disabled}
              onReset={() => {
                if (pending.current || disabled) return
                form.reset()
                uploaded.current = undefined
                setError(undefined)
              }}
              resetLabel={t('horseForm.reset')}
              resetConfirmation={
                form.formState.isDirty
                  ? {
                      title: t('horseForm.discard'),
                      description:
                        mode === 'create'
                          ? t('horseForm.clearNew')
                          : t('horseForm.restoreEdit'),
                      confirmLabel: t('horseForm.discardAction'),
                    }
                  : undefined
              }
              submitLabel={
                mode === 'create'
                  ? t('horseForm.addHorse')
                  : t('horseForm.saveChanges')
              }
              submittingLabel={
                phase === 'uploading'
                  ? t('horseForm.uploading')
                  : t('horseForm.saving')
              }
            />
          )}
        </>
      }
    >
      {sampleNotice}
      <HorseFormFields
        control={form.control}
        existingBreed={existingBreed}
        additionalBreeds={additionalBreeds}
        onAddBreed={(breed) => setAddedBreeds((current) => [...current, breed])}
        disabled={isPending || disabled || Boolean(savedId)}
      />
    </RouteFormCard>
  )
}
