import type { Doc } from 'convex/_generated/dataModel'
import type { ReactNode } from 'react'

import {
  DashboardItemRecordCard,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
import { useT } from '#/i18n/LocaleProvider'

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
  const t = useT()
  return (
    <DashboardItemRecordCard
      chrome="flat"
      density="compact"
      interactive={false}
      actions={actions}
    >
      <DashboardItemRecordContent
        title={provider.name}
        titleTone="default"
        meta={
          <>
            <span>{t(`stables.providerTypes.${provider.type}`)}</span>
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
