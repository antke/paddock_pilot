import { createContext, useContext } from 'react'
import type { Id } from 'convex/_generated/dataModel'

/** Route scope only. A remembered stable must never become the current workspace. */
export const WorkspaceContext = createContext<{
  label: string
  stableId?: Id<'stables'>
} | null>(null)

export const useWorkspace = () => useContext(WorkspaceContext)
