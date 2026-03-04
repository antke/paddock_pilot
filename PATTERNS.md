# TanStack Router/Start Patterns

Quick reference for common patterns while building.

## Data Loading

### beforeLoad vs loader

```tsx
// beforeLoad: Sequential (parent→child), shared data, auth checks
// - Runs BEFORE all loaders
// - Return value merges into context (available to all child routes)
// - Use for: auth, shared data, route guards
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const user = await context.clerk.user
    if (!user) throw redirect({ to: '/login' })
    return { user } // Available in all child routes via context
  },
})

// loader: Parallel, route-specific data
// - Runs AFTER all beforeLoad complete
// - Return value is route-specific (NOT shared)
// - Use for: fetching data for this route only
export const Route = createFileRoute('/posts')({
  loader: async ({ context }) => {
    const posts = await context.convex.query.posts.list()
    return { posts }
  },
})
```

### Accessing Data in Components

```tsx
// From loader
const { posts } = Route.useLoaderData()

// From beforeLoad (via context)
const { user } = Route.useRouteContext()

// Search params
const { page, filter } = Route.useSearch()
```

## Protected Routes

### Layout Route Pattern

```tsx
// routes/_authenticated.tsx
// Underscore prefix = layout route (no URL segment)
export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    const { userId } = await context.clerk.session
    if (!userId) throw redirect({ to: '/login' })
    return { userId }
  },
  component: AuthenticatedLayout,
})

// routes/_authenticated/dashboard.tsx
// Automatically inherits auth check from parent
export const Route = createFileRoute('/_authenticated/dashboard')({
  component: Dashboard,
})
```

## Search Params with Zod

```tsx
import { z } from 'zod'

const searchSchema = z.object({
  page: z.number().optional().default(1),
  filter: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
})

export const Route = createFileRoute('/posts')({
  validateSearch: searchSchema,
  component: PostsPage,
})

function PostsPage() {
  // Fully typed!
  const { page, filter, sort } = Route.useSearch()

  // Navigate with search params
  const navigate = useNavigate()
  navigate({ to: '/posts', search: { page: 2, filter: 'draft' } })
}
```

## Convex Integration

### In Route Loader

```tsx
export const Route = createFileRoute('/horses/$horseId')({
  loader: async ({ context, params }) => {
    const horse = await context.convex.query.horses.get({
      id: params.horseId,
    })
    return { horse }
  },
})
```

### In Component (with TanStack Query)

```tsx
import { useQuery } from '@tanstack/react-query'

function HorseList() {
  const { data: horses } = useQuery({
    queryKey: ['horses'],
    queryFn: () => convex.query.horses.list(),
  })
}
```

## File Structure

```
src/
├── routes/              # File-based routing
│   ├── __root.tsx       # Root layout
│   ├── index.tsx        # /
│   ├── _authenticated.tsx    # Layout route (no URL)
│   └── _authenticated/
│       ├── dashboard.tsx    # /dashboard
│       └── settings.tsx     # /settings
├── components/          # Shared UI
│   └── ui/              # shadcn components
├── integrations/        # External services
│   ├── convex/
│   ├── clerk/
│   └── posthog/
└── lib/                 # Utilities
```

## Property Order (CRITICAL for Types)

```tsx
// Order matters for TypeScript inference!
export const Route = createFileRoute('/path')({
  component: MyComponent, // 1st
  loader: async () => {}, // 2nd
  beforeLoad: async () => {}, // 3rd
  validateSearch: schema, // 4th
  errorComponent: ErrorPage, // 5th
  pendingComponent: Loading, // 6th
})
```

## Navigation

```tsx
import { Link, useNavigate } from '@tanstack/react-router'

// Declarative
;<Link to="/posts/$postId" params={{ postId: 123 }}>
  View Post
</Link>

// Imperative
const navigate = useNavigate()
navigate({
  to: '/posts/$postId',
  params: { postId: 123 },
  search: { filter: 'published' },
})

// Redirect in loader/beforeLoad
throw redirect({ to: '/login' })
```

## Error Handling

```tsx
export const Route = createFileRoute('/posts')({
  loader: async () => {
    // Errors automatically caught by error boundary
    const posts = await fetchPosts()
    return { posts }
  },
  errorComponent: ({ error }) => (
    <div>Error loading posts: {error.message}</div>
  ),
  pendingComponent: () => <div>Loading...</div>,
})
```

## Context Pattern

```tsx
// Set up context in root route
export const Route = createRootRoute({
  beforeLoad: async () => {
    return {
      convex: convexClient,
      clerk: clerkClient,
      // Add other services here
    }
  },
})

// Access in any child route
export const Route = createFileRoute('/any-route')({
  beforeLoad: async ({ context }) => {
    const { convex, clerk } = context
    // ...
  },
})
```

## Best Practices

1. **URL for every state** - Make pages bookmarkable
2. **Use Suspense** - No manual loading states
3. **Colocate code** - Keep related files together
4. **Type safety** - Let TanStack infer types
5. **beforeLoad** = sequential, shared data, auth
6. **loader** = parallel, route-specific data
7. **Avoid `../../../`** - Use path aliases (`#/*`)
8. **Layout routes** - Use `_` prefix for shared layouts
9. **Prefetch on intent** - Already configured in router
10. **Keep loaders light** - Use caching for heavy operations

## Common Gotchas

- **beforeLoad blocks children** - Keep it fast
- **Loaders can't see each other** - Use beforeLoad for shared data
- **Return must be serializable** - No functions, class instances
- **Order of properties matters** - See above
- **Underscore routes don't add URL** - Just layouts
- **Dollar sign = dynamic segment** - `/posts/$postId`
