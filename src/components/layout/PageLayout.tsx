import { AppMain, AppMainContent } from './AppShell'

type PageLayoutProps = {
  children: React.ReactNode
  width?: 'default' | 'wide'
}

export function PageLayout({ children, width = 'wide' }: PageLayoutProps) {
  return (
    <AppMain>
      <AppMainContent width={width}>{children}</AppMainContent>
    </AppMain>
  )
}
