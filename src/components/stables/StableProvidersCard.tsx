import { StableProviderForm } from '#/components/stables/StableProviderForm'
import { DashboardBadgeList } from '#/components/dashboard/DashboardBadgeList'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  DashboardItemList,
  DashboardItemRecordCard,
  DashboardItemRecordContent,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { Button } from '#/components/ui/button'
import { FieldPanel } from '#/components/ui/field'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import type { StableProviderFormSchema } from 'shared/stables/stableProviderSchema'
import { StableProviderTypeBadge } from './StableBadges'

type StableProvidersCardProps = {
  stableId: Id<'stables'>
}

export function StableProvidersCard({ stableId }: StableProvidersCardProps) {
  const { data } = useSuspenseQuery(
    convexQuery(api.stableProviders.listForStable, { stableId }),
  )
  const addProvider = useMutation(api.stableProviders.add)
  const updateProvider = useMutation(api.stableProviders.update)
  const removeProvider = useMutation(api.stableProviders.remove)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProviderId, setEditingProviderId] = useState<string>()
  const [removingProviderId, setRemovingProviderId] = useState<string>()

  const onAddProvider = async (values: StableProviderFormSchema) => {
    try {
      await addProvider({ stableId, ...values })
      showAppSuccessToast({
        title: 'Provider saved',
        description: <p>{values.name} was added to the directory.</p>,
      })
    } catch (err) {
      showAppErrorToast()
      throw err
    }
  }

  const onAddProviderFromDialog = async (values: StableProviderFormSchema) => {
    await onAddProvider(values)
    setIsCreateOpen(false)
  }

  const createDialog = data.canManage ? (
    <CreateRecordDialog
      open={isCreateOpen}
      onOpenChange={setIsCreateOpen}
      triggerLabel="Add provider"
      title="Add provider"
      description="Add a care contact to the stable provider directory."
    >
      <StableProviderForm onSubmit={onAddProviderFromDialog} />
    </CreateRecordDialog>
  ) : null

  const onUpdateProvider = async (
    provider: Doc<'stableProviders'>,
    values: StableProviderFormSchema,
  ) => {
    try {
      await updateProvider({ id: provider._id, ...values })
      setEditingProviderId(undefined)
      showAppSuccessToast({
        title: 'Provider updated',
        description: <p>{values.name} is up to date.</p>,
      })
    } catch (err) {
      showAppErrorToast()
    }
  }

  const onRemoveProvider = async (provider: Doc<'stableProviders'>) => {
    try {
      setRemovingProviderId(provider._id)
      await removeProvider({ id: provider._id })
      showAppSuccessToast({
        title: 'Provider removed',
        description: <p>{provider.name} was removed from the directory.</p>,
      })
    } catch (err) {
      showAppErrorToast()
    } finally {
      setRemovingProviderId(undefined)
    }
  }

  return (
    <DashboardSectionCard
      title="Provider directory"
      description="Keep vets, farriers, dentists, physios, saddlers, and other care contacts ready for event planning."
      actions={createDialog}
      contentGap="loose"
    >
      <DashboardItemList gap="compact">
        {data.providers.length === 0 ? (
          <DashboardEmptyState chrome="cards">
            No providers saved yet.
          </DashboardEmptyState>
        ) : (
          data.providers.map((provider) => (
            <ProviderRow
              key={provider._id}
              provider={provider}
              canManage={data.canManage}
              isEditing={editingProviderId === provider._id}
              isRemoving={removingProviderId === provider._id}
              onEdit={() => setEditingProviderId(provider._id)}
              onCancel={() => setEditingProviderId(undefined)}
              onSubmit={(values) => onUpdateProvider(provider, values)}
              onRemove={() => onRemoveProvider(provider)}
            />
          ))
        )}
      </DashboardItemList>
    </DashboardSectionCard>
  )
}

function ProviderRow({
  provider,
  canManage,
  isEditing,
  isRemoving,
  onEdit,
  onCancel,
  onSubmit,
  onRemove,
}: {
  provider: Doc<'stableProviders'>
  canManage: boolean
  isEditing: boolean
  isRemoving: boolean
  onEdit: () => void
  onCancel: () => void
  onSubmit: (values: StableProviderFormSchema) => Promise<void>
  onRemove: () => Promise<void>
}) {
  if (isEditing) {
    return (
      <FieldPanel>
        <StableProviderForm
          provider={provider}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </FieldPanel>
    )
  }

  return (
    <DashboardItemRecordCard
      chrome="soft"
      actions={
        canManage ? (
          <>
            <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isRemoving}
              onClick={() => void onRemove()}
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </Button>
          </>
        ) : undefined
      }
    >
      <DashboardItemRecordContent
        title={provider.name}
        titleTone="open"
        meta={
          <>
            {provider.phone && <span>{provider.phone}</span>}
            {provider.email && <span>{provider.email}</span>}
          </>
        }
        metaSeparator="dot"
        titleBadges={
          <DashboardBadgeList>
            <StableProviderTypeBadge type={provider.type} />
          </DashboardBadgeList>
        }
        description={provider.notes}
      />
    </DashboardItemRecordCard>
  )
}
