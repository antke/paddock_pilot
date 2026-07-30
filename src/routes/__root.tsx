import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { AppShell, appBodyClassName } from '#/components/layout/AppShell'
import { PageLayout } from '#/components/layout/PageLayout'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { ButtonLink } from '#/components/ui/button'
import { Toaster } from '#/components/ui/sonner'
import { TooltipProvider } from '#/components/ui/tooltip'
import { AppUserStateProvider } from '#/components/layout/AppUserStateProvider'

import ConvexProviderWithClerk from '../integrations/clerk/provider'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'light';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

const RootComponent = () => {
  return <Outlet />
}

export const Route = createRootRoute({
  beforeLoad: async () => {},
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'PaddockPilot',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  ssr: false,
  shellComponent: RootDocument,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function NotFoundPage() {
  return (
    <RouteStatusAlert
      title="Page not found"
      description="The page you are looking for does not exist or has moved."
      width="narrow"
      actions={<ButtonLink to="/">Go home</ButtonLink>}
    />
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>

      <body className={appBodyClassName}>
        <ConvexProviderWithClerk>
          <AppUserStateProvider>
            <TooltipProvider>
              <AppShell>
                <Header />

                <PageLayout>{children}</PageLayout>

                <Footer />
              </AppShell>

              <Toaster />

              {import.meta.env.DEV ? (
                <TanStackDevtools
                  config={{
                    position: 'bottom-right',
                  }}
                  plugins={[
                    {
                      name: 'TanStack Router',
                      render: <TanStackRouterDevtoolsPanel />,
                    },
                  ]}
                />
              ) : null}
            </TooltipProvider>
          </AppUserStateProvider>
        </ConvexProviderWithClerk>
        <Scripts />
      </body>
    </html>
  )
}
