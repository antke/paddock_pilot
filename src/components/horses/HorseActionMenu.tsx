import { useWorkspace } from '#/components/layout/WorkspaceContext'
import { EventIcon, TrainingIcon } from '#/components/icons/domain-icons'
import { Link } from '@tanstack/react-router'
import { PencilSimpleIcon } from '@phosphor-icons/react'
import type { Ref } from 'react'
import {
  MobileActionMenu,
  MobileActionMenuItem,
  MobileActionMenuSeparator,
} from '#/components/layout/MobileActionMenu'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { useT } from '#/i18n/LocaleProvider'
import { useHorseRecordActions } from './horseRecordActions'

export function HorseActionMenu({
  horseId,
  horseName,
  canManageHorse,
  canAddRecords = false,
  triggerRef,
}: {
  horseId: string
  horseName: string
  canManageHorse: boolean
  canAddRecords?: boolean
  triggerRef?: Ref<HTMLButtonElement>
}) {
  const workspace = useWorkspace()
  const t = useT()
  const taskState = useTaskOriginState()
  if (!canManageHorse && !canAddRecords) return null

  const recordActions = useHorseRecordActions()

  return (
    <MobileActionMenu
      label={t('horseDetail.actions', { name: horseName })}
      triggerRef={triggerRef}
    >
      {canManageHorse && (
        <MobileActionMenuItem
          render={
            <Link
              to={
                workspace?.stableId
                  ? '/stables/$stableId/events/create'
                  : '/events/create'
              }
              params={{ stableId: workspace?.stableId ?? '' }}
              search={{ horseId }}
              state={taskState}
            />
          }
        >
          <EventIcon aria-hidden="true" className="size-5" />
          {t('eventEditor.addEvent')}
        </MobileActionMenuItem>
      )}
      {canAddRecords && (
        <MobileActionMenuItem
          render={
            <Link
              to={
                workspace?.stableId
                  ? '/stables/$stableId/events/create'
                  : '/events/create'
              }
              params={{ stableId: workspace?.stableId ?? '' }}
              search={{ horseId, training: true, intent: 'record' }}
              state={taskState}
            />
          }
        >
          <TrainingIcon aria-hidden="true" className="size-5" />
          {t('trainingViews.recordCompleted')}
        </MobileActionMenuItem>
      )}
      {canAddRecords &&
        recordActions.map(({ id, label, Icon, to, search }) => (
          <MobileActionMenuItem
            key={id}
            render={
              <Link
                to={workspace?.stableId ? `/stables/$stableId${to}` : to}
                params={{ horseId, stableId: workspace?.stableId ?? '' }}
                search={search}
                state={() => ({ ...taskState(), horseCreateAction: id })}
              />
            }
          >
            <Icon aria-hidden="true" className="size-5" />
            {label}
          </MobileActionMenuItem>
        ))}
      {canManageHorse && (
        <>
          <MobileActionMenuSeparator />
          <MobileActionMenuItem
            render={
              <Link
                to={
                  workspace?.stableId
                    ? '/stables/$stableId/horses/$horseId/edit'
                    : '/horses/$horseId/edit'
                }
                params={{ horseId, stableId: workspace?.stableId ?? '' }}
                state={taskState}
              />
            }
          >
            <PencilSimpleIcon aria-hidden="true" className="size-5" />
            {t('horseDetail.edit')}
          </MobileActionMenuItem>
        </>
      )}
    </MobileActionMenu>
  )
}
