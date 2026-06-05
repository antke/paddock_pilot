import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { stableDocumentTypeLabels } from 'shared/stables/stableDocumentSchema'
import {
  DocumentUploadForm
  
} from './DocumentUploadForm'
import type {DocumentUploadValues} from './DocumentUploadForm';

export type DocumentListItem = {
  document: Doc<'stableDocuments'>
  horseName?: string
  eventTitle?: string
  fileUrl?: string | null
  canManage: boolean
}

type HorseOption = {
  _id: Id<'horses'>
  name: string
}

type DocumentsCardProps = {
  title: string
  description: string
  documents: Array<DocumentListItem>
  canAddDocument: boolean
  horseOptions?: Array<HorseOption>
  fixedHorseId?: Id<'horses'>
  emptyMessage: string
  onAdd: (values: DocumentUploadValues) => Promise<void>
  onRemove: (id: Id<'stableDocuments'>) => Promise<void>
}

const fileSizeFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
})

export function DocumentsCard({
  title,
  description,
  documents,
  canAddDocument,
  horseOptions,
  fixedHorseId,
  emptyMessage,
  onAdd,
  onRemove,
}: DocumentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {canAddDocument && (
          <div className="rounded-lg border p-4">
            <DocumentUploadForm
              horseOptions={horseOptions}
              fixedHorseId={fixedHorseId}
              onSubmit={onAdd}
            />
          </div>
        )}

        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="grid gap-3">
            {documents.map((item) => (
              <DocumentRow key={item.document._id} item={item} onRemove={onRemove} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DocumentRow({
  item,
  onRemove,
}: {
  item: DocumentListItem
  onRemove: (id: Id<'stableDocuments'>) => Promise<void>
}) {
  const { document } = item

  return (
    <div className="grid gap-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{document.fileName}</span>
            <Badge variant="outline">{stableDocumentTypeLabels[document.type]}</Badge>
            {item.horseName && <Badge variant="secondary">{item.horseName}</Badge>}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {document.contentType && <span>{document.contentType}</span>}
            {document.size !== undefined && <span>{formatFileSize(document.size)}</span>}
            {item.eventTitle && <span>Linked to {item.eventTitle}</span>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.fileUrl ? (
            <Button asChild type="button" variant="outline" size="sm">
              <a href={item.fileUrl} target="_blank" rel="noreferrer">
                Open
              </a>
            </Button>
          ) : (
            <Badge variant="secondary">Metadata only</Badge>
          )}
          {item.canManage && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemove(document._id)}
            >
              Remove
            </Button>
          )}
        </div>
      </div>

      {document.notes && (
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {document.notes}
        </p>
      )}
    </div>
  )
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${fileSizeFormatter.format(size / 1024)} KB`

  return `${fileSizeFormatter.format(size / (1024 * 1024))} MB`
}
