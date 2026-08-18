import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from 'convex/react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Id } from 'convex/_generated/dataModel'

import { FileUploadField } from '#/components/forms/FileUploadField'
import { InlineForm } from '#/components/forms/FormLayout'
import { FormSubmitActions } from '#/components/forms/FormSubmitActions'
import { UserAvatar } from '#/components/users/UserAvatar'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGrid,
  FieldLabel,
  FieldPanel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { showAppErrorToast } from '#/components/ui/sonner'
import { api } from 'convex/_generated/api'

const accountProfileSchema = z.object({
  preferredName: z.string().trim().min(1, 'Add the name people should use.'),
  phone: z.string().trim().optional(),
  profileImage: z.custom<FileList>().optional(),
})

type AccountProfileValues = z.infer<typeof accountProfileSchema>

type AccountProfileFormProps = {
  initialValues: {
    displayName: string
    phone?: string
    profileImageUrl?: string
  }
  onSaved: () => void | Promise<void>
  submitLabel?: string
}

export function AccountProfileForm({
  initialValues,
  onSaved,
  submitLabel = 'Save and continue',
}: AccountProfileFormProps) {
  const updateProfile = useMutation(api.onboarding.updateAccountProfile)
  const generateUploadUrl = useMutation(
    api.onboarding.generateProfileImageUploadUrl,
  )
  const form = useForm<AccountProfileValues>({
    resolver: zodResolver(accountProfileSchema),
    mode: 'onTouched',
    defaultValues: {
      preferredName: initialValues.displayName,
      phone: initialValues.phone ?? '',
    },
  })

  const uploadProfileImage = async (file?: File) => {
    if (!file) return undefined

    const { uploadUrl, uploadToken } = await generateUploadUrl()
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!result.ok) throw new Error('Failed to upload profile image')

    const { storageId } = (await result.json()) as {
      storageId: Id<'_storage'>
    }

    return { storageId, uploadToken }
  }

  const onSubmit = async (values: AccountProfileValues) => {
    try {
      const profileImageUpload = await uploadProfileImage(
        values.profileImage?.item(0) ?? undefined,
      )
      await updateProfile({
        preferredName: values.preferredName,
        phone: values.phone || undefined,
        profileImageId: profileImageUpload?.storageId,
        profileUploadToken: profileImageUpload?.uploadToken,
      })
      await onSaved()
    } catch {
      showAppErrorToast({ title: 'Could not save your profile' })
    }
  }

  return (
    <InlineForm
      data-slot="account-profile-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldPanel className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
        <UserAvatar
          name={form.watch('preferredName') || initialValues.displayName}
          photoUrl={initialValues.profileImageUrl}
        />
        <div className="grid gap-1">
          <p className="font-semibold">Your Paddock Pilot profile</p>
          <FieldDescription>
            This identity follows you across every stable you own or join.
          </FieldDescription>
        </div>
      </FieldPanel>

      <FieldGrid>
        <Controller
          name="preferredName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Preferred name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                autoComplete="name"
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Phone number</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="tel"
                autoComplete="tel"
                placeholder="Optional"
                aria-invalid={fieldState.invalid}
                disabled={form.formState.isSubmitting}
              />
              <FieldDescription>
                You can add or change this later from your profile.
              </FieldDescription>
            </Field>
          )}
        />
      </FieldGrid>

      <Controller
        name="profileImage"
        control={form.control}
        render={({ field, fieldState }) => (
          <FileUploadField
            id={field.name}
            kind="image"
            accept="image/*"
            label="Profile image"
            uploadLabel="Add a profile image"
            uploadDescription="A photo helps other stable members recognise you."
            help="Optional. You can add or replace it later from your profile."
            errors={fieldState.error ? [fieldState.error] : undefined}
            files={field.value}
            onFilesChange={field.onChange}
            disabled={form.formState.isSubmitting}
            width="full"
          />
        )}
      />

      <FormSubmitActions
        align="end"
        isSubmitting={form.formState.isSubmitting}
        submitLabel={submitLabel}
        submittingLabel="Saving..."
      />
    </InlineForm>
  )
}
