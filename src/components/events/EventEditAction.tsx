import { PencilSimpleIcon } from '@phosphor-icons/react'
import { ButtonLink } from '#/components/ui/button'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { useT } from '#/i18n/LocaleProvider'

export function EventEditAction({
  eventId,
  training = false,
  stableId,
  search,
}: {
  eventId: string
  training?: boolean
  stableId?: string
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
  return (
    <ButtonLink
      {...destination}
      search={search}
      state={taskState}
      variant="outline"
      aria-label={label}
    >
      <PencilSimpleIcon aria-hidden="true" />
      {label}
    </ButtonLink>
  )
}
