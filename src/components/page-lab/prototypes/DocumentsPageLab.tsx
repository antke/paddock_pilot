import { ListFilterControls } from '#/components/list-filtering/ListFilterControls'
import { useListFiltering } from '#/components/list-filtering/useListFiltering'
import { createDocumentListFilterConfig } from '#/components/documents/documentListFilters'
import {
  DocumentsCard,
  DocumentUploadDialog,
} from '#/components/documents/DocumentsCard'
import type { DocumentListItem } from '#/components/documents/DocumentsCard'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { StableDocumentFileState } from 'shared/stables/stableDocumentSchema'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { DashboardSection } from '#/components/dashboard/DashboardSection'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { Button } from '#/components/ui/button'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import type { DocumentUploadValues } from '#/components/documents/DocumentUploadForm'

type LabHorseOption = {
  _id: Id<'horses'>
  name: string
}

type LabDocumentInput = {
  id: string
  type: Doc<'stableDocuments'>['type']
  fileName: string
  contentType?: string
  size?: number
  notes?: string
  horse?: LabHorseOption
  event?: Doc<'events'>
  fileUrl?: string
  fileState?: StableDocumentFileState
  canManage?: boolean
}

export function DocumentsPageLab({ data }: { data: DashboardLabData }) {
  const sampleMode = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sampleMode)
    return (
      <DashboardEmptyState>
        Document simulations are available only with development sample data.
      </DashboardEmptyState>
    )
  return <SampleDocuments key={data.stable._id} data={data} />
}

