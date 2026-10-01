import { useT } from '#/i18n/LocaleProvider'
import { Show } from '@clerk/tanstack-react-start'

import { DashboardBrandWordmark } from './dashboard/DashboardDisplayHeading'
import { AppFooter, AppFooterInner } from './layout/AppShell'
import { ButtonLink } from './ui/button'

export default function Footer() {
  const t = useT()
  const year = new Date().getFullYear()

  return (
    <AppFooter className="py-6">
      <AppFooterInner className="grid gap-5 text-left sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-2">
          <DashboardBrandWordmark className="text-foreground">
            Paddock Pilot
          </DashboardBrandWordmark>
          <p className="m-0 max-w-md text-sm leading-6">
            {t('footer.description')}
          </p>
          <p className="m-0 text-xs">{t('footer.copyright', { year })}</p>
        </div>

        <nav
          aria-label={t('navigation.footer')}
          className="flex flex-wrap gap-1"
        >
          <ButtonLink to="/pricing" variant="ghost" size="sm">
            {t('navigation.plans')}
          </ButtonLink>
          <Show when="signed-out">
            <ButtonLink to="/sign-in/$" variant="ghost" size="sm">
              {t('navigation.signIn')}
            </ButtonLink>
            <ButtonLink to="/sign-up/$" variant="outline" size="sm">
              {t('navigation.createAccount')}
            </ButtonLink>
          </Show>
        </nav>
      </AppFooterInner>
    </AppFooter>
  )
}
