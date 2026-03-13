import { useAuth } from '@clerk/tanstack-react-start'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL
if (!CONVEX_URL) console.error('missing envar VITE_CONVEX_URL')

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

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConvexProviderWithClerk
        client={convexQueryClient.convexClient}
        useAuth={useAuth}
      >
        {children}
      </ConvexProviderWithClerk>
    </QueryClientProvider>
  )
}
