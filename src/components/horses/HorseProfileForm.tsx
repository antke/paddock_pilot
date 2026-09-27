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
}: HorseProfileFormProps) {
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
  const [error, setError] = useState<string>()
  const pendingChange = useRef(onPendingChange)
  pendingChange.current = onPendingChange
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      pendingChange.current?.(false)
    }
  }, [])
  const existingBreed = mode === 'edit' ? initialValues?.breed : undefined
  const form = useForm<HorseFormInput, unknown, HorseFormSchema>({
    resolver: zodResolver(createHorseFormSchema(existingBreed)),
    mode: 'onTouched',
    defaultValues: horseProfileDefaults(initialValues),
  })
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
      if (mounted.current)
        setError(
          'Your horse was saved, but the profile could not open. Try opening it again; nothing will be saved twice.',
        )
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
            if (mounted.current)
              setError(
                'Could not upload the horse photo. Your details and selected photo are still here. Try saving again, or remove the photo.',
              )
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
        if (mounted.current)
          setError(
            'Could not save this horse. Your entries are still here. Try saving again; an already uploaded photo will be reused.',
          )
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
      formId={formId}
      title={mode === 'create' ? 'Add horse' : 'Edit horse profile'}
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
          <FormSubmissionError message={error} />
          {savedId ? (
            <>
              <p role="status" className="text-sm text-muted-foreground">
                {sampleNotice
                  ? 'Sample horse saved locally. No live record changed.'
                  : 'Horse saved.'}
              </p>
              <Button
                type="button"
                onClick={() => void retryOpening()}
                disabled={isPending || disabled}
                aria-busy={isPending || undefined}
              >
                {isPending ? 'Opening profile…' : 'Open horse profile'}
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
              resetLabel="Reset form"
              resetConfirmation={
                form.formState.isDirty
                  ? {
                      title: 'Discard your changes?',
                      description:
                        mode === 'create'
                          ? 'Clear the details entered for this new horse.'
                          : 'Restore the horse details from before you started editing.',
                      confirmLabel: 'Discard changes',
                    }
                  : undefined
              }
              submitLabel={mode === 'create' ? 'Add horse' : 'Save changes'}
              submittingLabel={
                phase === 'uploading' ? 'Uploading photo…' : 'Saving horse…'
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
        disabled={isPending || disabled || Boolean(savedId)}
      />
    </RouteFormCard>
  )
}
