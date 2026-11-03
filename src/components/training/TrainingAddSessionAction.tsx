import { PagePrimaryAction } from '#/components/layout/PagePrimaryAction'
import { useTaskOriginState } from '#/components/layout/mobileTaskNavigation'
import { ButtonLink } from '#/components/ui/button'
import { useT } from '#/i18n/LocaleProvider'

/**
 * The Training page's primary action: "Add training session" in the desktop
 * title row, and "Add training log" in the phone bar above the navigation.
 * Renders nothing when the viewer cannot record for any listed horse.
 */
export function TrainingAddSessionAction({
  stableId,
  canRecord,
}: {
  stableId?: string
  canRecord: boolean
}) {
  const t = useT()
  const taskState = useTaskOriginState()
  if (!canRecord) return null
  return (
    <PagePrimaryAction
      mobile={
        stableId ? (
          <ButtonLink
            to="/stables/$stableId/training/create"
            params={{ stableId }}
            search={{ intent: 'record' }}
            state={taskState}
            action="record"
          >
            {t('trainingViews.recordCompleted')}
          </ButtonLink>
        ) : (
          <ButtonLink
            to="/events/create"
            search={{ training: true, intent: 'record' }}
            state={taskState}
            action="record"
          >
            {t('trainingViews.recordCompleted')}
          </ButtonLink>
        )
      }
    >
      {stableId ? (
        <ButtonLink
          to="/stables/$stableId/training/create"
          params={{ stableId }}
          state={taskState}
          action="record"
        >
          {t('trainingViews.addSession')}
        </ButtonLink>
      ) : (
        <ButtonLink
          to="/events/create"
          search={{ training: true }}
          state={taskState}
          action="record"
        >
          {t('trainingViews.addSession')}
        </ButtonLink>
      )}
    </PagePrimaryAction>
  )
}
