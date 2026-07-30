import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import {
  getListFilterEmptyMessage,
  ListFilterControls,
} from '#/components/list-filtering/ListFilterControls'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useMemo } from 'react'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { createDocumentListFilterConfig } from './documentListFilters'
import { DocumentsCard, DocumentUploadDialog } from './DocumentsCard'
import type { DocumentListItem } from './DocumentsCard'
import type { DocumentUploadValues } from './DocumentUploadForm'

type StableDocumentsPageProps = {
  stableId: Id<'stables'>
}

export function StableDocumentsPage({ stableId }: StableDocumentsPageProps) {
  const { data } = useSuspenseQuery(
    convexQuery(api.stableDocuments.listForStable, { stableId }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId }),
  )
  const generateUploadUrl = useMutation(api.stableDocuments.generateUploadUrl)
  const addDocument = useMutation(api.stableDocuments.add)
  const removeDocument = useMutation(api.stableDocuments.remove)
  const documents = data.documents as Array<DocumentListItem>
  const filterConfig = useMemo(
    () => createDocumentListFilterConfig({ horseOptions: horses }),
    [horses],
  )
  const filtering = useListFiltering({
    items: documents,
    config: filterConfig,
  })

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
      showAppSuccessToast({ title: 'Document added' })
    } catch (err) {
      showAppErrorToast({ title: 'Could not add document' })
      throw err
    }
  }

  const onRemove = async (id: Id<'stableDocuments'>) => {
    try {
      await removeDocument({ id })
      showAppSuccessToast({ title: 'Document removed' })
    } catch {
      showAppErrorToast({ title: 'Could not remove document' })
    }
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Documents"
        actions={
          <DocumentUploadDialog
            canAddDocument={data.canManageStableDocuments}
            horseOptions={horses}
            onAdd={onAdd}
          />
        }
      />

      <DocumentsCard
        documents={filtering.items}
        emptyMessage={getListFilterEmptyMessage({
          filtering,
          emptyMessage: 'No documents have been added yet.',
          filteredEmptyMessage: 'No documents match these filters.',
        })}
        listToolbar={
          <ListFilterControls
            config={filterConfig}
            filtering={filtering}
            hideWhenEmpty
            sticky
          />
        }
        chrome="cards"
        rowChrome="soft"
        onRemove={onRemove}
      />
    </DashboardPage>
  )
}
