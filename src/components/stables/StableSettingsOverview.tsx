import { useLocale, useT } from '#/i18n/LocaleProvider'
import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'

import { DetailDisplayField } from '#/components/dashboard/DetailBlocks'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ButtonLink } from '#/components/ui/button'
import { showAppSuccessToast } from '#/components/ui/sonner'
import { formatLineText } from '#/lib/textDisplay'
import { StableArchiveCard } from './StableArchiveCard'
import { formatStableUserName } from './stableSettingsTypes'
import type { StableSettingsData } from './stableSettingsTypes'

export function StableSettingsOverview({
  stable,
  owner,
}: Pick<StableSettingsData, 'stable' | 'owner'>) {
  const t = useT()

  const archiveStable = useMutation(api.stables.remove)
  const navigate = useNavigate()
  const onArchive = async () => {
    try {
      await archiveStable({ id: stable._id })
      showAppSuccessToast({
        title: t('stables.archived'),
        description: (
          <p>{t('stables.archivedDescription', { name: stable.name })}</p>
        ),
      })
      void navigate({ to: '/stables' })
      return true
    } catch {
      return false
    }
  }

  return (
    <StableSettingsOverviewContent
      stable={stable}
      owner={owner}
      onArchive={onArchive}
    />
  )
}

export function StableSettingsOverviewContent({
  stable,
  owner,
  onArchive,
  editAction,
}: Pick<StableSettingsData, 'stable' | 'owner'> & {
  onArchive: () => boolean | Promise<boolean>
  editAction?: ReactNode
}) {
  const t = useT()

  const { locale } = useLocale()
  const postalAddress = [
    stable.addressLine1,
    stable.addressLine2,
    stable.postcode,
    stable.country,
  ].filter(Boolean)

  return (
    <DashboardLayoutStack gap="comfortable">
      <DashboardSectionCard
        title={stable.name}
        actions={
          editAction ?? (
            <ButtonLink
              to="/stables/$stableId/edit"
              params={{ stableId: stable._id }}
              action="edit"
              variant="outline"
            >
              {t('stables.edit')}
            </ButtonLink>
          )
        }
        contentLayout="twoColumn"
        contentTextSize="sm"
      >
        <DetailDisplayField
          label={t('stables.location')}
          value={stable.location}
          valueWeight="normal"
        />
        <DetailDisplayField
          label={t('stables.owner')}
          value={formatStableUserName(owner, locale)}
          valueWeight="normal"
        />
        {postalAddress.length > 0 && (
          <DetailDisplayField
            label={t('stables.postalAddress')}
            span="sm2"
            value={formatLineText(postalAddress)}
            valueWeight="normal"
            multiline
          />
        )}
        {stable.contactName && (
          <DetailDisplayField
            label={t('stables.contact')}
            value={stable.contactName}
            valueWeight="normal"
          />
        )}
        {stable.contactPhone && (
          <DetailDisplayField
            label={t('stables.contactPhone')}
            value={stable.contactPhone}
            valueWeight="normal"
          />
        )}
        {stable.emergencyPhone && (
          <DetailDisplayField
            label={t('stables.emergencyPhone')}
            value={stable.emergencyPhone}
            valueWeight="normal"
          />
        )}
        {stable.description && (
          <DetailDisplayField
            label={t('stables.description')}
            span="sm2"
            value={stable.description}
            valueWeight="normal"
            multiline
          />
        )}
        {stable.openingHours && (
          <DetailDisplayField
            label={t('stables.openingHours')}
            span="sm2"
            value={stable.openingHours}
            valueWeight="normal"
            multiline
          />
        )}
        {stable.yardRules && (
          <DetailDisplayField
            label={t('stables.yardRules')}
            span="sm2"
            value={stable.yardRules}
            valueWeight="normal"
            multiline
          />
        )}
      </DashboardSectionCard>

      <StableArchiveCard stableName={stable.name} onArchive={onArchive} />
    </DashboardLayoutStack>
  )
}
