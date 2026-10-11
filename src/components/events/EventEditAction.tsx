import { PencilSimpleIcon } from '@phosphor-icons/react'
import { ButtonLink } from '#/components/ui/button'
import { MobileFloatingAction } from '#/components/layout/MobileFloatingAction'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { useT } from '#/i18n/LocaleProvider'

export function EventEditAction({
  eventId,
  training = false,
  stableId,
  mobile = false,
  search,
}: {
  eventId: string
  training?: boolean
  stableId?: string
  mobile?: boolean
  search?: { date?: string; horseId?: string; participationId?: string }
}) {
  const t = useT()
  const taskState = useTaskOriginState()
  const label = t(training ? 'eventViews.editTraining' : 'eventViews.edit')
  const destination =
    stableId && training
      ? {
          to: '/stables/$stableId/training/$eventId/edit' as const,
          params: { stableId, eventId },
        }
      : { to: '/events/$eventId/edit' as const, params: { eventId } }
  const action = (
    <ButtonLink
      {...destination}
      search={search}
      state={taskState}
      variant={mobile ? 'default' : 'outline'}
      size={mobile ? 'fab' : 'default'}
      aria-label={label}
    >
      <PencilSimpleIcon aria-hidden="true" />
      {!mobile && label}
    </ButtonLink>
  )
  return mobile ? <MobileFloatingAction>{action}</MobileFloatingAction> : action
}