function SampleDocuments({ data }: { data: DashboardLabData }) {
  const formId = useId()
  const horseOptions = useMemo(() => getLabHorseOptions(data), [data])
  const [documents, setDocuments] = useState<Array<DocumentListItem>>([])
  const objectUrls = useRef(new Set<string>())
  const epoch = useRef(0)
  const [outcome, setOutcome] = useState('success')
  const outcomeRef = useRef('success')
  const [duration, setDuration] = useState('1200')
  const [pending, setPending] = useState(0)
  const [scope, setScope] = useState('stable')
  const [permission, setPermission] = useState('manager')
  const [revision, setRevision] = useState(0)
  const nextId = useRef(0)
  const [message, setMessage] = useState(
    'Sample documents only. Add and remove affect this preview. Open and Download use valid local files; nothing is uploaded to storage.',
  )
  const makeUrl = (file: Blob) => {
    const url = URL.createObjectURL(file)
    objectUrls.current.add(url)
    return url
  }
  const releaseUrls = () => {
    for (const url of objectUrls.current) URL.revokeObjectURL(url)
    objectUrls.current.clear()
  }
  const createSamples = () =>
    createLabDocuments(data, horseOptions, () =>
      makeUrl(
        new Blob(
          [
            'Paddock Pilot sample document. Fictional information for interface review only.',
          ],
          { type: 'text/plain' },
        ),
      ),
    )
  useEffect(() => {
    epoch.current += 1
    setDocuments(createSamples())
    return () => {
      epoch.current += 1
      releaseUrls()
    }
    // This fixture is remounted when its stable changes; URLs live exactly as long as the sample.
  }, [])
  const fixedHorseId = scope === 'horse' ? horseOptions[0]?._id : undefined
  const scopedDocuments = documents
    .filter((item) => !fixedHorseId || item.document.horseId === fixedHorseId)
    .map((item) => ({
      ...item,
      canManage: permission === 'manager' && item.canManage,
    }))
  const filterConfig = useMemo(
    () =>
      createDocumentListFilterConfig({
        horseOptions: scope === 'stable' ? horseOptions : [],
      }),
    [horseOptions, scope],
  )
  const filtering = useListFiltering({
    items: scopedDocuments,
    config: filterConfig,
  })
  const simulate = async (apply: () => void, successMessage: string) => {
    const requestEpoch = epoch.current
    const nextOutcome = outcomeRef.current
    outcomeRef.current = 'success'
    setOutcome('success')
    setPending((value) => value + 1)
    setMessage('Sample request pending. No change has been applied yet.')
    try {
      await new Promise((resolve) =>
        window.setTimeout(resolve, Number(duration)),
      )
      if (requestEpoch !== epoch.current)
        throw new Error('Sample view changed before completion')
      if (nextOutcome === 'failure') {
        setMessage(
          'Sample request failed. Your records were not changed. The next attempt will succeed.',
        )
        throw new Error('Sample document request rejected')
      }
      apply()
      setMessage(successMessage)
    } finally {
      if (requestEpoch === epoch.current) setPending((value) => value - 1)
    }
  }
  const addDocument = (values: DocumentUploadValues) =>
    simulate(() => {
      const file = values.file.item(0)
      if (!file) throw new Error('Choose a sample file')
      const horse = horseOptions.find((item) => item._id === values.horseId)
      const input: LabDocumentInput = {
        id: `uploaded-${++nextId.current}`,
        type: values.type,
        fileName: values.fileName,
        contentType: file.type || undefined,
        size: file.size,
        notes: values.notes,
        horse,
        fileUrl: makeUrl(file),
      }
      setDocuments((current) => [
        {
          document: createLabDocument(
            data,
            input,
            data.stable.ownerId,
            Date.now(),
          ),
          horseName: horse?.name,
          fileUrl: input.fileUrl,
          fileState: 'available',
          canManage: true,
        },
        ...current,
      ])
    }, 'Document added locally. Its file stays in this browser preview; nothing was uploaded.')
  const removeDocument = (id: Id<'stableDocuments'>) =>
    simulate(() => {
      const item = documents.find((entry) => entry.document._id === id)
      if (item?.fileUrl && objectUrls.current.delete(item.fileUrl))
        URL.revokeObjectURL(item.fileUrl)
      setDocuments((current) =>
        current.filter((entry) => entry.document._id !== id),
      )
    }, 'Document removed from this sample only. No live record or storage file changed.')

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={
          scope === 'horse'
            ? `${horseOptions[0]?.name ?? 'Horse'} documents sample`
            : 'Documents sample'
        }
        description="Actual document rows, upload form and filters with local files and simulated writes. Download saves a real sample file to your device; Open shows that local file."
        actions={
          <DocumentUploadDialog
            key={`${revision}-${scope}-${permission}`}
            canAddDocument={permission === 'manager'}
            horseOptions={horseOptions}
            fixedHorseId={fixedHorseId}
            onAdd={addDocument}
          />
        }
      />
      <DashboardSection>
        <FieldGrid>
          <Field>
            <FieldLabel htmlFor={`${formId}-outcome`}>
              Next document request
            </FieldLabel>
            <Select
              id={`${formId}-outcome`}
              value={outcome}
              disabled={pending > 0}
              onChange={(event) => {
                setOutcome(event.target.value)
                outcomeRef.current = event.target.value
              }}
            >
              <option value="success">Success</option>
              <option value="failure">Failure, then retry</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${formId}-duration`}>
              Sample response time
            </FieldLabel>
            <Select
              id={`${formId}-duration`}
              value={duration}
              disabled={pending > 0}
              onChange={(event) => setDuration(event.target.value)}
            >
              <option value="100">0.1 seconds</option>
              <option value="1200">1.2 seconds</option>
              <option value="6000">6 seconds — inspect pending state</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${formId}-scope`}>
              Sample document scope
            </FieldLabel>
            <Select
              id={`${formId}-scope`}
              value={scope}
              disabled={pending > 0}
              onChange={(event) => setScope(event.target.value)}
            >
              <option value="stable">Stable documents</option>
              <option value="horse">First horse documents</option>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${formId}-permission`}>
              Sample permissions
            </FieldLabel>
            <Select
              id={`${formId}-permission`}
              value={permission}
              disabled={pending > 0}
              onChange={(event) => setPermission(event.target.value)}
            >
              <option value="manager">Manage documents</option>
              <option value="viewer">View and download only</option>
            </Select>
          </Field>
        </FieldGrid>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={pending > 0}
            onClick={() => {
              releaseUrls()
              setDocuments([])
              setRevision((value) => value + 1)
              setMessage('Empty sample. No live document changed.')
            }}
          >
            Show empty sample
          </Button>
          <Button
            variant="outline"
            disabled={pending > 0}
            onClick={() => {
              releaseUrls()
              setDocuments(createSamples())
              setRevision((value) => value + 1)
              setMessage('Original sample restored. No live document changed.')
            }}
          >
            Reset sample documents
          </Button>
        </div>
        <p role="status">{message}</p>
      </DashboardSection>
      <DocumentsCard
        title={scope === 'horse' ? 'Documents' : undefined}
        description={
          scope === 'horse' ? 'Sample paperwork for this horse.' : undefined
        }
        documents={filtering.items}
        emptyMessage={
          filtering.isFiltering
            ? 'No documents match these filters.'
            : 'No sample documents have been added.'
        }
        listToolbar={
          <ListFilterControls
            config={filterConfig}
            filtering={filtering}
            hideWhenEmpty
            sticky={scope === 'stable'}
          />
        }
        chrome="cards"
        onRemove={removeDocument}
      />
    </DashboardPage>
  )
}

function getLabHorseOptions(data: DashboardLabData): Array<LabHorseOption> {
  if (data.horses.length > 0) return data.horses

  return [{ _id: 'lab-horse-juniper' as Id<'horses'>, name: 'Juniper' }]
}

function createLabDocuments(
  data: DashboardLabData,
  horseOptions: Array<LabHorseOption>,
  sampleFileUrl: () => string,
): Array<DocumentListItem> {
  const primaryHorse = horseOptions[0]
  const secondaryHorse = horseOptions[1]
  const nextEvent = data.events[0]
  const createdBy = data.stable.ownerId
  const createdAt = Date.now()
  const inputs: Array<LabDocumentInput> = [
    {
      id: 'passport-scan',
      type: 'passport',
      fileName: `${primaryHorse.name} sample passport notes.txt`,
      contentType: 'text/plain',
      notes: 'Fictional plain-text sample, not an actual passport scan.',
      horse: primaryHorse,
      fileUrl: sampleFileUrl(),
    },
    {
      id: 'vaccination-proof',
      type: 'vaccination',
      fileName: 'Sample vaccination notes.txt',
      contentType: 'text/plain',
      notes:
        'Fictional plain-text sample, not an actual vaccination certificate.',
      horse: primaryHorse,
      event: nextEvent,
      fileUrl: sampleFileUrl(),
    },
    {
      id: 'insurance-summary',
      type: 'insurance',
      fileName: `${data.stable.name} insurance summary`,
      notes:
        'Metadata-only reminder to upload the renewed cover note before the policy review.',
      fileState: 'metadata-only',
    },
    {
      id: 'farrier-note',
      type: 'farrier',
      fileName: `${secondaryHorse?.name ?? primaryHorse.name} shoeing notes.txt`,
      contentType: 'text/plain',
      notes:
        'Shoeing notes from the latest reset, including next-cycle recommendations.',
      horse: secondaryHorse ?? primaryHorse,
      fileUrl: sampleFileUrl(),
    },
    {
      id: 'image-reference',
      type: 'other',
      fileName: 'Paddock Pilot reference mark.svg',
      contentType: 'image/svg+xml',
      notes: 'Image-file specimen for the canonical document preview path.',
      fileUrl: '/paddock-pilot-mark.svg',
    },
    {
      id: 'unavailable-scan',
      type: 'vet_report',
      fileName: 'Juniper.follow-up.scan.FINAL.PNG',
      contentType: 'image/png',
      size: 3_240_000,
      notes:
        'The record remains visible while the uploaded file is unavailable.',
      horse: primaryHorse,
      fileState: 'unavailable',
    },
    {
      id: 'long-file-name',
      type: 'dental',
      fileName:
        'Sample annual dental examination and follow-up recommendations for the next routine visit.txt',
      contentType: 'text/plain',
      horse: primaryHorse,
      fileUrl: sampleFileUrl(),
      canManage: false,
    },
  ]

  return inputs.map((input, index) => ({
    document: createLabDocument(
      data,
      input,
      createdBy,
      createdAt - index * 86_400_000,
    ),
    horseName: input.horse?.name,
    eventTitle: input.event?.title,
    fileUrl: input.fileUrl,
    fileState:
      input.fileState ?? (input.fileUrl ? 'available' : 'metadata-only'),
    canManage: input.canManage ?? true,
  }))
}

function createLabDocument(
  data: DashboardLabData,
  input: LabDocumentInput,
  createdBy: Id<'users'>,
  createdAt: number,
): Doc<'stableDocuments'> {
  return {
    _id: `lab-document-${input.id}` as Id<'stableDocuments'>,
    _creationTime: createdAt,
    stableId: data.stable._id,
    horseId: input.horse?._id,
    eventId: input.event?._id,
    storageId: input.fileUrl
      ? (`lab-storage-${input.id}` as Id<'_storage'>)
      : undefined,
    type: input.type,
    fileName: input.fileName,
    contentType: input.contentType,
    size: input.size,
    notes: input.notes,
    createdBy,
    createdAt,
  }
}
