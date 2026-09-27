import { StableProfileForm } from '#/components/stables/StableProfileForm'
import { showAppSuccessToast } from '#/components/ui/sonner'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'

export const Route = createFileRoute('/stables/_layout/create')({
  component: RouteComponent,
})

function RouteComponent() {
  const addStable = useMutation(api.stables.add)
  const navigate = useNavigate()
  return (
    <StableProfileForm
      mode="create"
      save={(values) => addStable(values)}
      onAcknowledged={(_, values) =>
        showAppSuccessToast({
          title: 'Stable created',
          description: <p>{values.name} is ready.</p>,
        })
      }
      onSaved={(stableId) =>
        navigate({ to: '/onboarding', search: { stableId } })
      }
    />
  )
}
