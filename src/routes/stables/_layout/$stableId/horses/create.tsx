import { useMutation } from 'convex/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { horseFormSchema } from '#/components/forms/horse/horseFormSchema'
import type {
  HorseFormInput,
  HorseFormSchema,
} from '#/components/forms/horse/horseFormSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Id } from 'convex/_generated/dataModel'
import { HorseFormFields } from '#/components/forms/horse/HorseFormFields'
import {
  RouteFormActions,
  RouteFormCard,
} from '#/components/forms/RouteFormCard'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { calculateHorseAge } from 'shared/horses/horseAge'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const addHorse = useMutation(api.horses.add)
  const generateProfileImageUploadUrl = useMutation(
    api.horses.generateProfileImageUploadUrl,
  )

  const nav = useNavigate()
  const { stableId } = Route.useParams()

  const form = useForm<HorseFormInput, unknown, HorseFormSchema>({
    resolver: zodResolver(horseFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      ownerName: '',
      breed: '',
      color: '',
      height: '',
      dateOfBirth: '',
      passportNumber: '',
      microchipNumber: '',
      insuranceProvider: '',
      insurancePolicyNumber: '',
      sire: '',
      dam: '',
      discipline: '',
      dewormingNotes: '',
      allergies: [],
      emergencyNotes: '',
      vetName: '',
      vetPhone: '',
      farrierName: '',
      farrierPhone: '',
      nutritionNotes: '',
      nutritionRecommended: [],
      nutritionAvoid: [],
      feedingRoutine: '',
    },
  })

  const uploadProfileImage = async (file?: File) => {
    if (!file) return undefined

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
      const age = calculateHorseAge(data.dateOfBirth)
      if (age === undefined || age < 0 || age > 100) {
        throw new Error('Invalid horse date of birth')
      }

      const profileImageId = await uploadProfileImage(
        data.profileImage?.item(0) ?? undefined,
      )
      const newHorseId = await addHorse({
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
        stableId: stableId as Id<'stables'>,
      })

      showAppSuccessToast({
        title: 'Horse added',
        description: <p>{data.name} is ready.</p>,
      })

      nav({
        to: '/stables/$stableId/horses/$horseId',
        params: { stableId, horseId: newHorseId },
      })
    } catch (err) {
      showAppErrorToast()
    }
  }

  return (
    <RouteFormCard
      formId="horse-form"
      title="Add horse"
      onSubmit={form.handleSubmit(onSubmit)}
      actions={
        <RouteFormActions
          isSubmitting={form.formState.isSubmitting}
          onReset={() => form.reset()}
          submitLabel="Add Horse"
          submittingLabel="Adding..."
        />
      }
    >
      <HorseFormFields
        control={form.control}
        disabled={form.formState.isSubmitting}
      />
    </RouteFormCard>
  )
}
