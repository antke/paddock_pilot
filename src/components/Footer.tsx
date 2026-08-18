import { Show } from '@clerk/tanstack-react-start'

import { DashboardBrandWordmark } from './dashboard/DashboardDisplayHeading'
import { AppFooter, AppFooterInner } from './layout/AppShell'
import { ButtonLink } from './ui/button'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <AppFooter className="py-6">
      <AppFooterInner className="grid gap-5 text-left sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-2">
          <DashboardBrandWordmark className="text-foreground">
            Paddock Pilot
          </DashboardBrandWordmark>
          <p className="m-0 max-w-md text-sm leading-6">
            Clearer horse records and care coordination for the yard.
          </p>
          <p className="m-0 text-xs">
            &copy; {year} Paddock Pilot. All rights reserved.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="flex flex-wrap gap-1">
          <ButtonLink to="/pricing" variant="ghost" size="sm">
            Plans
          </ButtonLink>
          <Show when="signed-out">
            <ButtonLink to="/sign-in/$" variant="ghost" size="sm">
              Sign in
            </ButtonLink>
            <ButtonLink to="/sign-up/$" variant="outline" size="sm">
              Create account
            </ButtonLink>
          </Show>
        </nav>
      </AppFooterInner>
    </AppFooter>
  )
}
