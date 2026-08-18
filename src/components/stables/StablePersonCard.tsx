import type { ReactNode } from 'react'
import type { Doc } from 'convex/_generated/dataModel'

import {
  DashboardItemCardContent,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { UserAvatar } from '#/components/users/UserAvatar'
import { StableMemberRoleBadge } from './StableBadges'

type StablePersonCardProps = {
  actions?: ReactNode
  footer?: ReactNode
  meta?: ReactNode
  name: string
  photoUrl?: string
  role: Doc<'stableMembers'>['role']
}

export function StablePersonCard({
  actions,
  footer,
  meta,
  name,
  photoUrl,
  role,
}: StablePersonCardProps) {
  return (
    <DashboardItemRecordCard
      chrome="soft"
      density="compact"
      actionBadges={<StableMemberRoleBadge role={role} />}
      actions={actions}
      footer={footer}
    >
      <DashboardItemCardContent
        title={name}
        titleSize="sm"
        leading={<UserAvatar name={name} photoUrl={photoUrl} size="sm" />}
        meta={meta}
        metaSeparator="dot"
      />
    </DashboardItemRecordCard>
  )
}
