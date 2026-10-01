import { useT } from '#/i18n/LocaleProvider'
import { StableProviderForm } from '#/components/stables/StableProviderForm'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import {
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
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
import { showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import type { StableProviderFormSchema } from 'shared/stables/stableProviderSchema'
import { StableProviderCard } from './StableProviderCard'

export function StableProvidersCard({ stableId }: { stableId: Id<'stables'> }) {
  const t = useT()

  const { data } = useSuspenseQuery(
    convexQuery(api.stableProviders.listForStable, { stableId }),
  )
  const addProvider = useMutation(api.stableProviders.add)
  const updateProvider = useMutation(api.stableProviders.update)
  const removeProvider = useMutation(api.stableProviders.remove)
  return (
    <StableProvidersView
      providers={data.providers}
      canManage={data.canManage}
      onAdd={async (values) => {
        await addProvider({ stableId, ...values })
        showAppSuccessToast({
          title: t('stables.providerSaved'),
          description: t('stables.providerAddedDescription', {
            name: values.name,
          }),
        })
      }}
      onUpdate={async (provider, values) => {
        await updateProvider({ id: provider._id, ...values })
        showAppSuccessToast({
          title: t('stables.providerUpdated'),
          description: t('stables.providerUpdatedDescription', {
            name: values.name,
          }),
        })
      }}
      onRemove={async (provider) => {
        await removeProvider({ id: provider._id })
        showAppSuccessToast({
          title: t('stables.providerRemoved'),
          description: t('stables.providerRemovedDescription', {
            name: provider.name,
          }),
        })
      }}
    />
  )
}

/** Shared directory UI. Mutation callbacks reject failures and resolve after persistence. */
export function StableProvidersView({
  providers,
  canManage,
  onAdd,
  onUpdate,
  onRemove,
}: {
  providers: Array<Doc<'stableProviders'>>
  canManage: boolean
  onAdd: (values: StableProviderFormSchema) => Promise<void>
  onUpdate: (
    provider: Doc<'stableProviders'>,
    values: StableProviderFormSchema,
  ) => Promise<void>
  onRemove: (provider: Doc<'stableProviders'>) => Promise<void>
}) {
  const t = useT()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const creating = useRef(false)
  const directory = useRef<HTMLDivElement>(null)
  return (
    <DashboardSectionCard
      ref={directory}
      role="group"
      aria-label={t('stables.providerDirectory')}
      tabIndex={-1}
      title={t('stables.providerDirectory')}
      description={t('stables.providerDirectoryHelp')}
      actions={
        canManage ? (
          <CreateRecordDialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              if (!creating.current) setIsCreateOpen(open)
            }}
            triggerLabel={t('stables.addProvider')}
            title={t('stables.addProvider')}
            description={t('stables.addProviderHelp')}
          >
            <StableProviderForm
              onCancel={() => setIsCreateOpen(false)}
              onSubmit={async (values) => {
                creating.current = true
                try {
                  await onAdd(values)
                  setIsCreateOpen(false)
                } finally {
                  creating.current = false
                }
              }}
            />
          </CreateRecordDialog>
        ) : undefined
      }
      contentGap="loose"
    >
      <DashboardItemList gap="compact">
        {providers.length === 0 ? (
          <DashboardEmptyState>{t('stables.noProviders')}</DashboardEmptyState>
        ) : (
          providers.map((provider) => (
            <ProviderRow
              key={provider._id}
              provider={provider}
              canManage={canManage}
              onSubmit={(values) => onUpdate(provider, values)}
              onRemove={async () => {
                await onRemove(provider)
                return true
              }}
              removalFocusTarget={() => directory.current}
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
  onSubmit,
  onRemove,
  removalFocusTarget,
}: {
  provider: Doc<'stableProviders'>
  canManage: boolean
  onSubmit: (values: StableProviderFormSchema) => Promise<void>
  onRemove: () => Promise<boolean>
  removalFocusTarget: () => HTMLElement | null
}) {
  const t = useT()

  const [isEditing, setIsEditing] = useState(false)
  const editTrigger = useRef<HTMLButtonElement>(null)
  const wasEditing = useRef(false)
  useEffect(() => {
    if (wasEditing.current && !isEditing) editTrigger.current?.focus()
    wasEditing.current = isEditing
  }, [isEditing])
  if (isEditing)
    return (
      <DashboardItemRecordCard interactive={false} chrome="flat">
        <StableProviderForm
          provider={provider}
          onSubmit={async (values) => {
            await onSubmit(values)
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      </DashboardItemRecordCard>
    )
  return (
    <StableProviderCard
      provider={provider}
      actions={
        canManage ? (
          <>
            <Button
              ref={editTrigger}
              type="button"
              action="edit"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              {t('stables.editAction')}
            </Button>
            <StableProviderRemoveAction
              providerName={provider.name}
              isRemoving={false}
              onRemove={onRemove}
              removalFocusTarget={removalFocusTarget}
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
  removalFocusTarget,
}: {
  providerName: string
  isRemoving: boolean
  onRemove: () => Promise<boolean>
  removalFocusTarget?: () => HTMLElement | null
}) {
  const t = useT()

  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const removing = useRef(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const busy = pending || isRemoving
  const confirmRemove = async () => {
    if (removing.current || isRemoving) return
    removing.current = true
    setPending(true)
    setFailed(false)
    try {
      const removed = await onRemove()
      if (removed) setOpen(false)
      else setFailed(true)
    } catch {
      setFailed(true)
    } finally {
      removing.current = false
      setPending(false)
    }
  }
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!removing.current && !isRemoving) {
          setOpen(nextOpen)
          if (nextOpen) setFailed(false)
        }
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            ref={trigger}
            type="button"
            action="delete"
            variant="ghost"
            size="sm"
            disabled={busy}
          />
        }
      >
        {t('stables.remove')}
      </AlertDialogTrigger>
      <AlertDialogContent
        finalFocus={() =>
          trigger.current?.isConnected
            ? trigger.current
            : removalFocusTarget?.()
        }
      >
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('stables.remove')}
            {providerName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('stables.removeProviderHelp')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {failed && (
          <RouteStatusAlert
            tone="danger"
            title={t('stables.removeProviderFailed')}
            description={t('stables.removeNotConfirmed')}
          />
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>
            {t('stables.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            action="delete"
            variant="destructive"
            disabled={busy}
            aria-busy={busy || undefined}
            onClick={() => void confirmRemove()}
          >
            {busy ? t('stables.removing') : t('stables.removeProvider')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
