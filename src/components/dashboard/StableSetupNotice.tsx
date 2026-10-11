import { useState } from 'react'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useT } from '#/i18n/LocaleProvider'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button, ButtonLink } from '#/components/ui/button'
import { showAppErrorToast } from '#/components/ui/sonner'
import { DashboardActions } from './DashboardActions'

/** Shared, optional setup prompt for either stable dashboard entry point. */
export function StableSetupNotice({ stableId }: { stableId: Id<'stables'> }) {
  const t = useT()
  const { data } = useSuspenseQuery(
    convexQuery(api.stableSetup.get, { stableId }),
  )
  const dismiss = useMutation(api.stableSetup.dismissPrompt)
  const [pending, setPending] = useState(false)
  const missing = data?.steps.filter((step) => !step.complete) ?? []
  if (!data || data.dismissed || missing.length === 0) return null

  return (
    <Alert role="note">
      <AlertDescription>
        {t('stableSetup.remaining', {
          step: t(`stableSetup.tasks.${missing[0].id}`),
        })}
      </AlertDescription>
      <DashboardActions align="start">
        <ButtonLink
          to="/stables/$stableId/welcome"
          params={{ stableId }}
          variant="outline"
          size="sm"
        >
          {t('stableSetup.reviewSetup')}
        </ButtonLink>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={async () => {
            if (pending) return
            setPending(true)
            try {
              await dismiss({ stableId })
            } catch {
              showAppErrorToast()
            } finally {
              setPending(false)
            }
          }}
        >
          {t('stableSetup.dismissPrompt')}
        </Button>
      </DashboardActions>
    </Alert>
  )
}
