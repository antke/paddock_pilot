import { useT } from '#/i18n/LocaleProvider'
import { BuildingsIcon } from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import {
  DetailDisplayField,
  DetailGrid,
} from '#/components/dashboard/DetailBlocks'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'

export function StableIntroductionStep({
  stable,
  onContinue,
}: {
  stable: Doc<'stables'>
  onContinue: () => void | Promise<void>
}) {
  const t = useT()

  return (
    <div className="grid gap-5">
      <Alert role="note">
        <BuildingsIcon aria-hidden="true" />
        <AlertTitle>
          {t('onboarding.connectedStable', { name: stable.name })}
        </AlertTitle>
        <AlertDescription>{t('onboarding.connectedHelp')}</AlertDescription>
      </Alert>

      <DetailGrid>
        <DetailDisplayField
          label={t('onboarding.location')}
          value={stable.location}
        />
        <DetailDisplayField
          label={t('onboarding.primaryContact')}
          value={stable.contactName || t('onboarding.notAddedYet')}
        />
        <DetailDisplayField
          label={t('onboarding.contactPhone')}
          value={stable.contactPhone || t('onboarding.notAddedYet')}
        />
        <DetailDisplayField
          label={t('onboarding.openingHours')}
          value={stable.openingHours || t('onboarding.notAddedYet')}
        />
      </DetailGrid>

      {stable.yardRules && (
        <DetailDisplayField
          label={t('onboarding.yardRules')}
          value={stable.yardRules}
        />
      )}

      <DashboardActions align="end">
        <Button type="button" onClick={onContinue}>
          {t('onboarding.continue')}
        </Button>
      </DashboardActions>
    </div>
  )
}
