import type { Doc } from 'convex/_generated/dataModel'
import type { ReactNode } from 'react'

import {
  DashboardItemRecordCard,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
import { stableProviderTypeLabels } from 'shared/stables/stableProviderSchema'

export type StableProviderCardProvider = Pick<
  Doc<'stableProviders'>,
  'email' | 'name' | 'notes' | 'phone' | 'type'
>

type StableProviderCardProps = {
  actions?: ReactNode
  provider: StableProviderCardProvider
}

export function StableProviderCard({
  actions,
  provider,
}: StableProviderCardProps) {
  return (
    <DashboardItemRecordCard
      chrome="cards"
      density="compact"
      interactive={false}
      actions={actions}
    >
      <DashboardItemRecordContent
        title={provider.name}
        titleTone="open"
        meta={
          <>
            <span>{stableProviderTypeLabels[provider.type]}</span>
            {provider.phone && <span>{provider.phone}</span>}
            {provider.email && <span>{provider.email}</span>}
          </>
        }
        metaSeparator="dot"
        description={provider.notes}
      />
    </DashboardItemRecordCard>
  )
}
