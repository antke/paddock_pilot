import { StableUpdates } from '#/components/stables/StableUpdates'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import { useT } from '#/i18n/LocaleProvider'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { DetailDisplayField } from '#/components/dashboard/DetailBlocks'
import {
  RouteEntityNotFoundAlert,
  RouteQueryErrorAlert,
} from '#/components/layout/RouteStatusAlert'
import { StableProvidersCard } from '#/components/stables/StableProvidersCard'
import { StableMembersPage } from '#/components/stables/StableMembersPage'
import {
  StableDirectoryHeader,
  stableDirectoryTabs,
} from '#/components/stables/StableDirectoryHeader'
import type { StableDirectoryTab } from '#/components/stables/StableDirectoryHeader'
import { ButtonLink } from '#/components/ui/button'
import { ContactLink } from '#/components/ui/contact-link'

export const Route = createFileRoute('/stables/_layout/$stableId/stable')({
  validateSearch: (
    search: Record<string, unknown>,
  ): { tab?: StableDirectoryTab } => ({
    tab: stableDirectoryTabs.includes(search.tab as StableDirectoryTab)
      ? (search.tab as StableDirectoryTab)
      : undefined,
  }),
  component: StableDirectory,
  errorComponent: StableDirectoryError,
})

function StableDirectory() {
  const t = useT()
  const { stableId } = Route.useParams()
  const { tab = 'contacts' } = Route.useSearch()
  const id = stableId as Id<'stables'>
  const { data: stable } = useSuspenseQuery(
    convexQuery(api.stables.get, { id }),
  )
  const { data: access } = useSuspenseQuery(
    convexQuery(api.stables.getAccess, { id }),
  )
  if (!stable) return <RouteEntityNotFoundAlert entity="stable" />
  return (
    <DashboardPage>
      <StableDirectoryHeader
        stableId={stableId}
        name={stable.name}
        activeTab={tab}
        isOwner={access.role === 'owner'}
      />
      <div className="min-w-0 text-sm/relaxed">
        {tab === 'contacts' && <StableProvidersCard key={id} stableId={id} />}
        {tab === 'people' && (
          <People key={id} stable={stable} access={access} />
        )}
        {tab === 'yard' && (
          <DashboardLayoutStack>
            <DashboardSectionCard
              title={t('stables.sharedTabs.yard')}
              contentLayout="twoColumn"
              contentTextSize="sm"
              actions={
                access.role === 'owner' && (
                  <ButtonLink
                    to="/stables/$stableId/edit"
                    params={{ stableId }}
                    action="edit"
                    variant="outline"
                  >
                    {t('stables.edit')}
                  </ButtonLink>
                )
              }
            >
              <DetailDisplayField
                label={t('stables.location')}
                value={stable.location}
              />
              <DetailDisplayField
                label={t('stables.contact')}
                value={stable.contactName || t('stables.notAdded')}
              />
              <DetailDisplayField
                label={t('stables.contactPhone')}
                value={
                  stable.contactPhone ? (
                    <ContactLink kind="phone" value={stable.contactPhone} />
                  ) : (
                    t('stables.notAdded')
                  )
                }
              />
              <DetailDisplayField
                label={t('stables.emergencyPhone')}
                value={
                  stable.emergencyPhone ? (
                    <ContactLink kind="phone" value={stable.emergencyPhone} />
                  ) : (
                    t('stables.notAdded')
                  )
                }
              />
              {(
                [
                  [
                    'postalAddress',
                    [
                      stable.addressLine1,
                      stable.addressLine2,
                      stable.postcode,
                      stable.country,
                    ]
                      .filter(Boolean)
                      .join('\n'),
                  ],
                  ['openingHours', stable.openingHours],
                  ['yardRules', stable.yardRules],
                  ['description', stable.description],
                ] as const
              ).map(([key, value]) => (
                <DetailDisplayField
                  key={key}
                  label={t(`stables.${key}`)}
                  value={value || t('stables.notAdded')}
                  span="sm2"
                  multiline
                />
              ))}
            </DashboardSectionCard>
            <StableUpdates key={id} stableId={id} />
          </DashboardLayoutStack>
        )}
      </div>
    </DashboardPage>
  )
}
function People({
  stable,
  access,
}: {
  stable: Doc<'stables'>
  access: { role: 'owner' | 'member' }
}) {
  const { data: people } = useSuspenseQuery(
    convexQuery(api.stableMembers.listByStable, { stableId: stable._id }),
  )
  const { data: myDetails } = useSuspenseQuery(
    convexQuery(api.stableMembers.getMyDetails, { stableId: stable._id }),
  )
  return (
    <StableMembersPage
      stable={stable}
      access={access}
      people={people}
      myDetails={myDetails}
      embedded
    />
  )
}
function StableDirectoryError({ reset }: ErrorComponentProps) {
  const t = useT()
  return (
    <RouteQueryErrorAlert
      reset={reset}
      title={t('stables.directoryLoadFailed')}
      description={t('stables.membersLoadFailedHelp')}
    />
  )
}
