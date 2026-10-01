import { enUS, plPL } from '@clerk/localizations'
import { useLocale } from '#/i18n/LocaleProvider'
import { AccountLocaleBridge } from '#/i18n/AccountLocaleBridge'
// src/integrations/clerk/provider.tsx
import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { clerkAppearance } from './appearance'

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
if (!CONVEX_URL) throw new Error('Add your Convex URL to the .env.local file')

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY)
  throw new Error('Add your Clerk Publishable Key to the .env.local file')

// The upstream Polish resource leaves these account-menu labels untranslated.
const polishLocalization = {
  ...plPL,
  userButton: {
    ...plPL.userButton,
    action__openUserMenu: 'Otwórz menu konta',
    action__closeUserMenu: 'Zamknij menu konta',
  },
}

const convexQueryClient = new ConvexQueryClient(CONVEX_URL)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
})
convexQueryClient.connect(queryClient)

export default function ConvexClerkProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { locale } = useLocale()
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={clerkAppearance}
      localization={locale === 'pl' ? polishLocalization : enUS}
    >
      <QueryClientProvider client={queryClient}>
        <ConvexProviderWithClerk
          client={convexQueryClient.convexClient}
          useAuth={useAuth}
        >
          <AccountLocaleBridge />
          {children}
        </ConvexProviderWithClerk>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
