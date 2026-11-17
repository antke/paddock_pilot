import { useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { ConfirmActionButton } from '#/components/ui/confirm-action'
import { useT } from '#/i18n/LocaleProvider'

export function LeaveStableButton({
  stableId,
  stableName,
}: {
  stableId: Id<'stables'>
  stableName: string
}) {
  const t = useT()
  const navigate = useNavigate()
  const leave = useMutation(api.stableMembers.leave)
  return (
    <ConfirmActionButton
      label={t('stables.leaveStable')}
      title={t('stables.leaveStableNamed', { name: stableName })}
      description={t('stables.leaveStableHelp')}
      cancelLabel={t('stables.stayInStable')}
      failedLabel={t('stables.leaveStableFailed')}
      onConfirm={async () => {
        await leave({ stableId })
        await navigate({ to: '/stables' })
      }}
    />
  )
}
