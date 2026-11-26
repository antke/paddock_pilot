import { PencilSimpleIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { ButtonLink } from '#/components/ui/button'
import { DropdownMenuLinkItem } from '#/components/ui/dropdown-menu'
import { MobileFloatingAction } from '#/components/layout/MobileFloatingAction'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { useT } from '#/i18n/LocaleProvider'

type EventEditProps = {
  eventId: string
  training?: boolean
  stableId?: string
  search?: { date?: string; horseId?: string; participationId?: string }
}

function useEventEditLink({
  eventId,
  training = false,
  stableId,
  search,
}: EventEditProps) {
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
  return { label, link: { ...destination, search, state: taskState } }
}

export function EventEditAction(props: EventEditProps) {
  const t = useT()
  const { label, link } = useEventEditLink(props)
  return (
    <ButtonLink {...link} variant="outline" aria-label={label}>
      <PencilSimpleIcon aria-hidden="true" />
      {/* The full name stays for assistive tech; the header shows just "Edit". */}
      {t('common.edit')}
    </ButtonLink>
  )
}

/** Edit as the first item of the phone actions menu. */
export function EventEditMenuItem(props: EventEditProps) {
  const { label, link } = useEventEditLink(props)
  return (
    <DropdownMenuLinkItem render={<Link {...link} />}>
      <PencilSimpleIcon aria-hidden="true" />
      {label}
    </DropdownMenuLinkItem>
  )
}

/** The round pencil above the phone navigation, so Edit is always within reach. */
export function EventEditFloatingAction(props: EventEditProps) {
  const { label, link } = useEventEditLink(props)
  return (
    <MobileFloatingAction>
      <ButtonLink
        {...link}
        variant="solid"
        size="fab"
        action="edit"
        aria-label={label}
        title={label}
      />
    </MobileFloatingAction>
  )
}
