import { useT, useLocale } from '#/i18n/LocaleProvider'
import {
  getListFilterEmptyMessage,
  ListFilterControls,
} from '#/components/list-filtering/ListFilterControls'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMemo } from 'react'
import { createDocumentListFilterConfig } from './documentListFilters'
import { DocumentsCard, DocumentUploadDialog } from './DocumentsCard'
import type { DocumentListItem } from './DocumentsCard'
import { useDocumentActions } from './useDocumentActions'

type HorseDocumentsCardProps = {
  horse: Doc<'horses'>
}

export function HorseDocumentsCard({ horse }: HorseDocumentsCardProps) {
  const t = useT()
  const { locale } = useLocale()

  const { data } = useSuspenseQuery(
    convexQuery(api.stableDocuments.listForHorse, { horseId: horse._id }),
  )
  const documents = data.documents as Array<DocumentListItem>
  const documentActions = useDocumentActions({
    stableId: horse.stableId,
    fixedHorseId: horse._id,
  })
  const filterConfig = useMemo(
    () => createDocumentListFilterConfig({ locale }),
    [locale],
  )
  const filtering = useListFiltering({
    items: documents,
    config: filterConfig,
  })

  return (
    <DocumentsCard
      title={t('documents.documents')}
      description={t('documents.horseDescription')}
      actions={
        <DocumentUploadDialog
          canAddDocument={data.canManage}
          fixedHorseId={horse._id}
          onAdd={documentActions.add}
        />
      }
      documents={filtering.items}
      emptyMessage={getListFilterEmptyMessage({
        filtering,
        emptyMessage: t('documents.horseEmpty'),
        filteredEmptyMessage: t('documents.filteredEmpty'),
      })}
      listToolbar={
        <ListFilterControls
          config={filterConfig}
          filtering={filtering}
          hideWhenEmpty
        />
      }
      chrome="cards"
      onRemove={documentActions.remove}
    />
  )
}
