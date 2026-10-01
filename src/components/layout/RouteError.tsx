import { useT } from '#/i18n/LocaleProvider'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { ButtonLink } from '#/components/ui/button'
import { RouteQueryErrorAlert } from './RouteStatusAlert'

export function RouteError({ reset }: ErrorComponentProps) {
  const t = useT()
  return (
    <DashboardPage width="compact">
      <RouteQueryErrorAlert
        reset={reset}
        title={<h1>{t('common.pageErrorTitle')}</h1>}
        description={t('common.pageErrorDescription')}
        recoveryActions={
          <ButtonLink to="/" variant="outline">
            {t('common.home')}
          </ButtonLink>
        }
      />
    </DashboardPage>
  )
}
