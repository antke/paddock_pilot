import { useT } from '#/i18n/LocaleProvider'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { Button } from '#/components/ui/button'
import { ActionFeedback } from '#/components/ui/action-feedback'
import { cn } from '#/lib/utils'

export type ListPaginationStatus =
  'LoadingFirstPage' | 'CanLoadMore' | 'LoadingMore' | 'Exhausted'

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
  loadMoreLabel,
  loadingLabel,
  className,
}: ListLoadMoreFooterProps) {
  const t = useT()

  if (status === 'LoadingFirstPage' || status === 'Exhausted') return null

  const isLoading = status === 'LoadingMore'

  return (
    <DashboardActions align="center" className={cn('pt-2', className)}>
      <Button
        type="button"
        variant="secondary"
        disabled={status !== 'CanLoadMore'}
        aria-busy={isLoading || undefined}
        onClick={() => onLoadMore(pageSize)}
      >
        <ActionFeedback
          pending={isLoading}
          label={loadMoreLabel ?? t('uiRemainder.loadMore')}
          pendingLabel={loadingLabel ?? t('uiRemainder.loading')}
        />
      </Button>
    </DashboardActions>
  )
}
