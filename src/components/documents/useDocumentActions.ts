import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import type { DocumentUploadValues } from './DocumentUploadForm'

type UseDocumentActionsOptions = {
  stableId: Id<'stables'>
  fixedHorseId?: Id<'horses'>
}

export function useDocumentActions({
  stableId,
  fixedHorseId,
}: UseDocumentActionsOptions) {
  const generateUploadUrl = useMutation(api.stableDocuments.generateUploadUrl)
  const addDocument = useMutation(api.stableDocuments.add)
  const removeDocument = useMutation(api.stableDocuments.remove)

  const add = async (values: DocumentUploadValues) => {
    try {
      const file = values.file?.item(0)
      if (!file) throw new Error('Choose a file to upload')

      const uploadUrl = await generateUploadUrl()
      const result = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      })

      if (!result.ok) throw new Error('Failed to upload document')

      const { storageId } = (await result.json()) as {
        storageId: Id<'_storage'>
      }

      await addDocument({
        stableId,
        horseId:
          fixedHorseId ?? (values.horseId as Id<'horses'> | undefined),
        storageId,
        type: values.type,
        fileName: values.fileName,
        contentType: file.type || undefined,
        size: file.size,
        notes: values.notes,
      })
      showAppSuccessToast({ title: 'Document added' })
    } catch (error) {
      showAppErrorToast({ title: 'Could not add document' })
      throw error
    }
  }

  const remove = async (id: Id<'stableDocuments'>) => {
    try {
      await removeDocument({ id })
      showAppSuccessToast({ title: 'Document removed' })
    } catch (error) {
      showAppErrorToast({ title: 'Could not remove document' })
      throw error
    }
  }

  return { add, remove }
}
