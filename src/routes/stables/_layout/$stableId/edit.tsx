import { useT } from '#/i18n/LocaleProvider'
import { StableProfileForm } from '#/components/stables/StableProfileForm'
import {
  RouteEntityNotFoundAlert,
  RouteQueryErrorAlert,
  RouteStatusAlert,
} from '#/components/layout/RouteStatusAlert'
import { ButtonLink } from '#/components/ui/button'
import { showAppSuccessToast } from '#/components/ui/sonner'
import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'

export const Route = createFileRoute('/stables/_layout/$stableId/edit')({
  component: RouteComponent,
  errorComponent: EditStableError,
})

function RouteComponent() {
  const t = useT()

  const { stableId } = Route.useParams()

  const id = stableId as Id<'stables'>
  const { data: stable } = useSuspenseQuery(
    convexQuery(api.stables.get, { id }),
  )
  const { data: access } = useSuspenseQuery(
    convexQuery(api.stables.getAccess, { id }),
  )

  if (!stable) {
    return <RouteEntityNotFoundAlert entity="stable" />
  }
  if (!access.capabilities.canManageStable) {
    return (
      <RouteStatusAlert
        tone="warning"
        title={t('stables.readOnly')}
        description={t('stables.readOnlyHelp')}
        actions={
          <ButtonLink to="/stables/$stableId" params={{ stableId }}>
            {t('stables.return')}
          </ButtonLink>
        }
      />
    )
  }

  return <EditStableForm key={stable._id} stable={stable} />
}

type EditStableFormProps = {
  stable: Doc<'stables'>
}

function EditStableForm({ stable }: EditStableFormProps) {
  const t = useT()

  const nav = useNavigate()
  const updateStable = useMutation(api.stables.update)

  return (
    <StableProfileForm
      mode="edit"
      initialValues={stable}
      save={async (values) => {
        await updateStable({ ...values, id: stable._id })
        return stable._id
      }}
      onAcknowledged={(_, values) =>
        showAppSuccessToast({
          title: t('stables.updated'),
          description: (
            <p>{t('stables.updatedDescription', { name: values.name })}</p>
          ),
        })
      }
      onSaved={(stableId) =>
        nav({ to: '/stables/$stableId', params: { stableId } })
      }
    />
  )
}

function EditStableError({ reset }: ErrorComponentProps) {
  const t = useT()

  return (
    <RouteQueryErrorAlert
      reset={reset}
      title={t('stables.formLoadFailed')}
      description={t('stables.formLoadFailedHelp')}
    />
  )
}
