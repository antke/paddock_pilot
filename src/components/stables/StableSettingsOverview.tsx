import { ContactLink } from '#/components/ui/contact-link'
import type { StableFormSection } from '#/components/forms/stable/StableFormFields'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import type { ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'

import {
  DetailReference,
  DetailReferenceField,
  DetailReferenceList,
} from '#/components/dashboard/DetailReference'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import {
  DashboardSectionCard,
  DashboardSubsection,
} from '#/components/dashboard/DashboardSectionCard'
import { EditActionLink } from '#/components/ui/edit-action'
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
  // Throws on failure so the archive dialog can show why.
  const onArchive = async () => {
    await archiveStable({ id: stable._id })
    showAppSuccessToast({
      title: t('stables.archived'),
      description: (
        <p>{t('stables.archivedDescription', { name: stable.name })}</p>
      ),
    })
    void navigate({ to: '/stables' })
    return true
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
  /** Renders a pencil; `section` undefined means the full stable form. */
  editAction?: (section: StableFormSection | undefined, label: string) => ReactNode
}) {
  const t = useT()

  const { locale } = useLocale()
  const postalAddress = [
    stable.addressLine1,
    stable.addressLine2,
    stable.postcode,
    stable.country,
  ].filter(Boolean)

  const hasContacts = Boolean(
    stable.contactName || stable.contactPhone || stable.emergencyPhone,
  )
  const hasYardInformation = Boolean(
    stable.description || stable.openingHours || stable.yardRules,
  )

  // Each group's pencil opens its focused edit; the card's opens the full form.
  const edit = (section: StableFormSection | undefined, label: string) =>
    editAction ? (
      editAction(section, label)
    ) : (
      <EditActionLink
        to="/stables/$stableId/edit"
        params={{ stableId: stable._id }}
        search={{ section }}
        label={label}
      />
    )

  return (
    <DashboardLayoutStack gap="comfortable">
      <DashboardSectionCard
        title={stable.name}
        edit={edit(undefined, t('stables.edit'))}
      >
        {/* Short titled groups: paired facts share rows, prose runs full width,
            and a group with nothing recorded is left out. */}
        <DetailReference>
          <DetailReferenceList mobileColumns={2} wideColumns={3}>
            <DetailReferenceField
              label={t('stables.location')}
              value={stable.location}
            />
            <DetailReferenceField
              label={t('stables.owner')}
              value={formatStableUserName(owner, locale)}
            />
            {postalAddress.length > 0 && (
              <DetailReferenceField
                label={t('stables.postalAddress')}
                value={formatLineText(postalAddress)}
                multiline
              />
            )}
          </DetailReferenceList>
          {hasContacts && (
            <DashboardSubsection
              title={t('stables.yardContacts')}
              edit={edit('contacts', t('stables.editYardContacts'))}
            >
              <DetailReferenceList mobileColumns={2} wideColumns={3}>
                <DetailReferenceField
                  label={t('stables.contact')}
                  value={stable.contactName}
                />
                {stable.contactPhone && (
                  <DetailReferenceField
                    label={t('stables.contactPhone')}
                    value={
                      <ContactLink kind="phone" value={stable.contactPhone} />
                    }
                  />
                )}
                {stable.emergencyPhone && (
                  <DetailReferenceField
                    label={t('stables.emergencyPhone')}
                    value={
                      <ContactLink kind="phone" value={stable.emergencyPhone} />
                    }
                  />
                )}
              </DetailReferenceList>
            </DashboardSubsection>
          )}
          {hasYardInformation && (
            <DashboardSubsection
              title={t('stables.sharedTabs.yard')}
              edit={edit('information', t('stables.editYardDetails'))}
            >
              <DetailReferenceList>
                <DetailReferenceField
                  label={t('stables.openingHours')}
                  value={stable.openingHours}
                  fullWidth
                  multiline
                />
                <DetailReferenceField
                  label={t('stables.description')}
                  value={stable.description}
                  fullWidth
                  multiline
                />
                <DetailReferenceField
                  label={t('stables.yardRules')}
                  value={stable.yardRules}
                  fullWidth
                  multiline
                />
              </DetailReferenceList>
            </DashboardSubsection>
          )}
        </DetailReference>
      </DashboardSectionCard>

      <StableArchiveCard stableName={stable.name} onArchive={onArchive} />
    </DashboardLayoutStack>
  )
}
