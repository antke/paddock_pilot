import { dashboardHeroClassName } from '#/components/dashboard/dashboardChrome'
import { buttonVariants } from '#/components/ui/button'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'
import { DocumentsCard } from './DocumentsCard'
import type { DocumentListItem } from './DocumentsCard'
import type { DocumentUploadValues } from './DocumentUploadForm'

type StableDocumentsPageProps = {
  stableId: Id<'stables'>
}

export function StableDocumentsPage({ stableId }: StableDocumentsPageProps) {
  const { data: stable } = useSuspenseQuery(
    convexQuery(api.stables.get, { id: stableId }),
  )
  const { data } = useSuspenseQuery(
    convexQuery(api.stableDocuments.listForStable, { stableId }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId }),
  )
  const generateUploadUrl = useMutation(api.stableDocuments.generateUploadUrl)
  const addDocument = useMutation(api.stableDocuments.add)
  const removeDocument = useMutation(api.stableDocuments.remove)

  const uploadFile = async (file: File) => {
    const uploadUrl = await generateUploadUrl()
    const result = await fetch(uploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    })

    if (!result.ok) throw new Error('Failed to upload document')

    const { storageId } = (await result.json()) as { storageId: Id<'_storage'> }

    return storageId
  }

  const onAdd = async (values: DocumentUploadValues) => {
    try {
      const file = values.file?.item(0)
      if (!file) throw new Error('Choose a file to upload')

      const storageId = await uploadFile(file)
      await addDocument({
        stableId,
        horseId: values.horseId as Id<'horses'> | undefined,
        storageId,
        type: values.type,
        fileName: values.fileName,
        contentType: file.type || undefined,
        size: file.size,
        notes: values.notes,
      })
      toast.success('Document added', { position: 'top-right' })
    } catch (err) {
      toast.error('Could not add document', { position: 'top-right' })
      throw err
    }
  }

  const onRemove = async (id: Id<'stableDocuments'>) => {
    try {
      await removeDocument({ id })
      toast.success('Document removed', { position: 'top-right' })
    } catch {
      toast.error('Could not remove document', { position: 'top-right' })
    }
  }

  return (
    <div className="grid gap-6">
      <header className={dashboardHeroClassName('cards')}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="grid gap-2">
            <p className="text-sm text-muted-foreground">
              {stable?.name ?? 'Stable'}
            </p>
            <h1 className="text-2xl font-semibold">Documents</h1>
            <p className="text-sm text-muted-foreground">
              Keep passport scans, proof of vaccination, insurance paperwork,
              and care reports close to the stable record.
            </p>
          </div>
          <Link
            to="/stables/$stableId"
            params={{ stableId }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Back to stable
          </Link>
        </div>
      </header>

      <DocumentsCard
        title="Stable documents"
        description="Upload stable-wide paperwork or attach documents to a specific horse."
        documents={data.documents as Array<DocumentListItem>}
        canAddDocument={data.canManageStableDocuments}
        horseOptions={horses}
        emptyMessage="No documents have been added yet."
        chrome="soft"
        onAdd={onAdd}
        onRemove={onRemove}
      />
    </div>
  )
}
