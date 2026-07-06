import { StableProviderForm } from '#/components/stables/StableProviderForm'
import { dashboardItemCardClassName } from '#/components/dashboard/DashboardItemCard'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { stableProviderTypeLabels } from 'shared/stables/stableProviderSchema'
import type { StableProviderFormSchema } from 'shared/stables/stableProviderSchema'

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
      toast.success('Provider saved', {
        description: <p>{values.name} was added to the directory.</p>,
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
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
      toast.success('Provider updated', {
        description: <p>{values.name} is up to date.</p>,
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    }
  }

  const onRemoveProvider = async (provider: Doc<'stableProviders'>) => {
    try {
      setRemovingProviderId(provider._id)
      await removeProvider({ id: provider._id })
      toast.success('Provider removed', {
        description: <p>{provider.name} was removed from the directory.</p>,
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    } finally {
      setRemovingProviderId(undefined)
    }
  }

  return (
    <Card className="bg-card/80">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid gap-1.5">
            <CardTitle className="text-2xl leading-tight">
              Provider directory
            </CardTitle>
            <CardDescription className="text-base leading-6">
              Keep vets, farriers, dentists, physios, saddlers, and other care
              contacts ready for event planning.
            </CardDescription>
          </div>
          {createDialog}
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          {data.providers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No providers saved yet.
            </p>
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
        </div>
      </CardContent>
    </Card>
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
      <div className="rounded-row bg-muted/30 p-5">
        <StableProviderForm
          provider={provider}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    )
  }

  return (
    <div
      className={dashboardItemCardClassName({
        interactive: true,
        className: 'grid gap-3',
      })}
    >
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold underline-offset-4 transition-colors group-hover/open:text-primary group-hover/open:underline">
            {provider.name}
          </h3>
          <Badge variant="outline">
            {stableProviderTypeLabels[provider.type]}
          </Badge>
        </div>
        {(provider.phone || provider.email) && (
          <p className="text-sm text-muted-foreground">
            {[provider.phone, provider.email].filter(Boolean).join(' · ')}
          </p>
        )}
        {provider.notes && (
          <p className="whitespace-pre-wrap text-sm">{provider.notes}</p>
        )}
      </div>

      {canManage && (
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shadow-none"
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shadow-none"
            disabled={isRemoving}
            onClick={() => void onRemove()}
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      )}
    </div>
  )
}
