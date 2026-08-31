import { StableProviderForm } from '#/components/stables/StableProviderForm'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { Button } from '#/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { FieldPanel } from '#/components/ui/field'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import type { StableProviderFormSchema } from 'shared/stables/stableProviderSchema'
import { StableProviderCard } from './StableProviderCard'

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
      return true
    } catch (err) {
      showAppErrorToast()
      return false
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
  onRemove: () => Promise<boolean>
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
    <StableProviderCard
      provider={provider}
      actions={
        canManage ? (
          <>
            <Button
              type="button"
              action="edit"
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              Edit
            </Button>
            <StableProviderRemoveAction
              providerName={provider.name}
              isRemoving={isRemoving}
              onRemove={onRemove}
            />
          </>
        ) : undefined
      }
    />
  )
}

export function StableProviderRemoveAction({
  providerName,
  isRemoving,
  onRemove,
}: {
  providerName: string
  isRemoving: boolean
  onRemove: () => Promise<boolean>
}) {
  const [open, setOpen] = useState(false)

  const confirmRemove = async () => {
    const removed = await onRemove()
    if (removed) setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            action="delete"
            variant="ghost"
            size="sm"
            disabled={isRemoving}
          />
        }
      >
        Remove
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {providerName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the contact from the shared provider directory. This
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            action="delete"
            variant="destructive"
            disabled={isRemoving}
            aria-busy={isRemoving || undefined}
            onClick={() => void confirmRemove()}
          >
            {isRemoving ? 'Removing...' : 'Remove provider'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
