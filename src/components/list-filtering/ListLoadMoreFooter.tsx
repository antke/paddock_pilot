import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { Button } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'
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
  loadingLabel = 'Loading...',
  className,
}: ListLoadMoreFooterProps) {
  if (status === 'LoadingFirstPage' || status === 'Exhausted') return null

  const isLoading = status === 'LoadingMore'

  return (
    <DashboardActions align="center" className={cn('pt-2', className)}>
      <Button
        type="button"
        variant="secondary"
        disabled={status !== 'CanLoadMore'}
        onClick={() => onLoadMore(pageSize)}
      >
        {isLoading && (
          <Spinner
            data-icon="inline-start"
            role="presentation"
            aria-hidden={true}
          />
        )}
        {isLoading ? loadingLabel : loadMoreLabel}
      </Button>
    </DashboardActions>
  )
}
