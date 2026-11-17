import { useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { HorseProfileForm } from '#/components/horses/HorseProfileForm'
import {
  horseProfilePayload,
  uploadHorseProfileImage,
} from '#/components/forms/horse/horseProfileValues'
import { RoutePending } from '#/components/layout/RoutePending'

/** Adds a horse to the stable chosen in the form, preset from the page that opened it. */
export function HorseCreateForm({
  initialStableId,
}: {
  initialStableId?: string
}) {
  const [stableId, setStableId] = useState(initialStableId)
  const stable = stableId as Id<'stables'> | undefined
  const stables = useQuery(api.stables.list)
  const stableHorses = useQuery(
    api.horses.list,
    stable ? { stableId: stable } : 'skip',
  )
  const stableDirectory = useQuery(
    api.stableProviders.listForStable,
    stable ? { stableId: stable } : 'skip',
  )
  const personalRoster = useQuery(
    api.horses.calendarRoster,
    stable ? 'skip' : {},
  )
  const personalProviders = useQuery(
    api.personalProviders.list,
    stable ? 'skip' : {},
  )
  const add = useMutation(api.horses.add)
  const upload = useMutation(api.horses.generateProfileImageUploadUrl)
  const navigate = useNavigate()

  const roster = stable ? stableHorses : personalRoster
  // Wait once for the first colour roster; a later stable change keeps the
  // form mounted so typed values survive while the new stable loads.
  const ready = useRef(false)
  if (stables !== undefined && roster !== undefined) ready.current = true
  if (!ready.current || stables === undefined) return <RoutePending />

  return (
    <HorseProfileForm
      mode="create"
      colourRoster={roster ?? []}
      providers={stable ? stableDirectory?.providers : personalProviders}
      contactMode={stable ? 'linked' : 'copied'}
      ownerSuggestionScope={stable ? { stableId: stable } : { horseIds: [] }}
      breedSuggestions={
        stable ? stableHorses?.flatMap((horse) => horse.breed ?? []) : []
      }
      stableChoice={{ stables, value: stableId, onChange: setStableId }}
      uploadImage={(file) => uploadHorseProfileImage(file, upload)}
      save={(values, imageId) => {
        const payload = horseProfilePayload(values, imageId)
        if (!stable) {
          // Personal contacts are copied onto the horse, never linked.
          if (personalProviders?.some((p) => p._id === values.vetProviderId))
            payload.vetProviderId = undefined
          if (
            personalProviders?.some((p) => p._id === values.farrierProviderId)
          )
            payload.farrierProviderId = undefined
        }
        return add({ ...payload, stableId: stable })
      }}
      onSaved={(horseId) =>
        // The new horse takes the form's place, so Back skips the form.
        stable
          ? navigate({
              to: '/stables/$stableId/horses/$horseId',
              params: { stableId: stable, horseId },
              replace: true,
            })
          : navigate({
              to: '/horses/$horseId',
              params: { horseId },
              replace: true,
            })
      }
    />
  )
}
