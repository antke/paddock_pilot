import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

export type ListPaginationStatus =
  | 'LoadingFirstPage'
  | 'CanLoadMore'
  | 'LoadingMore'
  | 'Exhausted'

type ListLoadMoreFooterProps = {
  status: ListPaginationStatus
  onLoadMore: (pageSize: number) => void
  pageSize: number
  loadMoreLabel?: string
  loadingLabel?: string
  className?: string
}

export function ListLoadMoreFooter({
  status,
  onLoadMore,
  pageSize,
  loadMoreLabel = 'Load more',
  loadingLabel = 'Loading…',
  className,
}: ListLoadMoreFooterProps) {
  if (status === 'LoadingFirstPage' || status === 'Exhausted') return null

  const isLoading = status === 'LoadingMore'

  return (
    <div className={cn('flex justify-center pt-2', className)}>
      <Button
        type="button"
        variant="secondary"
        disabled={status !== 'CanLoadMore'}
        onClick={() => onLoadMore(pageSize)}
      >
        {isLoading ? loadingLabel : loadMoreLabel}
      </Button>
    </div>
  )
}
