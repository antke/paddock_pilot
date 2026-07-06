import { useEffect } from 'react'
import type { ReactNode } from 'react'

export type HorseDetailCreateActionChange = (action: ReactNode | null) => void

export function useHorseDetailCreateAction(
  action: ReactNode | null,
  onCreateActionChange?: HorseDetailCreateActionChange,
) {
  useEffect(() => {
    if (!onCreateActionChange) return

    onCreateActionChange(action)

    return () => onCreateActionChange(null)
  }, [action, onCreateActionChange])
}
