import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'
import { DocumentsCard  } from './DocumentsCard'
import type {DocumentListItem} from './DocumentsCard';
import type { DocumentUploadValues } from './DocumentUploadForm'

type HorseDocumentsCardProps = {
  horse: Doc<'horses'>
}

export function HorseDocumentsCard({ horse }: HorseDocumentsCardProps) {
  const { data } = useSuspenseQuery(
    convexQuery(api.stableDocuments.listForHorse, { horseId: horse._id }),
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
        stableId: horse.stableId,
        horseId: horse._id,
        storageId,
        type: values.type,
        fileName: values.fileName,
        contentType: file.type || undefined,
        size: file.size,
        notes: values.notes,
      })
      toast.success('Document added', { position: 'top-right' })
    } catch {
      toast.error('Could not add document', { position: 'top-right' })
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
    <DocumentsCard
      title="Documents"
      description="Passport scans, vaccination proof, insurance paperwork, vet reports, farrier notes, and dental records for this horse."
      documents={data.documents as Array<DocumentListItem>}
      canAddDocument={data.canManage}
      fixedHorseId={horse._id}
      emptyMessage="No documents have been added for this horse yet."
      onAdd={onAdd}
      onRemove={onRemove}
    />
  )
}
