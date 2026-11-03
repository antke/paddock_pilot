import { createContext, useContext, useEffect, useId, useRef } from 'react'

export type FloatingCreateAction = {
  label: string
  onSelect: () => void
}

export type FloatingActionsRegistry = {
  register: (id: string, action: FloatingCreateAction) => () => void
  claim: () => () => void
  returnFocus: () => HTMLElement | null
}

export const FloatingActionsContext =
  createContext<FloatingActionsRegistry | null>(null)

export function useFloatingActionsRegistry() {
  return useContext(FloatingActionsContext)
}

/**
 * Registers a page shortcut while mounted. Returns false when no registry is
 * available (isolated renders and labs), so callers can fall back to a local
 * floating trigger.
 */
export function useFloatingCreateAction(
  action: FloatingCreateAction | undefined,
) {
  const registry = useFloatingActionsRegistry()
  const id = useId()
  const onSelect = useRef(action?.onSelect)
  onSelect.current = action?.onSelect
  const label = action?.label
  useEffect(() => {
    if (!registry || label === undefined) return
    return registry.register(id, {
      label,
      onSelect: () => onSelect.current?.(),
    })
  }, [registry, id, label])
  return Boolean(registry)
}

/** Explicit page menus and floating buttons own the slot while mounted. */
export function useClaimFloatingSlot(enabled = true) {
  const registry = useFloatingActionsRegistry()
  useEffect(() => {
    if (!registry || !enabled) return
    return registry.claim()
  }, [registry, enabled])
}

/**
 * Renders nothing; mirrors a visible title-row "Add …" action as the page's
 * phone shortcut, for creation that navigates to a route form.
 */
export function FloatingCreateShortcut(props: FloatingCreateAction) {
  useFloatingCreateAction(props)
  return null
}
