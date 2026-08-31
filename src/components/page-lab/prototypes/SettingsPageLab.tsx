import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DetailDisplayField } from '#/components/dashboard/DetailBlocks'
import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { StableActivityLogCard } from '#/components/stables/StableActivityLogCard'
import { StableArchiveCard } from '#/components/stables/StableArchiveCard'
import { StablePersonCard } from '#/components/stables/StablePersonCard'
import { StableProviderCard } from '#/components/stables/StableProviderCard'
import type { StableProviderCardProvider } from '#/components/stables/StableProviderCard'
import { StableProviderRemoveAction } from '#/components/stables/StableProvidersCard'
import { StableSettingsLayout } from '#/components/stables/StableSettingsPage'
import { Button } from '#/components/ui/button'
import { TabsContent } from '#/components/ui/tabs'

const activityEntries = [
  {
    _id: 'activity-horse-approved',
    action: 'event_horse.approved',
    summary: 'Clover joined Shared vet visit',
    createdAt: Date.UTC(2026, 7, 5),
    actor: { firstName: 'Rae', lastName: 'Monroe' },
  },
  {
    _id: 'activity-member-invited',
    action: 'member_invitation.created',
    summary: 'june@cedarridge.example',
    createdAt: Date.UTC(2026, 7, 4),
    actor: { firstName: 'Mae', lastName: 'Turner' },
  },
  {
    _id: 'activity-stable-updated',
    action: 'stable.updated',
    createdAt: Date.UTC(2026, 7, 2),
    actor: { firstName: 'Mae', lastName: 'Turner' },
  },
]

export function SettingsPageLab({ data }: { data: DashboardLabData }) {
  const stable = data.stable

  return (
    <StableSettingsLayout defaultValue="overview">
      <TabsContent value="overview">
        <DashboardLayoutStack gap="comfortable">
          <DashboardSectionCard
            title={stable.name}
            actions={
              <Button action="edit" variant="outline">
                Edit stable
              </Button>
            }
            contentLayout="twoColumn"
            contentTextSize="sm"
          >
            <DetailDisplayField label="Location" value={stable.location} />
            <DetailDisplayField label="Owner" value="Mae Turner" />
            <DetailDisplayField
              label="Postal address"
              value={[stable.addressLine1, stable.postcode, stable.country]
                .filter(Boolean)
                .join('\n')}
              span="sm2"
              multiline
            />
            <DetailDisplayField label="Contact" value={stable.contactName} />
            <DetailDisplayField
              label="Contact phone"
              value={stable.contactPhone}
            />
            <DetailDisplayField
              label="Opening hours"
              value={stable.openingHours}
              span="sm2"
              multiline
            />
            <DetailDisplayField
              label="Yard rules"
              value={stable.yardRules}
              span="sm2"
              multiline
            />
          </DashboardSectionCard>

          <StableArchiveCard stableName={stable.name} onArchive={() => true} />
        </DashboardLayoutStack>
      </TabsContent>

      <TabsContent value="members">
        <SettingsPeopleCard
          records={[
            {
              title: 'Mae Turner',
              meta: 'mae@cedarridge.example',
              role: 'owner',
            },
            {
              title: 'Rae Monroe',
              meta: 'Yard manager · (555) 014-0912',
              role: 'member',
              canManage: true,
            },
            {
              title: 'June Hale',
              meta: 'june@cedarridge.example',
              role: 'member',
              canManage: true,
            },
          ]}
        />
      </TabsContent>

      <TabsContent value="providers">
        <SettingsListCard
          title="Providers"
          description="Regular care contacts available when scheduling work."
          actionLabel="Add provider"
          records={[
            {
              provider: {
                name: 'Dr. Halley Morse',
                phone: '(555) 014-3300',
                type: 'vet',
              },
              canManage: true,
            },
            {
              provider: {
                name: 'Ben Carter',
                phone: '(555) 014-1902',
                type: 'farrier',
              },
              canManage: true,
            },
            {
              provider: {
                name: 'North County Equine Dental',
                notes: 'Annual visits',
                type: 'dentist',
              },
              canManage: true,
            },
          ]}
        />
      </TabsContent>

      <TabsContent value="deleted-horses">
        <DashboardSectionCard
          title="Deleted horses"
          description="Recently deleted horses remain recoverable for 14 days."
        >
          <DashboardItemRecordCard
            chrome="cards"
            density="compact"
            interactive={false}
          >
            <DashboardItemCardContent
              title="Willow"
              titleSize="sm"
              meta={
                <span>Deleted 3 days ago · Permanently removed in 11 days</span>
              }
            />
          </DashboardItemRecordCard>
        </DashboardSectionCard>
      </TabsContent>

      <TabsContent value="activity">
        <StableActivityLogCard entries={activityEntries} />
      </TabsContent>
    </StableSettingsLayout>
  )
}

function SettingsPeopleCard({
  records,
}: {
  records: Array<{
    title: string
    meta: string
    role: 'owner' | 'member'
    canManage?: boolean
  }>
}) {
  return (
    <DashboardSectionCard
      title="Members"
      description="People with access to this stable."
      actions={<Button action="create">Invite member</Button>}
    >
      <DashboardItemList gap="compact">
        {records.map((record) => (
          <StablePersonCard
            key={record.title}
            name={record.title}
            role={record.role}
            meta={<span>{record.meta}</span>}
            actions={
              record.canManage ? (
                <>
                  <Button type="button" action="edit" variant="ghost" size="sm">
                    Edit details
                  </Button>
                  <Button
                    type="button"
                    action="delete"
                    variant="ghost"
                    size="sm"
                  >
                    Remove
                  </Button>
                </>
              ) : undefined
            }
          />
        ))}
      </DashboardItemList>
    </DashboardSectionCard>
  )
}

function SettingsListCard({
  title,
  description,
  actionLabel,
  records,
}: {
  title: string
  description: string
  actionLabel: string
  records: Array<{
    provider: StableProviderCardProvider
    canManage?: boolean
  }>
}) {
  return (
    <DashboardSectionCard
      title={title}
      description={description}
      actions={<Button action="create">{actionLabel}</Button>}
    >
      <DashboardItemList gap="compact">
        {records.map((record) => (
          <StableProviderCard
            key={record.provider.name}
            provider={record.provider}
            actions={
              <>
                {record.canManage && (
                  <>
                    <Button
                      type="button"
                      action="edit"
                      variant="ghost"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <StableProviderRemoveAction
                      providerName={record.provider.name}
                      isRemoving={false}
                      onRemove={async () => true}
                    />
                  </>
                )}
              </>
            }
          />
        ))}
      </DashboardItemList>
    </DashboardSectionCard>
  )
}
