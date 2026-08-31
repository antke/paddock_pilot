import {
  FileIcon,
  ImageSquareIcon,
  UploadSimpleIcon,
  XIcon,
} from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import type { ComponentProps, DragEvent, ReactNode, Ref } from 'react'

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from '#/components/ui/attachment'
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLabelRow,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'
import { FormHelpTooltip } from './FormHelpTooltip'

type FileUploadFieldProps = Omit<
  ComponentProps<typeof Input>,
  'children' | 'onChange' | 'ref' | 'type' | 'width'
> & {
  errors?: Array<{ message?: string } | undefined>
  files?: FileList | null
  controlRef?: Ref<HTMLButtonElement>
  help?: ReactNode
  helpLabel?: string
  inputRef?: Ref<HTMLInputElement>
  kind?: 'file' | 'image'
  label: ReactNode
  onFilesChange: (files: FileList | null) => void
  uploadDescription?: ReactNode
  uploadLabel?: ReactNode
  width?: 'default' | 'full'
}

export function FileUploadField({
  errors,
  files,
  controlRef,
  help,
  helpLabel,
  inputRef,
  kind = 'file',
  label,
  onFilesChange,
  required = false,
  uploadDescription,
  uploadLabel,
  width = 'default',
  className,
  ...props
}: FileUploadFieldProps) {
  const invalid = Boolean(errors?.length)
  const internalInputRef = useRef<HTMLInputElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File>()
  const [previewUrl, setPreviewUrl] = useState<string>()

  useEffect(() => {
    if (files !== undefined) {
      setSelectedFile(files?.[0])
    }
  }, [files])

  useEffect(() => {
    if (
      !selectedFile?.type.startsWith('image/') ||
      typeof URL.createObjectURL !== 'function'
    ) {
      setPreviewUrl(undefined)
      return
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(nextPreviewUrl)

    return () => URL.revokeObjectURL(nextPreviewUrl)
  }, [selectedFile])

  const setInputRef = (element: HTMLInputElement | null) => {
    internalInputRef.current = element

    if (typeof inputRef === 'function') {
      inputRef(element)
    } else if (inputRef) {
      inputRef.current = element
    }
  }

  const selectFiles = (nextFiles: FileList | null) => {
    setSelectedFile(nextFiles?.[0])
    onFilesChange(nextFiles)
  }

  const clearSelection = () => {
    if (internalInputRef.current) {
      internalInputRef.current.value = ''
    }

    setSelectedFile(undefined)
    onFilesChange(null)
  }

  const openFilePicker = () => internalInputRef.current?.click()

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setDragging(false)

    if (!props.disabled && event.dataTransfer.files.length > 0) {
      selectFiles(event.dataTransfer.files)
    }
  }

  const typeLabel = selectedFile
    ? getFileTypeLabel(selectedFile, kind)
    : undefined

  return (
    <Field data-slot="file-upload-field" data-invalid={invalid}>
      <FieldLabelRow>
        <FieldLabel htmlFor={props.id}>{label}</FieldLabel>
        {help && (
          <FormHelpTooltip label={helpLabel ?? `About ${label}`}>
            {help}
          </FormHelpTooltip>
        )}
      </FieldLabelRow>

      {selectedFile ? (
        <Attachment
          state={invalid ? 'error' : 'done'}
          className={cn(
            'w-full flex-nowrap',
            width === 'default' ? 'max-w-xl' : 'max-w-none',
            className,
          )}
        >
          <AttachmentMedia
            variant={previewUrl ? 'image' : 'icon'}
            className="size-14"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="" />
            ) : kind === 'image' ? (
              <ImageSquareIcon aria-hidden={true} />
            ) : (
              <FileIcon aria-hidden={true} />
            )}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{selectedFile.name}</AttachmentTitle>
            <AttachmentDescription>
              {typeLabel} · {formatFileSize(selectedFile.size)} · Ready to
              upload
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              type="button"
              aria-label={`Remove ${selectedFile.name}`}
              disabled={props.disabled}
              onClick={clearSelection}
            >
              <XIcon weight="bold" aria-hidden={true} />
            </AttachmentAction>
          </AttachmentActions>
          <AttachmentTrigger
            ref={controlRef}
            type="button"
            aria-label={`Replace ${selectedFile.name}`}
            aria-invalid={invalid}
            disabled={props.disabled}
            onClick={openFilePicker}
          />
        </Attachment>
      ) : (
        <button
          ref={controlRef}
          type="button"
          data-slot="file-upload-dropzone"
          data-dragging={dragging}
          className={cn(
            'group/dropzone flex w-full items-center gap-4 rounded-control border border-dashed border-border bg-surface-elevated/35 p-3 text-left outline-none transition-colors',
            width === 'default' ? 'max-w-xl' : 'max-w-none',
            'hover:border-primary/60 hover:bg-primary/5 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring',
            'data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/10',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60',
            'aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20',
            className,
          )}
          aria-invalid={invalid}
          aria-required={required || undefined}
          disabled={props.disabled}
          onClick={openFilePicker}
          onDragEnter={(event) => {
            event.preventDefault()
            if (!props.disabled) setDragging(true)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setDragging(false)
            }
          }}
          onDrop={handleDrop}
        >
          <span className="flex size-16 shrink-0 items-center justify-center rounded-control border border-border-subtle bg-card text-primary transition-transform group-data-[dragging=true]/dropzone:scale-105 motion-reduce:transition-none">
            {kind === 'image' ? (
              <ImageSquareIcon
                className="size-7"
                weight="duotone"
                aria-hidden={true}
              />
            ) : (
              <UploadSimpleIcon
                className="size-6"
                weight="bold"
                aria-hidden={true}
              />
            )}
          </span>
          <span className="grid min-w-0 gap-1">
            <span className="text-sm font-bold text-foreground">
              {uploadLabel ??
                (kind === 'image'
                  ? 'Drop an image here or browse'
                  : 'Drop a file here or browse')}
            </span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              {uploadDescription ??
                (kind === 'image'
                  ? 'JPG, PNG or WEBP'
                  : 'Choose a file from your device')}
            </span>
          </span>
        </button>
      )}

      <Input
        {...props}
        ref={setInputRef}
        type="file"
        tabIndex={-1}
        className="sr-only"
        aria-invalid={invalid}
        aria-required={required || undefined}
        onChange={(event) => selectFiles(event.target.files)}
      />

      {invalid && <FieldError errors={errors} />}
    </Field>
  )
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function getFileTypeLabel(file: File, kind: 'file' | 'image') {
  const extension = file.name.split('.').pop()

  if (extension && extension !== file.name) {
    return extension.toUpperCase()
  }

  return kind === 'image' ? 'Image' : 'File'
}
