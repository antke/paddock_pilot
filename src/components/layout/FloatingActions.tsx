import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'

import { Button } from '#/components/ui/button'
import { useT } from '#/i18n/LocaleProvider'
import {
  MobileActionMenu,
  MobileActionMenuGroup,
  MobileActionMenuItem,
} from './MobileActionMenu'
import { MobileFloatingAction } from './MobileFloatingAction'
import { FloatingActionsContext } from './floatingActionsContext'
import type {
  FloatingActionsRegistry,
  FloatingCreateAction,
} from './floatingActionsContext'

/**
 * One thumb-reachable phone shortcut per page. Sections keep their visible
 * title-row "Add …" buttons and also register the same action here; the
 * outlet shows a single circular button for one action, or a menu of them for
 * several. A page that renders its own menu or floating button claims the slot
 * and the registry stays out of its way.
 */
type Registration = FloatingCreateAction & { id: string; order: number }

let registrationOrder = 0

export function FloatingActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReadonlyArray<Registration>>([])
  const [claims, setClaims] = useState(0)
  const trigger = useRef<HTMLButtonElement>(null)

  const register = useCallback((id: string, action: FloatingCreateAction) => {
    setActions((current) => {
      const existing = current.find((item) => item.id === id)
      const next = {
        ...action,
        id,
        order: existing?.order ?? ++registrationOrder,
      }
      return [...current.filter((item) => item.id !== id), next].sort(
        (a, b) => a.order - b.order,
      )
    })
    return () => setActions((current) => current.filter((a) => a.id !== id))
  }, [])

  const claim = useCallback(() => {
    setClaims((count) => count + 1)
    return () => setClaims((count) => count - 1)
  }, [])

  const registry = useMemo<FloatingActionsRegistry>(
    () => ({
      register,
      claim,
      returnFocus: () =>
        trigger.current?.isConnected &&
        trigger.current.getClientRects().length > 0
          ? trigger.current
          : null,
    }),
    [register, claim],
  )

  return (
    <FloatingActionsContext.Provider value={registry}>
      {children}
      {claims === 0 && (
        <FloatingActionsOutlet actions={actions} triggerRef={trigger} />
      )}
    </FloatingActionsContext.Provider>
  )
}

function FloatingActionsOutlet({
  actions,
  triggerRef,
}: {
  actions: ReadonlyArray<Registration>
  triggerRef: RefObject<HTMLButtonElement | null>
}) {
  const t = useT()
  if (actions.length === 0) return null
  if (actions.length === 1) {
    const [action] = actions
    return (
      <MobileFloatingAction claimSlot={false}>
        <Button
          ref={triggerRef}
          type="button"
          data-slot="floating-create-action"
          action="create"
          variant="solid"
          size="fab"
          aria-label={action.label}
          title={action.label}
          onClick={action.onSelect}
        >
          <span className="sr-only">{action.label}</span>
        </Button>
      </MobileFloatingAction>
    )
  }
  return (
    <MobileActionMenu
      label={t('dashboard.quickAdd')}
      triggerRef={triggerRef}
      claimSlot={false}
    >
      <MobileActionMenuGroup label={t('dashboard.quickAdd')}>
        {actions.map((action) => (
          <MobileActionMenuItem key={action.id} onClick={action.onSelect}>
            {action.label}
          </MobileActionMenuItem>
        ))}
      </MobileActionMenuGroup>
    </MobileActionMenu>
  )
}
