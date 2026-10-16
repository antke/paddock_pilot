import { createFileRoute, notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { AppShell } from '#/components/layout/AppShell'
import { WorkspaceNavigationView } from '#/components/layout/WorkspaceNavigationShell'
import { DrawerAccountView } from '#/integrations/clerk/DrawerAccount'
import { AccountPreferencesDialog } from '#/components/layout/AccountPreferencesDialog'
import { Button } from '#/components/ui/button'
import { AppMotionProvider } from '#/components/motion/appMotion'

export const Route = createFileRoute('/page-lab/navigation')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound()
  },
  component: NavigationFixture,
})

function NavigationFixture() {
  const [personal, setPersonal] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [notice, setNotice] = useState(
    'Local navigation fixture. Account operations use sample callbacks.',
  )
  return (
    <AppMotionProvider>
      <AppShell data-app-motion-scope>
        <WorkspaceNavigationView
          pathname={personal ? '/events' : '/stables/sample/events'}
          stables={Array.from({ length: 12 }, (_, i) => ({
            _id: i ? `sample-${i}` : 'sample',
            name: i
              ? `Sample yard ${i + 1}`
              : 'Oak Farm — rehabilitation and training yard',
          }))}
          canManageStable
          accountActions={<span>Jamie · Sample account</span>}
          compactAccountActions={<span>Sample</span>}
          renderDrawerAccount={(closeDrawer) => (
            <DrawerAccountView
              name="Jamie Alexandra Sample"
              email="jamie.alexandra.long-address@example.test"
              showManageStables={!personal}
              onNavigate={() => closeDrawer()}
              onPreferences={() => closeDrawer(() => setPreferencesOpen(true))}
              onManageAccount={() =>
                closeDrawer(() =>
                  setNotice(
                    'Sample account management opened. No live account changed.',
                  ),
                )
              }
              onSignOut={() =>
                Promise.reject(new Error('Sample sign-out failure'))
              }
            />
          )}
        />
        <main className="page-wrap py-8">
          <h1 className="font-display text-2xl">Navigation fixture</h1>
          <p role="status">{notice}</p>
          <Button
            variant="outline"
            onClick={() => setPersonal((value) => !value)}
          >
            {personal ? 'Use stable workspace' : 'Use personal workspace'}
          </Button>
        </main>
      </AppShell>
      <AccountPreferencesDialog
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
      />
    </AppMotionProvider>
  )
}
