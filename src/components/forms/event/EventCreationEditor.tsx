import { useCalendarSelection } from '#/components/events/calendarSourceSelection'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Id } from 'convex/_generated/dataModel'
import { RoutePending } from '#/components/layout/RoutePending'
import { EventEditor } from './EventEditor'

/** Creation owns a visible destination; editing retains the existing audience. */
export function EventCreationEditor(props: ComponentProps<typeof EventEditor>) {
  const { includeSavedStables } = useCalendarSelection()
  const [stableId, setStableId] = useState(props.initialValues.stableId)
  const stableProviders = useQuery(
    api.stableProviders.listForStable,
    props.mode === 'create' && stableId
      ? { stableId: stableId as Id<'stables'> }
      : 'skip',
  )
  const personalProviders = useQuery(
    api.personalProviders.list,
    props.mode === 'create' && !stableId ? {} : 'skip',
  )
  const options = useQuery(api.events.creationOptions, {
    eventId: props.eventId,
  })
  if (!options) return <RoutePending />
  if (props.mode === 'edit')
    return <EventEditor {...props} people={options.people} />
  return (
    <EventEditor
      {...props}
      destinations={options}
      people={options.people}
      onDestinationChange={setStableId}
      providers={
        stableId
          ? (stableProviders?.providers ?? [])
          : (personalProviders ?? [])
      }
      onAcknowledged={(id, values) => {
        includeSavedStables(values.sharedStableIds ?? [])
        props.onAcknowledged?.(id, values)
      }}
      onSave={(values) => {
        const personal = values.horseIds.every((id) =>
          options.personal.some(
            (horse) => horse._id === id && horse.canShareAcrossStables,
          ),
        )
        const origin = personal ? undefined : values.sharedStableIds?.[0]
        return props.onSave({
          ...values,
          stableId: origin,
          destination: origin ? 'stable' : 'personal',
          sharing: undefined,
        })
      }}
    />
  )
}
