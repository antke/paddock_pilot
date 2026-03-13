// src/integrations/clerk/provider.tsx
import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
if (!CONVEX_URL) throw new Error('Add your Convex URL to the .env.local file')

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY)
  throw new Error('Add your Clerk Publishable Key to the .env.local file')

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
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <ConvexProviderWithClerk
          client={convexQueryClient.convexClient}
          useAuth={useAuth}
        >
          {children}
        </ConvexProviderWithClerk>
      </QueryClientProvider>
    </ClerkProvider>
  )
}
