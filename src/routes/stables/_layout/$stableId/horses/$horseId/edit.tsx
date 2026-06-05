import { HorseFormFields } from '#/components/forms/horse/HorseFormFields'
import { horseFormSchema } from '#/components/forms/horse/horseFormSchema'
import type { HorseFormSchema } from '#/components/forms/horse/horseFormSchema'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { convexQuery } from '@convex-dev/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/$horseId/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { horseId, stableId } = Route.useParams()

  const { data: horse } = useSuspenseQuery(
    convexQuery(api.horses.get, { id: horseId as Id<'horses'> }),
  )

  if (!horse || horse.stableId !== stableId) return <div>Horse not found</div>

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

  const form = useForm<HorseFormSchema>({
    resolver: zodResolver(horseFormSchema),
    mode: 'onTouched',
    defaultValues: {
      name: horse.name,
      ownerName: horse.ownerName ?? '',
      age: horse.age,
      breed: horse.breed ?? '',
      sex: horse.sex,
      color: horse.color ?? '',
      height: horse.height ?? '',
      dateOfBirth: horse.dateOfBirth ?? '',
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
      const profileImageId = await uploadProfileImage(
        data.profileImage?.item(0),
      )

      await updateHorse({
        id: horse._id,
        name: data.name,
        ownerName: data.ownerName,
        age: data.age,
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

      toast.success('Horse updated', {
        description: <p>{data.name} has been updated.</p>,
        position: 'top-right',
      })

      nav({
        to: '/stables/$stableId/horses/$horseId',
        params: { stableId: horse.stableId, horseId: horse._id },
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  return (
    <form id="horse-form" onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit horse</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <HorseFormFields
            control={form.control}
            disabled={form.formState.isSubmitting}
          />
        </CardContent>

        <CardFooter className="gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting}
            onClick={() => form.reset()}
          >
            Reset
          </Button>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Update Horse'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
