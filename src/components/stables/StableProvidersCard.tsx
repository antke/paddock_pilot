import { StableProviderForm } from '#/components/stables/StableProviderForm'
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
    }
  }

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
    <Card>
      <CardHeader>
        <CardTitle>Provider directory</CardTitle>
        <CardDescription>
          Keep vets, farriers, dentists, physios, saddlers, and other care
          contacts ready for event planning.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {data.canManage && (
          <div className="rounded-lg border p-4">
            <StableProviderForm onSubmit={onAddProvider} />
          </div>
        )}

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
      <div className="rounded-lg border p-4">
        <StableProviderForm
          provider={provider}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    )
  }

  return (
    <div className="group/open grid cursor-pointer gap-3 border border-transparent px-3 py-3 transition-colors hover:rounded-row hover:border-primary/15 hover:bg-primary/5">
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
