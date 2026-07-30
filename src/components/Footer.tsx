import { AppFooter, AppFooterInner } from './layout/AppShell'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <AppFooter>
      <AppFooterInner>
        <p className="m-0 text-sm">
          &copy; {year} PineappleDev. All rights reserved.
        </p>
      </AppFooterInner>
    </AppFooter>
  )
}
