import { createContext, useContext } from 'react'

type RecordCreateActions = {
  hideTriggers: boolean
  requestedAction?: string
  consumeAction: () => void
  returnFocus: () => HTMLElement | null
}

/** Lets a page's shared action menu open the existing section-owned editor. */
const RecordCreateActionsContext = createContext<RecordCreateActions | null>(
  null,
)
export const RecordCreateActionsProvider = RecordCreateActionsContext.Provider
export function useRecordCreateActions() {
  return useContext(RecordCreateActionsContext)
}
