Welcome to your new TanStack Start app!

# Getting Started

To run this application:

```bash
pnpm install
pnpm dev
```

# Building For Production

To build this application for production:

```bash
pnpm build
```

## Deploying to Vercel

Vercel can deploy this TanStack Start application directly through Nitro; no
Next.js conversion or custom output directory is required. The repository pins
Node 24 and identifies the framework in `vercel.json`.

1. Create a production Convex deployment and generate a production deploy key
   with the `deployment:deploy` permission.
2. Import this repository in Vercel. Keep the repository build command; it runs
   `pnpm build:vercel`, deploys the Convex functions, injects
   `VITE_CONVEX_URL`, and then builds the TanStack application.
3. Add these Vercel environment variables for Production:

   ```text
   ENABLE_EXPERIMENTAL_COREPACK=1
   CONVEX_DEPLOY_KEY=prod:...
   VITE_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   VITE_SITE_URL=https://app.example.com
   ```

   `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` remain optional. Do not add
   Resend credentials to Vercel; email delivery runs inside Convex.

4. Set the production Convex environment before testing authenticated flows:

   ```text
   CLERK_FRONTEND_API_URL=https://...
   CLERK_WEBHOOK_SECRET=whsec_...
   EMAIL_PROVIDER=console
   APP_URL=https://app.example.com
   ```

5. Configure the Clerk webhook to send user lifecycle events to
   `https://<your-convex-site>/clerk-users-webhook`. Configure the production
   application domain in Clerk as well. Use a real custom application domain
   for authenticated testing instead of relying on the generated
   `*.vercel.app` address.

Preview deployments need a Convex preview deploy key and their own Clerk/Convex
environment strategy. Until that is configured, scope `CONVEX_DEPLOY_KEY` to
Production only.

Run the local release gate before pushing:

```bash
pnpm verify
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

### Removing Tailwind CSS

If you prefer not to use Tailwind CSS:

1. Remove the demo pages in `src/routes/demo/`
2. Replace the Tailwind import in `src/styles.css` with your own styles
3. Remove `tailwindcss()` from the plugins array in `vite.config.ts`
4. Uninstall the packages: `pnpm add @tailwindcss/vite tailwindcss --dev`

## Linting & Formatting

This project uses [eslint](https://eslint.org/) and [prettier](https://prettier.io/) for linting and formatting. Eslint is configured using [tanstack/eslint-config](https://tanstack.com/config/latest/docs/eslint). The following scripts are available:

```bash
pnpm lint
pnpm format
pnpm check
```

## Setting up Clerk

- Set the `VITE_CLERK_PUBLISHABLE_KEY` in your `.env.local`.

## Setting up Convex

- Set the `VITE_CONVEX_URL` and `CONVEX_DEPLOYMENT` environment variables in your `.env.local`. (Or run `pnpm dlx convex init` to set them automatically.)
- Run `pnpm dlx convex dev` to start the Convex server.

## Setting up transactional email

Email is sent from Convex actions through a provider adapter. Without email
configuration the `console` provider records deliveries as skipped and does not
contact an external service. Defining a Resend API key alone does not enable
delivery; `EMAIL_PROVIDER=resend` must be set explicitly.

For Resend, set these variables in the Convex deployment environment:

```text
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Paddock Pilot <notifications@notify.example.com>
RESEND_WEBHOOK_SECRET=whsec_...
APP_URL=https://example.com
```

Verify the sending domain in Resend, then register this Convex HTTP endpoint for
`email.sent`, `email.delivered`, `email.bounced`, `email.complained`,
`email.failed`, and `email.suppressed` events:

```text
https://<your-convex-site>/resend-email-webhook
```

Use `EMAIL_PROVIDER=console` explicitly when you want local email attempts to be
recorded without being sent. Failed transient deliveries are retried after 1,
5, and 30 minutes. Delivery and webhook records are retained for 30 days.

Application-owned lifecycle email currently covers account welcome/deletion,
stable invitations and acceptance, membership activation/removal, stable
archival, and event participation/change notifications. Clerk remains
responsible for authentication and billing emails.

## Testing access and future premium analytics

Stable membership and all operational features are subscription-independent.
The Analysis Centre is also open while testing. To enforce the future Premium
boundary later, set this in the Convex deployment environment:

```text
ENFORCE_PREMIUM_ANALYTICS=true
```

With enforcement enabled, an active `personal_pro` snapshot is required only
for the Analysis Centre.

## Shadcn

Add components using the latest version of [Shadcn](https://ui.shadcn.com/).

```bash
pnpm dlx shadcn@latest add button
```

## Setting up PostHog

1. Create a PostHog account at [posthog.com](https://posthog.com)
2. Get your Project API Key from [Project Settings](https://app.posthog.com/project/settings)
3. Set `VITE_POSTHOG_KEY` in your `.env.local`

### Optional Configuration

- `VITE_POSTHOG_HOST` - Set this if you're using PostHog Cloud EU (`https://eu.i.posthog.com`) or self-hosting

## Routing

This project uses [TanStack Router](https://tanstack.com/router) with file-based routing. Routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from '@tanstack/react-router'
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you render `{children}` in the `shellComponent`.

Here is an example layout that includes a header:

```tsx
import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My App' },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
          </nav>
        </header>
        {children}
        <Scripts />
      </body>
    </html>
  ),
})
```

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).

## Server Functions

TanStack Start provides server functions that allow you to write server-side code that seamlessly integrates with your client components.

```tsx
import { createServerFn } from '@tanstack/react-start'

const getServerTime = createServerFn({
  method: 'GET',
}).handler(async () => {
  return new Date().toISOString()
})

// Use in a component
function MyComponent() {
  const [time, setTime] = useState('')

  useEffect(() => {
    getServerTime().then(setTime)
  }, [])

  return <div>Server time: {time}</div>
}
```

## API Routes

You can create API routes by using the `server` property in your route definitions:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: () => json({ message: 'Hello, World!' }),
    },
  },
})
```

## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/people')({
  loader: async () => {
    const response = await fetch('https://swapi.dev/api/people')
    return response.json()
  },
  component: PeopleComponent,
})

function PeopleComponent() {
  const data = Route.useLoaderData()
  return (
    <ul>
      {data.results.map((person) => (
        <li key={person.name}>{person.name}</li>
      ))}
    </ul>
  )
}
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).

For TanStack Start specific documentation, visit [TanStack Start](https://tanstack.com/start).
