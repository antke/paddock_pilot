import { useT, useLocale } from '#/i18n/LocaleProvider'
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
import { useMemo } from 'react'
import { createDocumentListFilterConfig } from './documentListFilters'
import { DocumentsCard, DocumentUploadDialog } from './DocumentsCard'
import type { DocumentListItem } from './DocumentsCard'
import { useDocumentActions } from './useDocumentActions'

type StableDocumentsPageProps = {
  stableId: Id<'stables'>
  /** Inside the stable view: the section card carries the title and Add. */
  embedded?: boolean
}

export function StableDocumentsPage({
  stableId,
  embedded = false,
}: StableDocumentsPageProps) {
  const t = useT()
  const { locale } = useLocale()

  const { data } = useSuspenseQuery(
    convexQuery(api.stableDocuments.listForStable, { stableId }),
  )
  const { data: horses } = useSuspenseQuery(
    convexQuery(api.horses.list, { stableId }),
  )
  const documents = data.documents as Array<DocumentListItem>
  const documentActions = useDocumentActions({ stableId })
  const filterConfig = useMemo(
    () => createDocumentListFilterConfig({ horseOptions: horses, locale }),
    [horses, locale],
  )
  const filtering = useListFiltering({
    items: documents,
    config: filterConfig,
  })

  const addDocument = (
    <DocumentUploadDialog
      enableSharing
      canAddDocument={data.canManageStableDocuments}
      horseOptions={horses}
      onAdd={documentActions.add}
    />
  )
  const card = (
    <DocumentsCard
      title={embedded ? t('documents.documents') : undefined}
      actions={embedded ? addDocument : undefined}
      documents={filtering.items}
      emptyMessage={getListFilterEmptyMessage({
        filtering,
        emptyMessage: t('documents.empty'),
        filteredEmptyMessage: t('documents.filteredEmpty'),
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
      onRemove={documentActions.remove}
    />
  )
  if (embedded) return card

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={t('documents.documents')}
        actions={addDocument}
      />
      {card}
    </DashboardPage>
  )
}
