import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Id } from 'convex/_generated/dataModel'
import { RoutePending } from '#/components/layout/RoutePending'
import { EventEditor } from './EventEditor'

/** Creation owns a visible destination; editing retains the existing audience. */
export function EventCreationEditor(props: ComponentProps<typeof EventEditor>) {
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
  const options = useQuery(
    api.events.creationOptions,
    props.mode === 'create' ? {} : 'skip',
  )
  if (props.mode === 'edit') return <EventEditor {...props} />
  if (!options) return <RoutePending />
  return (
    <EventEditor
      {...props}
      destinations={options}
      onDestinationChange={setStableId}
      providers={
        stableId
          ? (stableProviders?.providers ?? [])
          : (personalProviders ?? [])
      }
      onSave={(values) =>
        props.onSave({
          ...values,
          destination: values.stableId ? 'stable' : 'personal',
          sharing: undefined,
        })
      }
    />
  )
}
