import { PhoneIcon } from '@phosphor-icons/react'
import { buttonVariants } from '#/components/ui/button'
import { ContactLink } from '#/components/ui/contact-link'
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
      actions={
        <>
          {provider.phone && (
            <ContactLink
              kind="phone"
              value={provider.phone}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
              aria-label={t('stables.callProvider', { name: provider.name })}
            >
              <PhoneIcon aria-hidden="true" />
              {provider.phone}
            </ContactLink>
          )}
          {actions}
        </>
      }
    >
      <DashboardItemRecordContent
        title={provider.name}
        titleTone="default"
        meta={
          <>
            <span>{t(`stables.providerTypes.${provider.type}`)}</span>
            {provider.email && (
              <ContactLink kind="email" value={provider.email} />
            )}
          </>
        }
        metaSeparator="dot"
        description={provider.notes}
      />
    </DashboardItemRecordCard>
  )
}
