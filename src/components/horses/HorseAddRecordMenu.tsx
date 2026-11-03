import { CaretDownIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type { Ref } from 'react'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { useT } from '#/i18n/LocaleProvider'
import { useHorseRecordActions } from './horseRecordActions'

/** Desktop counterpart of the mobile horse action menu's record tasks. */
export function HorseAddRecordMenu({
  horseId,
  horseName,
  stableId,
  triggerRef,
}: {
  horseId: string
  horseName: string
  stableId?: string
  triggerRef?: Ref<HTMLButtonElement>
}) {
  const t = useT()
  const recordActions = useHorseRecordActions()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            ref={triggerRef}
            variant="outline"
            action="create"
            className="min-h-11 whitespace-nowrap"
            aria-label={t('horseDetail.addRecordNamed', { name: horseName })}
          />
        }
      >
        {t('horseDetail.addRecord')}
        <CaretDownIcon data-icon="inline-end" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        aria-label={t('horseDetail.addRecordNamed', { name: horseName })}
        className="w-auto min-w-56 max-w-[calc(100vw-2rem)]"
      >
        {recordActions.map(({ id, label, Icon, to, search }) => (
          <DropdownMenuLinkItem
            key={id}
            render={
              <Link
                resetScroll={false}
                to={stableId ? `/stables/$stableId${to}` : to}
                params={{ horseId, stableId: stableId ?? '' }}
                search={search}
                state={{ horseCreateAction: id }}
              />
            }
          >
            <Icon aria-hidden="true" />
            {label}
          </DropdownMenuLinkItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
