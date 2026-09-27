import type { HorseFormInput, HorseFormSchema } from './horseFormSchema'
import { calculateHorseAge } from 'shared/horses/horseAge'
import type { Id } from 'convex/_generated/dataModel'

export function horseProfileDefaults(
  horse: Partial<HorseFormInput> = {},
): HorseFormInput {
  return {
    name: '',
    ownerName: '',
    breed: '',
    color: '',
    height: '',
    dateOfBirth: '',
    age: '',
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
    ...Object.fromEntries(
      Object.entries(horse).filter(([, value]) => value !== undefined),
    ),
  }
}

export function horseProfilePayload(
  values: HorseFormSchema,
  profileImageId?: Id<'_storage'>,
) {
  const { profileImage: _file, ...details } = values
  const age = values.dateOfBirth
    ? calculateHorseAge(values.dateOfBirth)
    : values.age
  if (typeof age !== 'number' || age < 0 || age > 100)
    throw new Error('Invalid horse age')
  return {
    ...details,
    age,
    dateOfBirth: values.dateOfBirth || undefined,
    profileImageId,
  }
}

export async function uploadHorseProfileImage(
  file: File,
  generateUrl: () => Promise<string>,
) {
  const response = await fetch(await generateUrl(), {
    method: 'POST',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!response.ok) throw new Error('Horse photo upload failed')
  const body: unknown = await response.json()
  if (
    !body ||
    typeof body !== 'object' ||
    !('storageId' in body) ||
    typeof body.storageId !== 'string' ||
    !body.storageId
  ) {
    throw new Error('Horse photo upload was not acknowledged')
  }
  return body.storageId as Id<'_storage'>
}
