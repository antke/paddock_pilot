import { useState } from 'react'
import {
  RouteEntityNotFoundAlert,
  RouteStatusAlert,
} from '#/components/layout/RouteStatusAlert'
import { ButtonLink } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { HorseDeletionActions } from '#/components/horses/HorseDeletionActions'
import { HorseProfileForm } from '#/components/horses/HorseProfileForm'
import {
  horseProfilePayload,
  uploadHorseProfileImage,
} from '#/components/forms/horse/horseProfileValues'

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

function EditHorseForm({ horse }: { horse: Doc<'horses'> }) {
  const navigate = useNavigate()
  const updateHorse = useMutation(api.horses.update)
  const generateUploadUrl = useMutation(
    api.horses.generateProfileImageUploadUrl,
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [removed, setRemoved] = useState(false)
  return (
    <>
      <HorseProfileForm
        mode="edit"
        embedded
        initialValues={horse}
        profileImageId={horse.profileImageId}
        disabled={deleting || removed}
        onPendingChange={setSaving}
        uploadImage={(file) => uploadHorseProfileImage(file, generateUploadUrl)}
        save={async (values, imageId) => {
          await updateHorse({
            id: horse._id,
            ...horseProfilePayload(values, imageId),
          })
          return horse._id
        }}
        onSaved={(horseId) =>
          navigate({
            to: '/stables/$stableId/horses/$horseId',
            params: { stableId: horse.stableId, horseId },
          })
        }
      />
      <HorseDeletionActions
        horse={horse}
        disabled={saving}
        onPendingChange={setDeleting}
        onAcknowledged={() => setRemoved(true)}
        onDeleted={() =>
          navigate({
            to: '/stables/$stableId/horses',
            params: { stableId: horse.stableId },
          })
        }
      />
    </>
  )
}
