import { useWorkspace } from '#/components/layout/WorkspaceContext'
import { EventIcon, TrainingIcon } from '#/components/icons/domain-icons'
import { Link } from '@tanstack/react-router'
import {
  PencilSimpleIcon,
  BellIcon,
  FirstAidKitIcon,
  GrainsIcon,
  ScalesIcon,
  PillIcon,
  FilePlusIcon,
} from '@phosphor-icons/react'
import type { Ref } from 'react'
import { DropdownMenuSeparator } from '#/components/ui/dropdown-menu'
import {
  MobileActionMenu,
  MobileActionMenuItem,
} from '#/components/layout/MobileActionMenu'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { useT } from '#/i18n/LocaleProvider'

export type HorseCreateAction =
  'reminder' | 'health' | 'nutrition' | 'weight' | 'medication' | 'document'
declare module '@tanstack/react-router' {
  interface HistoryState {
    horseCreateAction?: HorseCreateAction
  }
}

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

  const recordActions = [
    {
      id: 'reminder',
      label: t('reminders.addCare'),
      Icon: BellIcon,
      to: '/horses/$horseId/care',
      search: {},
    },
    {
      id: 'health',
      label: t('careRecords.addHealthIssue'),
      Icon: FirstAidKitIcon,
      to: '/horses/$horseId/care',
      search: { careView: 'health' },
    },
    {
      id: 'nutrition',
      label: t('careRecords.addNutrition'),
      Icon: GrainsIcon,
      to: '/horses/$horseId/nutrition',
      search: {},
    },
    {
      id: 'weight',
      label: t('careRecords.addWeight'),
      Icon: ScalesIcon,
      to: '/horses/$horseId/nutrition',
      search: { nutritionView: 'weight' },
    },
    {
      id: 'medication',
      label: t('careRecords.addMedication'),
      Icon: PillIcon,
      to: '/horses/$horseId/nutrition',
      search: { nutritionView: 'medication' },
    },
    {
      id: 'document',
      label: t('documents.add'),
      Icon: FilePlusIcon,
      to: '/horses/$horseId/documents',
      search: {},
    },
  ] as const

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
          <DropdownMenuSeparator />
          <MobileActionMenuItem
            render={
              <Link
                to="/horses/$horseId/edit"
                params={{ horseId }}
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
