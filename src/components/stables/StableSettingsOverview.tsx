import { useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'

import { DetailDisplayField } from '#/components/dashboard/DetailBlocks'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ButtonLink } from '#/components/ui/button'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { formatLineText } from '#/lib/textDisplay'
import { StableArchiveCard } from './StableArchiveCard'
import { formatStableUserName } from './stableSettingsTypes'
import type { StableSettingsData } from './stableSettingsTypes'

export function StableSettingsOverview({
  stable,
  owner,
}: Pick<StableSettingsData, 'stable' | 'owner'>) {
  const archiveStable = useMutation(api.stables.remove)
  const navigate = useNavigate()
  const postalAddress = [
    stable.addressLine1,
    stable.addressLine2,
    stable.postcode,
    stable.country,
  ].filter(Boolean)

  const onArchive = async () => {
    try {
      await archiveStable({ id: stable._id })
      showAppSuccessToast({
        title: 'Stable archived',
        description: <p>{stable.name} is no longer available to members.</p>,
      })
      await navigate({ to: '/stables' })
      return true
    } catch {
      showAppErrorToast({ title: 'Could not archive the stable' })
      return false
    }
  }

  return (
    <DashboardLayoutStack gap="comfortable">
      <DashboardSectionCard
        title={stable.name}
        actions={
          <ButtonLink
            to="/stables/$stableId/edit"
            params={{ stableId: stable._id }}
            variant="outline"
          >
            Edit stable
          </ButtonLink>
        }
        contentLayout="twoColumn"
        contentTextSize="sm"
      >
        <DetailDisplayField
          label="Location"
          value={stable.location}
          valueWeight="normal"
        />
        <DetailDisplayField
          label="Owner"
          value={formatStableUserName(owner)}
          valueWeight="normal"
        />
        {postalAddress.length > 0 && (
          <DetailDisplayField
            label="Postal address"
            span="sm2"
            value={formatLineText(postalAddress)}
            valueWeight="normal"
            multiline
          />
        )}
        {stable.contactName && (
          <DetailDisplayField
            label="Contact"
            value={stable.contactName}
            valueWeight="normal"
          />
        )}
        {stable.contactPhone && (
          <DetailDisplayField
            label="Contact phone"
            value={stable.contactPhone}
            valueWeight="normal"
          />
        )}
        {stable.emergencyPhone && (
          <DetailDisplayField
            label="Emergency phone"
            value={stable.emergencyPhone}
            valueWeight="normal"
          />
        )}
        {stable.description && (
          <DetailDisplayField
            label="Description"
            span="sm2"
            value={stable.description}
            valueWeight="normal"
            multiline
          />
        )}
        {stable.openingHours && (
          <DetailDisplayField
            label="Opening hours"
            span="sm2"
            value={stable.openingHours}
            valueWeight="normal"
            multiline
          />
        )}
        {stable.yardRules && (
          <DetailDisplayField
            label="Yard rules"
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
