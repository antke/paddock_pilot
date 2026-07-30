import * as React from 'react'

import { textLabelVariants } from '#/components/ui/text-label'
import { cn } from '#/lib/utils.ts'

type TableCellAlign = 'left' | 'right'

type TableHeadProps = React.ComponentProps<'th'> & {
  align?: TableCellAlign
}

type TableCellProps = React.ComponentProps<'td'> & {
  align?: TableCellAlign
}

const tableCellAlignClassNames = {
  left: 'text-left',
  right: 'text-right',
} satisfies Record<TableCellAlign, string>

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        '[&_tr]:border-b [&_tr]:bg-surface-muted [&_tr:hover]:bg-surface-muted',
        className,
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t border-border-subtle bg-surface-muted font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'border-b border-border-subtle bg-card transition-colors hover:bg-primary/6 has-aria-expanded:bg-primary/8 data-[state=selected]:bg-primary/10',
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ align = 'left', className, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-11 px-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        tableCellAlignClassNames[align],
        textLabelVariants({
          size: 'xs',
          weight: 'semibold',
          tracking: 'wide',
        }),
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ align = 'left', className, ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-3 py-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        tableCellAlignClassNames[align],
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
