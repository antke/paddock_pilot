import { HorseFormFields } from '#/components/forms/horse/HorseFormFields'
import { horseFormSchema } from '#/components/forms/horse/horseFormSchema'
import type {
  HorseFormInput,
  HorseFormSchema,
} from '#/components/forms/horse/horseFormSchema'
import {
  RouteFormActions,
  RouteFormCard,
} from '#/components/forms/RouteFormCard'
import {
  RouteEntityNotFoundAlert,
  RouteStatusAlert,
} from '#/components/layout/RouteStatusAlert'
import { ButtonLink } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'
import { calculateHorseAge } from 'shared/horses/horseAge'
import { HorseDeletionActions } from '#/components/horses/HorseDeletionActions'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { horseId, stableId } = Route.useParams()

  const { data: horse } = useSuspenseQuery(
    convexQuery(api.horses.get, { id: horseId }),
  )
  const { data: permissions } = useSuspenseQuery(
    convexQuery(api.horses.getPermissions, { id: horseId as Id<'horses'> }),
  )

  if (!horse || horse.stableId !== stableId) {
    return <RouteEntityNotFoundAlert entity="horse" />
  }
  if (!permissions?.canManageHorse) {
    return (
      <RouteStatusAlert
        tone="warning"
        title="This horse profile is read-only for you"
        description="Members can edit only their own horses. The stable owner can manage every horse in the stable."
        actions={
          <ButtonLink
            to="/stables/$stableId/horses/$horseId"
            params={{ stableId, horseId }}
          >
            Return to horse
          </ButtonLink>
        }
      />
    )
  }

  return <EditHorseForm key={horse._id} horse={horse} />
}

type EditHorseFormProps = {
  horse: Doc<'horses'>
}

function EditHorseForm({ horse }: EditHorseFormProps) {
  const nav = useNavigate()
  const updateHorse = useMutation(api.horses.update)
  const generateProfileImageUploadUrl = useMutation(
    api.horses.generateProfileImageUploadUrl,
  )

  const form = useForm<HorseFormInput, unknown, HorseFormSchema>({
    resolver: zodResolver(horseFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: horse.name,
      ownerName: horse.ownerName ?? '',
      breed: horse.breed ?? '',
      sex: horse.sex,
      color: horse.color ?? '',
      height: horse.height ?? '',
      dateOfBirth: horse.dateOfBirth ?? '',
      age: horse.age,
      passportNumber: horse.passportNumber ?? '',
      microchipNumber: horse.microchipNumber ?? '',
      insuranceProvider: horse.insuranceProvider ?? '',
      insurancePolicyNumber: horse.insurancePolicyNumber ?? '',
      sire: horse.sire ?? '',
      dam: horse.dam ?? '',
      discipline: horse.discipline ?? '',
      shoeingStatus: horse.shoeingStatus,
      dewormingNotes: horse.dewormingNotes ?? '',
      allergies: horse.allergies ?? [],
      emergencyNotes: horse.emergencyNotes ?? '',
      vetName: horse.vetName ?? '',
      vetPhone: horse.vetPhone ?? '',
      farrierName: horse.farrierName ?? '',
      farrierPhone: horse.farrierPhone ?? '',
      nutritionNotes: horse.nutritionNotes ?? '',
      nutritionRecommended: horse.nutritionRecommended ?? [],
      nutritionAvoid: horse.nutritionAvoid ?? [],
      feedingRoutine: horse.feedingRoutine ?? '',
    },
  })

  const uploadProfileImage = async (file?: File) => {
    if (!file) return horse.profileImageId

    const uploadUrl = await generateProfileImageUploadUrl()
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    })

    if (!result.ok) throw new Error('Failed to upload horse profile image')

    const { storageId } = (await result.json()) as { storageId: Id<'_storage'> }

    return storageId
  }

  const onSubmit = async (data: HorseFormSchema) => {
    try {
      const age = data.dateOfBirth
        ? calculateHorseAge(data.dateOfBirth)
        : data.age
      if (typeof age !== 'number' || age < 0 || age > 100) {
        throw new Error('Invalid horse age')
      }

      const profileImageId = await uploadProfileImage(
        data.profileImage?.item(0) ?? undefined,
      )

      await updateHorse({
        id: horse._id,
        name: data.name,
        ownerName: data.ownerName,
        age,
        breed: data.breed,
        sex: data.sex,
        color: data.color,
        height: data.height,
        dateOfBirth: data.dateOfBirth || undefined,
        passportNumber: data.passportNumber,
        microchipNumber: data.microchipNumber,
        insuranceProvider: data.insuranceProvider,
        insurancePolicyNumber: data.insurancePolicyNumber,
        sire: data.sire,
        dam: data.dam,
        discipline: data.discipline,
        shoeingStatus: data.shoeingStatus,
        dewormingNotes: data.dewormingNotes,
        allergies: data.allergies,
        emergencyNotes: data.emergencyNotes,
        vetName: data.vetName,
        vetPhone: data.vetPhone,
        farrierName: data.farrierName,
        farrierPhone: data.farrierPhone,
        nutritionNotes: data.nutritionNotes,
        nutritionRecommended: data.nutritionRecommended,
        nutritionAvoid: data.nutritionAvoid,
        feedingRoutine: data.feedingRoutine,
        profileImageId,
      })

      showAppSuccessToast({
        title: 'Horse updated',
        description: <p>{data.name} has been updated.</p>,
      })

      nav({
        to: '/stables/$stableId/horses/$horseId',
        params: { stableId: horse.stableId, horseId: horse._id },
      })
    } catch (err) {
      showAppErrorToast()
    }
  }

  return (
    <>
      <RouteFormCard
        formId="horse-form"
        title="Edit horse profile"
        embedded
        onSubmit={form.handleSubmit(onSubmit)}
        actions={
          <RouteFormActions
            isSubmitting={form.formState.isSubmitting}
            onReset={() => form.reset()}
            resetLabel="Reset form"
            submitLabel="Save changes"
            submittingLabel="Saving changes…"
          />
        }
      >
        <HorseFormFields
          control={form.control}
          disabled={form.formState.isSubmitting}
        />
      </RouteFormCard>

      <HorseDeletionActions
        horse={horse}
        onDeleted={() =>
          nav({
            to: '/stables/$stableId/horses',
            params: { stableId: horse.stableId },
          })
        }
      />
    </>
  )
}
