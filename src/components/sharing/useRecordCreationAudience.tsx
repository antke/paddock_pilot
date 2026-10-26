import { useWorkspace } from '#/components/layout/WorkspaceContext'
import { createRequestId } from '#/lib/createRequestId'
import { useRef, useState } from 'react'
import type { Id } from 'convex/_generated/dataModel'
import { NewRecordAudience } from './RecordAudience'
import type { SharingChoice } from './RecordAudience'

export type RecordCreationOptions = {
  shareWithStable?: boolean
  requestId?: string
}
export function useRecordCreationAudience(horseId?: Id<'horses'>) {
  const defaultShared = Boolean(useWorkspace()?.stableId)
  const request = useRef(createRequestId())
  const [choices, setChoices] = useState<Array<SharingChoice>>([])
  return {
    control: horseId ? (
      <NewRecordAudience
        defaultShared={defaultShared}
        horseIds={[horseId]}
        choices={choices}
        onChange={setChoices}
      />
    ) : null,
    options: {
      requestId: request.current,
      shareWithStable:
        choices.find((choice) => choice.horseId === horseId)?.enabled ??
        defaultShared,
    },
    reset: () => {
      request.current = createRequestId()
      setChoices([])
    },
  }
}
