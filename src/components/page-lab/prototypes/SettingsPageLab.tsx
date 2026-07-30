import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DetailDisplayField } from '#/components/dashboard/DetailBlocks'
import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'

export function SettingsPageLab({ data }: { data: DashboardLabData }) {
  const stable = data.stable

  return (
    <DashboardPage>
      <DashboardPageHeader title="Stable settings" />

      <Tabs defaultValue="overview">
        <TabsList variant="section">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DashboardSectionCard
            title={stable.name}
            actions={<Button variant="outline">Edit stable</Button>}
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
        </TabsContent>

        <TabsContent value="members">
          <SettingsListCard
            title="Members"
            description="People with access to this stable."
            actionLabel="Invite member"
            records={[
              {
                title: 'Mae Turner',
                meta: 'mae@cedarridge.example',
                badge: 'Owner',
              },
              {
                title: 'Rae Monroe',
                meta: 'Yard manager · (555) 014-0912',
                badge: 'Manager',
                canManage: true,
              },
              {
                title: 'June Hale',
                meta: 'june@cedarridge.example',
                badge: 'Member',
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
                title: 'Dr. Halley Morse',
                meta: 'Vet · (555) 014-3300',
                badge: 'Vet',
                canManage: true,
              },
              {
                title: 'Ben Carter',
                meta: 'Farrier · (555) 014-1902',
                badge: 'Farrier',
                canManage: true,
              },
              {
                title: 'North County Equine Dental',
                meta: 'Annual visits',
                badge: 'Dentist',
                canManage: true,
              },
            ]}
          />
        </TabsContent>
      </Tabs>
    </DashboardPage>
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
    title: string
    meta: string
    badge: string
    canManage?: boolean
  }>
}) {
  return (
    <DashboardSectionCard
      title={title}
      description={description}
      actions={<Button variant="secondary">{actionLabel}</Button>}
    >
      <DashboardItemList gap="flush">
        {records.map((record) => (
          <DashboardItemRecordCard
            key={record.title}
            chrome="soft"
            density="compact"
            actions={
              <>
                <Badge variant="outline" className="min-w-20">
                  {record.badge}
                </Badge>
                {record.canManage && (
                  <>
                    <Button type="button" variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button type="button" variant="ghost" size="sm">
                      Remove
                    </Button>
                  </>
                )}
              </>
            }
            actionsClassName="grid w-full grid-cols-[5rem_auto_auto] items-center justify-start gap-2 sm:w-[19rem] sm:grid-cols-[5rem_7rem_5rem]"
          >
            <DashboardItemCardContent
              title={record.title}
              titleSize="sm"
              meta={<span>{record.meta}</span>}
            />
          </DashboardItemRecordCard>
        ))}
      </DashboardItemList>
    </DashboardSectionCard>
  )
}
