import { useMutation, usePaginatedQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { DashboardUpdates } from '#/components/dashboard/DashboardUpdates'
import { Button, ButtonLink } from '#/components/ui/button'
import { showAppSuccessToast } from '#/components/ui/sonner'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import { useT } from '#/i18n/LocaleProvider'

export function StableUpdates({
  stableId,
  preview = false,
}: {
  stableId: Id<'stables'>
  preview?: boolean
}) {
  const t = useT()
  const { today } = useLocalDateContext()
  const { results, status, loadMore } = usePaginatedQuery(
    api.stableUpdates.list,
    { stableId, today },
    { initialNumItems: preview ? 3 : 20 },
  )
  const add = useMutation(api.stableUpdates.add)
  const update = useMutation(api.stableUpdates.update)
  const remove = useMutation(api.stableUpdates.remove)
  return (
    <DashboardUpdates
      updates={(preview ? results.slice(0, 3) : results).map((item) => ({
        ...item,
        id: item._id,
      }))}
      preview={preview}
      loading={status === 'LoadingFirstPage'}
      viewAll={
        <ButtonLink
          to="/stables/$stableId/stable"
          params={{ stableId }}
          search={{ tab: 'yard' }}
          variant="ghost"
        >
          {t('stableUpdates.viewAll')}
        </ButtonLink>
      }
      more={
        !preview && status !== 'Exhausted' && status !== 'LoadingFirstPage' ? (
          <Button
            variant="outline"
            disabled={status === 'LoadingMore'}
            onClick={() => loadMore(20)}
          >
            {status === 'LoadingMore'
              ? t('stableUpdates.loading')
              : t('stableUpdates.more')}
          </Button>
        ) : undefined
      }
      onSave={async (id, values) => {
        if (id) await update({ id: id as Id<'stableUpdates'>, ...values })
        else await add({ stableId, ...values })
        showAppSuccessToast({ title: t('stableUpdates.saved') })
      }}
      onRemove={async (id) => {
        await remove({ id: id as Id<'stableUpdates'> })
        showAppSuccessToast({ title: t('stableUpdates.removed') })
      }}
    />
  )
}
