import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { PageLayout } from '#/components/layout/PageLayout'
import { buttonVariants } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { TooltipProvider } from '#/components/ui/tooltip'

import ConvexProviderWithClerk from '../integrations/clerk/provider'

import appCss from '../styles.css?url'
import { Toaster } from 'sonner'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

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
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Page not found</CardTitle>
        <CardDescription>
          The page you are looking for does not exist or has moved.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link to="/" className={buttonVariants()}>
          Go home
        </Link>
      </CardContent>
    </Card>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>

      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-primary/20">
        <ConvexProviderWithClerk>
          <TooltipProvider>
            <Header />

            <PageLayout>{children}</PageLayout>

            <Toaster />
            <Footer />

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
        </ConvexProviderWithClerk>
        <Scripts />
      </body>
    </html>
  )
}
