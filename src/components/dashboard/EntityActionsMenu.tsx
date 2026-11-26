import { DotsThreeVerticalIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useT } from '#/i18n/LocaleProvider'

/**
 * A detail page's actions on phones: one square button in the Back row that
 * opens every header action. Pass it as `DashboardEntityHero`'s `phoneMenu`.
 */
export function EntityActionsMenu({ children }: { children: ReactNode }) {
  const t = useT()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={t('common.actions')}
          />
        }
      >
        <DotsThreeVerticalIcon weight="bold" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 max-w-[calc(100vw-2rem)] p-2"
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
