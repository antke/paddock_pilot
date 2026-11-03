import { getHorseCalendarColour } from 'shared/horses/horseCalendarColours'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useNavigate, useRouter } from '@tanstack/react-router'
import { HorseProfileForm } from '#/components/horses/HorseProfileForm'
import {
  horseProfilePayload,
  uploadHorseProfileImage,
} from '#/components/forms/horse/horseProfileValues'
import { RoutePending } from '#/components/layout/RoutePending'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { isLocalTaskOrigin } from '#/components/layout/mobileTaskNavigation'
import type { HorseEditSection } from '#/components/forms/horse/horseEditSection'

export function PersonalHorseForm({
  horseId,
  focusSection,
}: {
  horseId?: string
  focusSection?: HorseEditSection
}) {
  const horse = useQuery(api.horses.get, horseId ? { id: horseId } : 'skip')
  const permissions = useQuery(
    api.horses.getPermissions,
    horseId ? { id: horseId as Id<'horses'> } : 'skip',
  )
  const providers = useQuery(api.personalProviders.list)
  const colourRoster = useQuery(api.horses.calendarRoster, {})
  const add = useMutation(api.horses.add)
  const update = useMutation(api.horses.update)
  const upload = useMutation(api.horses.generateProfileImageUploadUrl)
  const navigate = useNavigate()
  const router = useRouter()
  if (
    colourRoster === undefined ||
    (horseId && (horse === undefined || permissions === undefined))
  )
    return <RoutePending />
  if (horseId && (!horse || !permissions?.canEditProfile))
    return <RouteEntityNotFoundAlert entity="horse" />
  return (
    <HorseProfileForm
      key={horseId ?? 'new'}
      mode={horseId ? 'edit' : 'create'}
      initialValues={
        horse
          ? { ...horse, calendarColourId: getHorseCalendarColour(horse) }
          : undefined
      }
      colourRoster={colourRoster.filter((item) => item._id !== horseId)}
      ownerSuggestionScope={{ horseIds: horseId ? [horseId] : [] }}
      providers={providers}
      contactMode="copied"
      profileImageId={horse?.profileImageId}
      currentProfileImageUrl={horse?.profileImageUrl}
      focusSection={focusSection}
      uploadImage={(file) => uploadHorseProfileImage(file, upload)}
      save={async (values, imageId) => {
        const payload = horseProfilePayload(values, imageId)
        if (providers?.some((p) => p._id === values.vetProviderId))
          payload.vetProviderId = undefined
        if (providers?.some((p) => p._id === values.farrierProviderId))
          payload.farrierProviderId = undefined
        if (horseId) {
          await update({ ...payload, id: horseId as Id<'horses'> })
          return horseId as Id<'horses'>
        }
        return add(payload)
      }}
      onSaved={async (id) => {
        // Contextual edits return to the horse view that opened them.
        const location = router.state.location
        const origin = location.state.taskOrigin
        if (horseId && isLocalTaskOrigin(origin)) {
          if (location.state.__TSR_index === origin.index + 1) {
            router.history.back()
            return
          }
          await navigate({ href: origin.href, replace: true })
          window.scrollTo({ top: origin.scrollY })
          return
        }
        await navigate({
          to: '/horses/$horseId',
          params: { horseId: id },
          // A completed form must not be the next destination of Back.
          replace: true,
        })
      }}
    />
  )
}
