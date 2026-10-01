import { useEffect } from 'react'
import { LocaleProvider, useLocale, useT } from '#/i18n/LocaleProvider'
import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { appBodyClassName } from '#/components/layout/AppShell'
import { ApplicationRouteShell } from '#/components/layout/ApplicationRouteShell'
import { RouteStatusAlert } from '#/components/layout/RouteStatusAlert'
import { ButtonLink } from '#/components/ui/button'
import { Toaster } from '#/components/ui/sonner'
import { TooltipProvider } from '#/components/ui/tooltip'
import {
  AppUserStateGate,
  AppUserStateProvider,
} from '#/components/layout/AppUserStateProvider'
import { isLandingLabPath } from '#/lib/landingLab'
import {
  SITE_DESCRIPTION,
  SITE_SOCIAL_IMAGE,
  SITE_TITLE,
  SITE_URL,
} from '#/lib/site'

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
        title: SITE_TITLE,
      },
      {
        name: 'description',
        content: SITE_DESCRIPTION,
      },
      {
        property: 'og:title',
        content: SITE_TITLE,
      },
      {
        property: 'og:description',
        content: SITE_DESCRIPTION,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: SITE_URL,
      },
      {
        property: 'og:image',
        content: SITE_SOCIAL_IMAGE,
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: SITE_TITLE,
      },
      {
        name: 'twitter:description',
        content: SITE_DESCRIPTION,
      },
      {
        name: 'twitter:image',
        content: SITE_SOCIAL_IMAGE,
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'icon',
        href: '/paddock-pilot-mark.svg',
        type: 'image/svg+xml',
      },
    ],
  }),
  ssr: false,
  shellComponent: RootDocument,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function NotFoundPage() {
  const t = useT()
  return (
    <RouteStatusAlert
      title={t('common.notFoundTitle')}
      description={t('common.notFoundDescription')}
      width="narrow"
      actions={<ButtonLink to="/">{t('common.home')}</ButtonLink>}
    />
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <LocalizedRootDocument>{children}</LocalizedRootDocument>
    </LocaleProvider>
  )
}

function LocalizedRootDocument({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale()
  const { pathname } = useLocation()
  const t = useT()
  useEffect(() => {
    const description = t('landing.siteDescription')
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ]) {
      document.head
        .querySelector(selector)
        ?.setAttribute('content', description)
    }
  }, [locale, pathname, t])
  const isLandingLab = isLandingLabPath(pathname)

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>

      <body className={appBodyClassName}>
        <ConvexProviderWithClerk>
          {isLandingLab ? (
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          ) : (
            <AppUserStateProvider>
              <TooltipProvider>
                <ApplicationRouteShell pathname={pathname}>
                  <AppUserStateGate>{children}</AppUserStateGate>
                </ApplicationRouteShell>

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
          )}
        </ConvexProviderWithClerk>
        <Scripts />
      </body>
    </html>
  )
}
