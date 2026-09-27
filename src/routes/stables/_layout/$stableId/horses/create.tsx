import { useMutation } from 'convex/react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { HorseProfileForm } from '#/components/horses/HorseProfileForm'
import {
  horseProfilePayload,
  uploadHorseProfileImage,
} from '#/components/forms/horse/horseProfileValues'

export const Route = createFileRoute(
  '/stables/_layout/$stableId/horses/create',
)({ component: RouteComponent })

function RouteComponent() {
  const addHorse = useMutation(api.horses.add)
  const generateUploadUrl = useMutation(
    api.horses.generateProfileImageUploadUrl,
  )
  const navigate = useNavigate()
  const { stableId } = Route.useParams()
  return (
    <HorseProfileForm
      key={stableId}
      mode="create"
      uploadImage={(file) => uploadHorseProfileImage(file, generateUploadUrl)}
      save={(values, imageId) =>
        addHorse({
          ...horseProfilePayload(values, imageId),
          stableId: stableId as Id<'stables'>,
        })
      }
      onSaved={(horseId) =>
        navigate({
          to: '/stables/$stableId/horses/$horseId',
          params: { stableId, horseId },
        })
      }
    />
  )
}
