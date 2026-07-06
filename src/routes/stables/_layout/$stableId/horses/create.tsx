import { useMutation } from 'convex/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { horseFormSchema } from '#/components/forms/horse/horseFormSchema'
import type { HorseFormSchema } from '#/components/forms/horse/horseFormSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Id } from 'convex/_generated/dataModel'
import { toast } from 'sonner'
import { HorseFormFields } from '#/components/forms/horse/HorseFormFields'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'

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

  const form = useForm<HorseFormSchema>({
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
      const profileImageId = await uploadProfileImage(
        data.profileImage?.item(0),
      )
      const newHorseId = await addHorse({
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
        stableId: stableId as Id<'stables'>,
      })

      toast.success('Horse added', {
        description: <p>{data.name} is ready.</p>,
        position: 'top-right',
      })

      nav({
        to: '/stables/$stableId/horses/$horseId',
        params: { stableId, horseId: newHorseId },
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
      <Card className="w-full bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">Add horse</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <HorseFormFields
            control={form.control}
            disabled={form.formState.isSubmitting}
          />
        </CardContent>

        <CardFooter className="justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={form.formState.isSubmitting}
            onClick={() => form.reset()}
          >
            Reset
          </Button>

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Adding...' : 'Add Horse'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
