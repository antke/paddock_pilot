import type { ReactNode } from 'react'

import { useSmallScreen } from '#/lib/useSmallScreen'
import { MobileActionBar } from './MobileActionBar'

/**
 * A daily page's one primary action (Add event, Add training log). Desktop
 * shows it in the page title row; phones show it as a full-width bar above
 * the bottom navigation instead, so it is always in reach and neither the
 * title-row button nor the round shortcut is repeated. Place it in
 * `DashboardPageHeader.actions`.
 */
export function PagePrimaryAction({
  children,
  mobile = children,
}: {
  children: ReactNode
  /** A phone-specific variant, such as recording completed work. */
  mobile?: ReactNode
}) {
  const small = useSmallScreen()
  return small ? <MobileActionBar>{mobile}</MobileActionBar> : children
}
