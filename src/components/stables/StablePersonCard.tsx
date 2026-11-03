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
      chrome="flat"
      density="compact"
      interactive={false}
      // With row actions the badge leads the action column; a read-only row
      // keeps it beside the name so it never drops onto its own line.
      actionBadges={actions ? <StableMemberRoleBadge role={role} /> : undefined}
      actions={actions}
      footer={footer}
    >
      <DashboardItemCardContent
        title={
          actions ? (
            name
          ) : (
            <>
              {name}{' '}
              <StableMemberRoleBadge
                role={role}
                className="ml-1 min-w-0 align-[0.1em]"
              />
            </>
          )
        }
        titleSize="sm"
        titleClassName="wrap-anywhere"
        metaClassName="[&>span]:min-w-0 [&>span]:max-w-full [&>span]:wrap-anywhere"
        leading={<UserAvatar name={name} photoUrl={photoUrl} size="sm" />}
        meta={meta}
        metaSeparator="dot"
      />
    </DashboardItemRecordCard>
  )
}
